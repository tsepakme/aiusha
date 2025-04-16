import { Player } from '@/entities/player/model/player'
import { ColorType } from '@/entities/player/model/player'

export enum MatchResult {
  WIN = '+',
  LOSS = '-',
  DRAW = '=',
  DEFAULT_WIN = '1-0',
  DEFAULT_LOSS = '0-1',
  BYE = 'bye'
}

export type ResultType = MatchResult | undefined;

export type Match = {
  player1: Player
  player2?: Player
  result: ResultType
  player1Color: ColorType
  player2Color?: ColorType
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
