import { MatchResult } from "@/entities/tournament/model/tournament"

export enum PlayerColor {
  WHITE = 'white',
  BLACK = 'black',
  NONE = 'none'
}

export type Player = {
  id: number | string
  name: string
  rating?: number
  points: number
  buc1: number
  bucT: number
  opponents: (number | string)[]
  colorHistory: PlayerColor[]
  result: MatchResult | undefined
  resultHistory: (MatchResult | undefined)[]
}
