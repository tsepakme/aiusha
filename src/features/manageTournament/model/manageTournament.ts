import { Player } from '@/entities/player/model/player'
import { Tournament, Match } from '@/entities/tournament/model/tournament'
import { initializePlayers } from '@/features/addPlayer/model/addPlayer'
import { PlayerColor, MatchResult } from '@/shared/types/enums'

export function generateFirstRound(players: Player[]): Match[] {
  const sortedPlayers = [...players].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const matches: Match[] = [];
  
  const midpoint = Math.ceil(sortedPlayers.length / 2);
  const topHalf = sortedPlayers.slice(0, midpoint);
  const bottomHalf = sortedPlayers.slice(midpoint);
  
  for (let i = 0; i < topHalf.length; i++) {
    const player1 = topHalf[i];
    
    if (i < bottomHalf.length) {
      const player2 = bottomHalf[i];
      
      matches.push({
        player1,
        player2,
        result: undefined,
        player1Color: PlayerColor.WHITE,
        player2Color: PlayerColor.BLACK
      });
      
      player1.colorHistory.push(PlayerColor.WHITE);
      player2.colorHistory.push(PlayerColor.BLACK);
      player1.opponents.push(player2.id);
      player2.opponents.push(player1.id);
    } else {
      matches.push({
        player1,
        player1Color: PlayerColor.NONE,
        result: undefined
      });
      
      const updatedPlayer = {
        ...player1,
        points: player1.points + 1,
        resultHistory: [...player1.resultHistory, MatchResult.WIN],
        colorHistory: [...player1.colorHistory, PlayerColor.NONE]
      }
      
      const playerIndex = players.findIndex(p => p.id === player1.id);
      if (playerIndex !== -1) {
        players[playerIndex] = updatedPlayer;
      }
      
      matches[matches.length - 1].player1 = updatedPlayer;
    }
  }
  
  return matches;
}

export function generateSwissRound(players: Player[], timeLimit: number = 3000): Match[] {
  const startTime = Date.now()

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points || b.bucT - a.bucT)
  const matches: Match[] = []
  const unmatched: Player[] = []

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled;
  }

  while (sortedPlayers.length > 0) {
    if (Date.now() - startTime > timeLimit) {
      throw new Error('Timeout error')
    }

    const player = sortedPlayers.shift()!
    let opponent = sortedPlayers.find((p) => !player.opponents.includes(p.id))

    if (!opponent) {
      const shuffledPlayers = shuffleArray(sortedPlayers);
      opponent = shuffledPlayers.find((p) => !player.opponents.includes(p.id))
    }

    if (!opponent && sortedPlayers.length > 0) {
      opponent = sortedPlayers[0]
    }

    if (opponent) {
      const player1Color =
        player.colorHistory[player.colorHistory.length - 1] === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE
      const player2Color = player1Color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE

      matches.push({ player1: player, player2: opponent, player1Color: player1Color, player2Color: player2Color, result: undefined })
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
    const outsider = unmatched.pop()!;
    const updatedOutsider = {
      ...outsider,
      points: outsider.points + 1,
      resultHistory: [...outsider.resultHistory, MatchResult.WIN],
      colorHistory: [...outsider.colorHistory, PlayerColor.NONE]
    };
    
    matches.push({ 
      player1: updatedOutsider, 
      player1Color: PlayerColor.NONE,
      result: MatchResult.WIN 
    });
    
    const playerIndex = players.findIndex(p => p.id === outsider.id);
    if (playerIndex !== -1) {
      players[playerIndex] = updatedOutsider;
    }
  }

  return matches
}

export function updateResults(
  matches: Match[],
  results: (MatchResult | undefined)[],
  players: Player[],
  allMatches: Match[]
): void {
  matches.forEach((match, index) => {
    const result = results[index];
    match.result = result;
    if (result === MatchResult.WIN) {
      match.player1.points += 1;
      match.player1.resultHistory.push(MatchResult.WIN);
      if (match.player2) {
        match.player2.resultHistory.push(MatchResult.LOSS);
      }
    } else if (result === MatchResult.LOSS) {
      if (match.player2) {
        match.player2.points += 1;
        match.player2.resultHistory.push(MatchResult.WIN);
        match.player1.resultHistory.push(MatchResult.LOSS);
      }
    } else if (result === MatchResult.DRAW) {
      if (match.player2) {
        match.player1.points += 0.5;
        match.player2.points += 0.5;
        match.player1.resultHistory.push(MatchResult.DRAW);
        match.player2.resultHistory.push(MatchResult.DRAW);
      }
    }
  });

  calculateBuchholz(players, allMatches);
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
