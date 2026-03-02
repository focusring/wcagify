import type scToSlug from './data/sc-to-slug.json'

export type WcagVersion = keyof typeof scToSlug
export type Language = keyof (typeof scToSlug)['2.2']
export type Level = 'A' | 'AA' | 'AAA'
export type Principle = 'perceivable' | 'operable' | 'understandable' | 'robust'

export interface ScEntry {
  slug: string
  name: string
  level: Level
  obsolete?: boolean
}

export interface PrincipleCounts {
  perceivable: number
  operable: number
  understandable: number
  robust: number
}

export interface Scorecard {
  conforming: PrincipleCounts & { all: number }
  totals: PrincipleCounts & { all: number }
}
