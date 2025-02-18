export type ColorType = 'white' | 'black'
export type ResultType = '-' | '+' | '=' | unknown

export type Player = {
  id: number
  name: string
  rating?: number
  points: number
  buc1: number
  bucT: number
  opponents: number[]
  colorHistory: ColorType[]
  result: ResultType
  resultHistory: ResultType[]
}
