import { Player, PlayerColor } from '@/entities/player/model/player'

export enum MatchResult {
  WIN = '+',
  LOSS = '-',
  DRAW = '=',
}

export type Match = {
  player1: Player
  player2?: Player
  result: MatchResult | undefined
  player1Color: PlayerColor
  player2Color?: PlayerColor
}

export type Round = {
  matches: Match[]
  isComplete?: boolean
}

export enum TournamentSystem {
  SWISS = 'swiss',
  ROUND_ROBIN = 'roundRobin',
  ELIMINATION = 'elimination',
  BERGVALL = 'bergvall'
}

export type Tournament = {
  id?: string
  name?: string
  system?: TournamentSystem
  players: Player[]
  rounds: Round[]
  currentRound?: number
  isFinished?: boolean
}
