import { Player } from '@/entities/player/model/player'
import { ColorType } from '@/entities/player/model/player'

type ResultType = '-' | '+' | '=' | unknown

export type Match = {
  player1: Player
  player2?: Player
  result: ResultType
  player1Color: ColorType
  player2Color?: ColorType
}

export type Round = {
  matches: Match[]
}

export type Tournament = {
  players: Player[]
  rounds: Round[]
}
