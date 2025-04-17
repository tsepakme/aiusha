import { Player } from '@/entities/player/model/player'
import { PlayerColor, MatchResult, TournamentSystem } from '@/shared/types/enums'


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

export type Tournament = {
  id?: string
  name?: string
  system?: TournamentSystem
  players: Player[]
  rounds: Round[]
  currentRound?: number
  isFinished?: boolean
}
