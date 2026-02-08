import { Player } from '@/entities/player/model/player'
import { Tournament, Match } from '@/entities/tournament/model/tournament'
import { initializePlayers } from '@/features/addPlayer/model/addPlayer'
import { MatchResult } from '@/entities/tournament/model/tournament'

/** Deep-clone a player so mutations do not affect the original. */
function clonePlayer(p: Player): Player {
  return {
    ...p,
    opponents: [...p.opponents],
    colorHistory: [...p.colorHistory],
    resultHistory: [...p.resultHistory],
  }
}

/** Clone an array of players. */
function clonePlayers(players: Player[]): Player[] {
  return players.map(clonePlayer)
}

/** Map matches to use a new set of player references (by id). */
function mapMatchesToPlayers(
  matches: Match[],
  newPlayers: Player[]
): Match[] {
  const byId = new Map(newPlayers.map((p) => [p.id, p]))
  return matches.map((m) => ({
    ...m,
    player1: byId.get(m.player1.id) ?? m.player1,
    player2: m.player2 ? (byId.get(m.player2.id) ?? m.player2) : undefined,
  }))
}

/**
 * Generate first round matches. Pure: does not mutate inputs.
 * Returns new matches and updated player list (clones with round data).
 */
export function generateFirstRound(players: Player[]): { matches: Match[]; players: Player[] } {
  const cloned = clonePlayers(players)
  const matches: Match[] = []

  for (let i = 0; i < cloned.length; i += 2) {
    const p1 = cloned[i]
    if (cloned[i + 1]) {
      const p2 = cloned[i + 1]
      matches.push({
        player1: p1,
        player2: p2,
        result: undefined,
        player1Color: 'white',
        player2Color: 'black',
      })
      p1.colorHistory.push('white')
      p2.colorHistory.push('black')
      p1.opponents.push(p2.id)
      p2.opponents.push(p1.id)
    } else {
      matches.push({
        player1: p1,
        player1Color: 'white',
        result: undefined,
      })
      p1.points += 1
      p1.resultHistory.push(MatchResult.WIN)
    }
  }

  return { matches, players: cloned }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generate next Swiss round. Pure: does not mutate inputs.
 * Returns new matches and updated player list (clones with round data; bye player updated).
 */
export function generateSwissRound(
  players: Player[],
  timeLimit: number = 3000
): { matches: Match[]; players: Player[] } {
  const startTime = Date.now()
  const cloned = clonePlayers(players)
  const sortedPlayers = [...cloned].sort((a, b) => b.points - a.points || b.bucT - a.bucT)
  const matches: Match[] = []
  const unmatched: Player[] = []

  while (sortedPlayers.length > 0) {
    if (Date.now() - startTime > timeLimit) {
      throw new Error('Timeout error')
    }

    const player = sortedPlayers.shift()!
    let opponent = sortedPlayers.find((p) => !player.opponents.includes(p.id))

    if (!opponent) {
      const shuffledPlayers = shuffleArray(sortedPlayers)
      opponent = shuffledPlayers.find((p) => !player.opponents.includes(p.id))
    }

    if (!opponent && sortedPlayers.length > 0) {
      opponent = sortedPlayers[0]
    }

    if (opponent) {
      const player1Color =
        player.colorHistory[player.colorHistory.length - 1] === 'white' ? 'black' : 'white'
      const player2Color = player1Color === 'white' ? 'black' : 'white'

      matches.push({
        player1: player,
        player2: opponent,
        player1Color,
        player2Color,
        result: undefined,
      })
      sortedPlayers.splice(sortedPlayers.indexOf(opponent), 1)
      player.opponents.push(opponent.id)
      opponent.opponents.push(player.id)
      player.colorHistory.push(player1Color)
      opponent.colorHistory.push(player2Color)
    } else {
      unmatched.push(player)
    }
  }

  if (unmatched.length > 0) {
    const outsider = unmatched.pop()!
    const updatedOutsider: Player = {
      ...outsider,
      points: outsider.points + 1,
      resultHistory: [...outsider.resultHistory, MatchResult.WIN],
    }
    matches.push({
      player1: updatedOutsider,
      player1Color: 'white',
      result: MatchResult.WIN,
    })
    const idx = cloned.findIndex((p) => p.id === outsider.id)
    if (idx !== -1) {
      cloned[idx] = updatedOutsider
    }
  }

  return { matches, players: cloned }
}

function calculateBuchholz(players: Player[], matches: Match[]): void {
  players.forEach((player) => {
    const opponentPoints = matches.reduce((points, match) => {
      if (match.player1.id === player.id && match.player2) {
        const opponent = players.find((p) => p.id === match.player2!.id)
        if (opponent) points.push(opponent.points)
      } else if (match.player2 && match.player2.id === player.id) {
        const opponent = players.find((p) => p.id === match.player1.id)
        if (opponent) points.push(opponent.points)
      }
      return points
    }, [] as number[])

    player.bucT = opponentPoints.reduce((sum, points) => sum + points, 0)

    if (opponentPoints.length > 1) {
      const minPoints = Math.min(...opponentPoints)
      player.buc1 = opponentPoints.reduce((sum, points) => sum + points, 0) - minPoints
    } else {
      player.buc1 = player.bucT
    }
  })
}

/**
 * Apply round results and recalculate Buchholz. Pure: returns a new tournament.
 */
export function updateResults(
  tournament: Tournament,
  roundIndex: number,
  results: (MatchResult | undefined)[]
): Tournament {
  const round = tournament.rounds[roundIndex]
  if (!round) return tournament

  const clonedPlayers = clonePlayers(tournament.players)
  const byId = new Map(clonedPlayers.map((p) => [p.id, p]))

  const updatedRoundMatches: Match[] = round.matches.map((match, index) => {
    const result = results[index]
    const p1 = byId.get(match.player1.id)!
    const p2 = match.player2 ? byId.get(match.player2.id) : undefined

    if (result === MatchResult.WIN) {
      p1.points += 1
      p1.resultHistory.push(MatchResult.WIN)
      if (p2) {
        p2.resultHistory.push(MatchResult.LOSS)
      }
    } else if (result === MatchResult.LOSS && p2) {
      p2.points += 1
      p2.resultHistory.push(MatchResult.WIN)
      p1.resultHistory.push(MatchResult.LOSS)
    } else if (result === MatchResult.DRAW && p2) {
      p1.points += 0.5
      p2.points += 0.5
      p1.resultHistory.push(MatchResult.DRAW)
      p2.resultHistory.push(MatchResult.DRAW)
    }

    return {
      ...match,
      result,
      player1: p1,
      player2: p2,
    }
  })

  const allMatches = tournament.rounds.flatMap((r, i) =>
    i === roundIndex ? updatedRoundMatches : mapMatchesToPlayers(r.matches, clonedPlayers)
  )
  calculateBuchholz(clonedPlayers, allMatches)

  const newRounds = tournament.rounds.map((r, i) =>
    i === roundIndex ? { matches: updatedRoundMatches } : { matches: mapMatchesToPlayers(r.matches, clonedPlayers) }
  )

  return {
    ...tournament,
    players: clonedPlayers,
    rounds: newRounds,
  }
}

export function calculateRounds(numPlayers: number): number {
  return Math.ceil(Math.log2(numPlayers))
}

export function runTournament(
  namesAndRatings: { name: string; rating?: number }[]
): Tournament {
  const initialPlayers = initializePlayers(namesAndRatings)
  const { matches, players } = generateFirstRound(initialPlayers)
  return {
    players,
    rounds: [{ matches }],
  }
}
