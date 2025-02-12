import { Player } from '@/entities/player/model/player'
import { Tournament, Match } from '@/entities/tournament/model/tournament'
import { initializePlayers } from '@/features/addPlayer/model/addPlayer'

export function generateFirstRound(players: Player[]): Match[] {
  const matches: Match[] = []
  for (let i = 0; i < players.length; i += 2) {
    if (players[i + 1]) {
      matches.push({
        player1: players[i],
        player2: players[i + 1],
        player1Color: 'white',
        player2Color: 'black'
      })
      players[i].colorHistory.push('white')
      players[i + 1].colorHistory.push('black')
    } else {
      matches.push({
        player1: players[i],
        player1Color: 'white',
        result: 1
      })
      players[i].points += 1
    }
  }
  return matches
}

export function generateSwissRound(players: Player[]): Match[] {
  const sortedPlayers = [...players].sort(
    (a, b) => b.points - a.points || b.buchholzT - a.buchholzT
  )
  const matches: Match[] = []
  const unmatched: Player[] = []

  while (sortedPlayers.length > 0) {
    const player = sortedPlayers.shift()!
    const opponent = sortedPlayers.find((p) => !player.opponents.includes(p.id))

    if (opponent) {
      const player1Color =
        player.colorHistory[player.colorHistory.length - 1] === 'white' ? 'black' : 'white'
      const player2Color = player1Color === 'white' ? 'black' : 'white'

      matches.push({ player1: player, player2: opponent, player1Color, player2Color })
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
    outsider.points += 1
    matches.push({ player1: outsider, player1Color: 'white', result: 1 })
  }

  return matches
}

export function updateResults(matches: Match[], results: number[], players: Player[]): void {
  matches.forEach((match, index) => {
    const result = results[index]
    if (result === 1) {
      match.player1.points += 1
    } else if (result === -1 && match.player2) {
      match.player2.points += 1
    } else if (result === 0 && match.player2) {
      match.player1.points += 0.5
      match.player2.points += 0.5
    }
  })

  calculateBuchholz(players)
}

function calculateBuchholz(players: Player[]): void {
  players.forEach((player) => {
    player.buchholzT = player.opponents.reduce((sum, opponentId) => {
      const opponent = players.find((p) => p.id === opponentId)
      return sum + (opponent ? opponent.points : 0)
    }, 0)
  })
}

export function calculateRounds(numPlayers: number): number {
  return Math.ceil(Math.log2(numPlayers))
}

export function runTournament(namesAndRatings: { name: string; rating?: number }[]): Tournament {
  const players = initializePlayers(namesAndRatings)
  const tournament: Tournament = { players, rounds: [] }

  const firstRoundMatches = generateFirstRound(players)
  tournament.rounds.push({ matches: firstRoundMatches })

  return tournament
}
