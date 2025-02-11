import { Player } from '@/entities/player/model/player'

export type Match = {
  player1: Player
  player2?: Player
  result?: number
  player1Color: string
  player2Color?: string
}

export type Round = {
  matches: Match[]
}

export type Tournament = {
  players: Player[]
  rounds: Round[]
}
