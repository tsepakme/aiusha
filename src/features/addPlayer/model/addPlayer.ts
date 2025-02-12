import { Player } from '@/entities/player/model/player'

export function initializePlayers(namesAndRatings: { name: string; rating?: number }[]): Player[] {
  return namesAndRatings
    .map((data, index) => ({
      id: index + 1,
      name: data.name,
      rating: data.rating,
      points: 0,
      buc1: 0,
      bucT: 0,
      opponents: [],
      colorHistory: []
    }))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
}
