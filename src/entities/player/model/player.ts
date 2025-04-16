export type ColorType = 'white' | 'black'
export type ResultType = '-' | '+' | '=' | undefined

export type Player = {
  id: number | string
  name: string
  rating?: number
  points: number
  buc1: number
  bucT: number
  opponents: (number | string)[]
  colorHistory: ColorType[]
  result: ResultType
  resultHistory: ResultType[]
}
