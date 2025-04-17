import { MatchResult } from "@/entities/tournament/model/tournament"

export type ColorType = 'white' | 'black'

export type Player = {
  id: number | string
  name: string
  rating?: number
  points: number
  buc1: number
  bucT: number
  opponents: (number | string)[]
  colorHistory: ColorType[]
  result: MatchResult | undefined
  resultHistory: (MatchResult | undefined)[]
}
