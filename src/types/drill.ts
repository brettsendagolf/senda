import type { Capability, Equipment } from './venue'

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
 * The role a drill plays inside a session. warmup/build/pressure/test are the
 * session-shaping modes; `course` marks a standalone on-course drill (the Ghost
 * Nine set) that must never appear in a generated practice session.
 */
export type Mode = 'warmup' | 'build' | 'pressure' | 'test' | 'course'

/**
 * How a score is captured. `none` is a block with no score at all — the
 * composed warm-up loosener uses it.
 */
export type LogType = 'aggregate' | 'per_shot' | 'none'

/**
 * The nine skills a drill can train, independent of its category. Two chipping
 * drills can train completely different skills — the generator balances on this
 * as well as on shot type. Defined in data/skills.ts.
 */
export type SkillId =
  | 'strike'
  | 'distance_control'
  | 'start_line'
  | 'trajectory'
  | 'lie_adjustment'
  | 'club_selection'
  | 'routine'
  | 'pressure'
  | 'green_reading'

/**
 * Drills that need a bespoke input in the runner rather than a plain number:
 *  - carry_table: a 3×2 wedge-carry grid; the score is the largest gap.
 *  - random_yardage: draws a random target (25-75 yd) before each shot.
 */
export type SpecialDrill = 'carry_table' | 'random_yardage'

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
  requires: Capability[] //     ANY of these satisfies it
  equipment: Equipment[] //     ALL of these are needed (empty = just a club)
  minutes: number //            typical duration
  minMinutes: number //         shortest sensible version
  purpose: string //            one line, what it trains
  why?: string //               optional: why it matters
  setup: string[] //            numbered steps
  tip: string
  scoring: string //            how the score is derived, in words
  metric: Metric
  benchmarks: Benchmark[] //     targets by handicap band (may be sparse)
  logType: LogType
  primarySkill: SkillId //       the main skill trained
  skills: SkillId[] //           all skills trained, primary first
  focusArea?: string //          short label, e.g. "25–75 yd wedges"
  special?: SpecialDrill //      bespoke runner input, if any
  surfaceNote?: string //        honest caveat shown when the venue is mats-only
}
