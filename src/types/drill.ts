import type { Capability } from './venue'

/** Which part of the game a drill trains. */
export type Category =
  | 'putting'
  | 'chipping'
  | 'pitching'
  | 'wedges'
  | 'bunker'
  | 'full_swing'
  | 'driving'

/**
 * The role a drill plays inside a session. The generator shapes a session by
 * mode: warm up, build a skill, then apply it under pressure or in a test.
 */
export type Mode = 'warmup' | 'build' | 'pressure' | 'test'

/** How a score is captured: one aggregate number, or shot by shot. */
export type LogType = 'aggregate' | 'per_shot'

/** A target score for a handicap band, e.g. { band: 'Under 9', target: 7 }. */
export interface Benchmark {
  band: string // "Under 5", "Under 9", "Under 15", "Under 24"
  target: number
}

/** Describes the number a drill produces and how to read it. */
export interface Metric {
  label: string // "Inside 10 ft", "Attempts", "Points"
  max: number
  lowerIsBetter: boolean
}

export interface Drill {
  id: string
  name: string
  category: Category
  mode: Mode
  requires: Capability[] //  ANY of these satisfies it
  minutes: number //         typical duration
  minMinutes: number //      shortest sensible version
  purpose: string //         one line, what it trains
  why: string //             one or two sentences, why it matters
  setup: string[] //         numbered steps
  tip: string
  scoring: string //         how the score is derived, in words
  metric: Metric
  benchmarks: Benchmark[] //  targets by handicap band
  logType: LogType
}
