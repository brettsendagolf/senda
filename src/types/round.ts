/**
 * Round logging and the Game Profile — the diagnostic side of Senda.
 * Types follow Spec A (Diagnostic-and-Session-Engine §A2).
 */

/** The four areas the diagnosis ranks. */
export type Area = 'ott' | 'app' | 'short' | 'putt'

export type HandicapSource = 'whs' | 'estimated' | 'self_assessed'
export type Confidence = 'estimate' | 'low' | 'medium' | 'good'

/** Where a user says they are, chosen on the first onboarding screen. */
export type Experience = 'never' | 'learning' | 'handicap' | 'untracked'

/**
 * What onboarding captures — the inputs to the cold-start Game Profile and the
 * signal for how much beginner content to surface in Learn.
 */
export interface OnboardingProfile {
  experience: Experience
  handicap?: number
  /** Self-rated severity per area, 0 (rarely a problem) … 3 (my worst). */
  selfRatings: Partial<Record<Area, number>>
  /** Facilities the user can reach, as capability-group keys. */
  facilities: string[]
  completedAt: string
}

/** A logged round — everything recallable from memory in ~30 seconds. */
export interface Round {
  id: string
  playedAt: string // ISO date, local
  holesPlayed: number // 9..18
  par: number // par for the holes actually played
  grossScore: number

  // Tier 1 — required
  gir: number // greens in regulation, 0..holesPlayed
  penalties: number // penalty strokes + lost balls
  putts: number
  upDownMade: number
  upDownAttempts: number

  // Tier 2 — required but defaultable
  fairwaysHit: number
  fairwaysPossible: number
  threePutts: number

  // Tier 3 — optional deep dive (Plus)
  deepDive?: {
    teeMiss: { left: number; right: number; short: number; long: number }
    approachMiss: { u100: number; b100_150: number; b150_200: number; o200: number }
  }

  // WHS (only when computing an index)
  courseRating?: number
  slopeRating?: number
  pcc?: number

  /** Indoor/sim rounds are logged but excluded from the diagnosis. */
  indoor?: boolean
  source: 'manual' | 'import'
  createdAt: string
}

/** Everything downstream uses the 18-hole-equivalent form, never the raw round. */
export interface NormalisedRound {
  girN: number
  penaltiesN: number
  puttsN: number
  threePuttsN: number
  fairwayPct: number // ratio, not scaled
  udPct: number // ratio, not scaled
  scoreToPar: number
  puttResidual: number
  roundWeight: number // holesPlayed / 18, for confidence counting
}

export interface AreaResult {
  area: Area
  rank: 1 | 2 | 3 | 4 // 1 = worst = practice priority
  z: number // shrunk standardised residual, + = worse than peers
  shotsLostVsScratch: number | null // null when suppressed (low data)
  recoverableShots: number | null // null when suppressed
  headline: string
}

/** The output contract of the diagnostic engine (Spec A §A2.3). */
export interface GameProfile {
  computedAt: string
  roundsUsed: number // weighted count
  handicapUsed: number
  handicapSource: HandicapSource
  confidence: Confidence

  areas: AreaResult[]
  totalShotsLostVsScratch: number | null
  flags: string[]
}
