export type ColorType = 'white' | 'black'

export type Player = {
  id: number
  name: string
  rating?: number
  points: number
  buc1: number
  bucT: number
  opponents: number[]
  colorHistory: ColorType[]
}
