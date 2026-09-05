import type {
  Area,
  AreaResult,
  Confidence,
  GameProfile,
  HandicapSource,
  NormalisedRound,
  Round,
} from '@/types'

/**
 * Spec A — the Game Profile diagnostic engine. Pure logic, no React/storage.
 * Reproduces the §A5.5 worked example exactly (see diagnosis.test.ts).
 *
 * The engine ranks four areas by how many shots are *recoverable* against a
 * standard 5 handicap points better — deliberately NOT by raw shots lost, and
 * never using fairways-hit (flat across the handicap range) as a diagnostic.
 */

// --- Benchmark table (Spec A3) · Shot Scope, 90M+ shots -------------------
// [ H, girPct, pen, udPct, putts, fwPct, scoreToPar ]
const BENCH: readonly (readonly number[])[] = [
  [0, 61, 0.56, 47, 29.4, 50, 0.83],
  [5, 44, 0.91, 41, 30.2, 48, 6.33],
  [10, 36, 1.62, 31, 31.2, 49, 10.88],
  [15, 24, 2.45, 21, 33.1, 48, 17.38],
  [20, 17, 3.03, 20, 33.1, 46, 21.69],
  [25, 10, 4.67, 18, 33.8, 46, 28.97],
]

export interface Benchmark {
  girPct: number
  girHoles: number
  pen: number
  udPct: number // percent
  putts: number
  fwPct: number
  scoreToPar: number
}

/** Linear-interpolate a benchmark column by handicap; extrapolate beyond 25. */
function lerpCol(h: number, col: number): number {
  if (h <= BENCH[0][0]) return BENCH[0][col]
  for (let i = 0; i < BENCH.length - 1; i++) {
    const h1 = BENCH[i + 1][0]
    if (h <= h1) {
      const h0 = BENCH[i][0]
      const t = (h - h0) / (h1 - h0)
      return BENCH[i][col] + t * (BENCH[i + 1][col] - BENCH[i][col])
    }
  }
  // h > 25 — extrapolate from the last two rows
  const a = BENCH[BENCH.length - 2]
  const b = BENCH[BENCH.length - 1]
  const t = (h - a[0]) / (b[0] - a[0])
  return a[col] + t * (b[col] - a[col])
}

/** Benchmark at a handicap, clamped at 0, with the >25 caps from Spec A3. */
export function benchAt(handicap: number): Benchmark {
  const h = Math.max(0, handicap)
  const girPct = lerpCol(h, 1)
  const pen = Math.min(lerpCol(h, 2), 6.0) // cap penalties at 6/round
  const girHoles = Math.max(0.5, (girPct / 100) * 18) // floor GIR at 0.5 holes
  return {
    girPct,
    girHoles,
    pen,
    udPct: lerpCol(h, 3),
    putts: lerpCol(h, 4),
    fwPct: lerpCol(h, 5),
    scoreToPar: lerpCol(h, 6),
  }
}

// --- Calibration constants (Spec A5) --------------------------------------
/** Within-band standard deviations [C] — replace with observed once N > 500. */
const SD = { gir: 2.2, pen: 1.3, ud: 12.0, putt: 1.8 }
/** Base shot-allocation weights [D], anchored on Broadie's variance split. */
const BASE: Record<Area, number> = { app: 0.4, ott: 0.32, short: 0.11, putt: 0.17 }
const K = 0.5 // modulation strength [C]
const SCRATCH_SCORE = 0.83 // scratch benchmark score to par
/** Per-unit shot conversions for the "what it's worth" number [D]. */
const CONV = { pen: 1.15, gir: 0.55, ud: 0.85, putt: 1.0 }

/** Expected putts as a function of greens hit (OLS on the six rows, R²=0.957). */
export function expectedPutts(girN: number): number {
  return 34.778 - 0.517 * girN
}

// --- Normalisation (Spec A2.2) --------------------------------------------
export function normaliseRound(r: Round): NormalisedRound {
  const f = 18 / r.holesPlayed
  const girN = r.gir * f
  const puttsN = r.putts * f
  return {
    girN,
    penaltiesN: r.penalties * f,
    puttsN,
    threePuttsN: r.threePutts * f,
    fairwayPct: r.fairwaysHit / Math.max(1, r.fairwaysPossible),
    udPct: r.upDownMade / Math.max(1, r.upDownAttempts),
    scoreToPar: (r.grossScore - r.par) * f,
    puttResidual: puttsN - expectedPutts(girN),
    roundWeight: r.holesPlayed / 18,
  }
}

// --- Confidence (Spec A6) -------------------------------------------------
function confidenceFor(weightedN: number): Confidence {
  if (weightedN <= 0) return 'estimate'
  if (weightedN < 3) return 'low'
  if (weightedN < 10) return 'medium'
  return 'good'
}

const AREA_LABEL: Record<Area, string> = {
  ott: 'Off the tee',
  app: 'Approach',
  short: 'Short game',
  putt: 'Putting',
}

export interface DiagnoseOptions {
  rounds: Round[]
  handicap?: number
  handicapSource?: HandicapSource
  /** Onboarding: the area the user rated their worst, for the putting_myth flag. */
  selfAssessedWorst?: Area
  /** Onboarding cold-start z priors when there are no rounds yet. */
  priors?: Partial<Record<Area, number>>
  /** Stamp the result; injected so the engine stays pure/testable. */
  now?: string
}

/**
 * Estimate a handicap from score to par when none is given (Spec A8):
 * H ≈ (avgScoreToPar − 0.83) / 1.126, clamped 0..54.
 */
export function estimateHandicap(avgScoreToPar: number): number {
  return Math.max(0, Math.min(54, (avgScoreToPar - SCRATCH_SCORE) / 1.126))
}

/** Weighted mean of a value across rounds, weighting by roundWeight. */
function wMean(vals: number[], weights: number[]): number {
  const wsum = weights.reduce((a, b) => a + b, 0)
  if (wsum === 0) return 0
  return vals.reduce((a, v, i) => a + v * weights[i], 0) / wsum
}

export function computeGameProfile(opts: DiagnoseOptions): GameProfile {
  const now = opts.now ?? new Date().toISOString()
  // Indoor/sim rounds are logged but never diagnosed (Spec A8).
  const rounds = opts.rounds.filter((r) => !r.indoor)
  const normalised = rounds.map(normaliseRound)
  const weightedN = normalised.reduce((a, r) => a + r.roundWeight, 0)

  // Cold start: no rounds → rank from self-assessment priors, no shot figures.
  if (normalised.length === 0) {
    return coldStart(opts, now)
  }

  // Trimmed mean once n ≥ 5: drop the single best and worst score-to-par.
  let used = normalised
  if (normalised.length >= 5) {
    const sorted = [...normalised].sort((a, b) => a.scoreToPar - b.scoreToPar)
    used = sorted.slice(1, -1)
  }
  const weights = used.map((r) => r.roundWeight)

  const avgGirN = wMean(used.map((r) => r.girN), weights)
  const avgPenN = wMean(used.map((r) => r.penaltiesN), weights)
  const avgPuttsN = wMean(used.map((r) => r.puttsN), weights)
  const avgUdPct = wMean(used.map((r) => r.udPct), weights)
  const avgScoreToPar = wMean(used.map((r) => r.scoreToPar), weights)
  const puttResidual = avgPuttsN - expectedPutts(avgGirN)

  const handicap =
    opts.handicap ?? estimateHandicap(avgScoreToPar)
  const handicapSource: HandicapSource =
    opts.handicapSource ?? (opts.handicap === undefined ? 'estimated' : 'whs')

  const bench = benchAt(handicap)

  // Residuals — positive = worse than peers (Spec A5.1).
  const rawZ: Record<Area, number> = {
    app: (bench.girHoles - avgGirN) / SD.gir,
    ott: (avgPenN - bench.pen) / SD.pen,
    short: (bench.udPct - avgUdPct * 100) / SD.ud,
    putt: puttResidual / SD.putt,
  }

  // Shrinkage toward the population prior (Spec A5.2).
  const shrink = weightedN / (weightedN + 5)
  const z: Record<Area, number> = {
    app: rawZ.app * shrink,
    ott: rawZ.ott * shrink,
    short: rawZ.short * shrink,
    putt: rawZ.putt * shrink,
  }

  // Allocate shots lost (Spec A5.3).
  const rawW: Record<Area, number> = {
    app: Math.max(0.02, BASE.app * (1 + K * z.app)),
    ott: Math.max(0.02, BASE.ott * (1 + K * z.ott)),
    short: Math.max(0.02, BASE.short * (1 + K * z.short)),
    putt: Math.max(0.02, BASE.putt * (1 + K * z.putt)),
  }
  const wSum = rawW.app + rawW.ott + rawW.short + rawW.putt
  const total = avgScoreToPar - SCRATCH_SCORE
  const shotsLost: Record<Area, number> = {
    app: total * (rawW.app / wSum),
    ott: total * (rawW.ott / wSum),
    short: total * (rawW.short / wSum),
    putt: total * (rawW.putt / wSum),
  }

  // Recoverable — against a standard 5 handicap points better (Spec A5.4).
  const target = benchAt(Math.max(0, handicap - 5))
  const recoverable: Record<Area, number> = {
    ott: Math.max(0, avgPenN - target.pen) * CONV.pen,
    app: Math.max(0, target.girHoles - avgGirN) * CONV.gir,
    short:
      Math.max(0, target.udPct / 100 - avgUdPct) *
      Math.max(0, 18 - avgGirN) *
      CONV.ud,
    putt: Math.max(0, puttResidual - 0) * CONV.putt,
  }

  // Practice priority ranks on recoverable, not shots lost (Spec A5.5).
  const areasOrder = (['ott', 'app', 'short', 'putt'] as Area[]).sort(
    (a, b) => recoverable[b] - recoverable[a] || rawZ[b] - rawZ[a],
  )

  const lowData = weightedN < 3
  const areas: AreaResult[] = areasOrder.map((area, i) => ({
    area,
    rank: (i + 1) as 1 | 2 | 3 | 4,
    z: z[area],
    shotsLostVsScratch: lowData ? null : round2(shotsLost[area]),
    recoverableShots: lowData ? null : round2(recoverable[area]),
    headline: headlineFor(area, rawZ[area], recoverable[area], lowData),
  }))

  const flags = computeFlags({
    weightedN,
    rawZ,
    recoverable,
    avgUdPct,
    benchUdPct: bench.udPct,
    selfAssessedWorst: opts.selfAssessedWorst,
  })

  return {
    computedAt: now,
    roundsUsed: round2(weightedN),
    handicapUsed: round2(handicap),
    handicapSource,
    confidence: confidenceFor(weightedN),
    areas,
    totalShotsLostVsScratch: lowData ? null : round2(total),
    flags,
  }
}

/** Plain-English cold-start headlines, by how the user rated the area. */
const COLD_HEADLINE: Record<Area, [string, string]> = {
  // [rated a problem, rated fine]
  ott: ['Losing balls off the tee is costing you most.', 'Off the tee is steady enough for now.'],
  app: ['Getting to the green is where the shots go.', 'Your approach play is holding up.'],
  short: ['Chipping and pitching is the soft spot.', 'Your short game is in decent shape.'],
  putt: ['Putting is where you feel least sure.', "Putting isn't your main problem."],
}

/**
 * The top-ranked area is always where we start, so its line must never read as
 * a clean bill of health. When someone rates everything well, rank 1 is a
 * *relative* weak spot — say exactly that rather than "putting isn't your
 * problem" under a START HERE badge.
 */
function coldHeadline(area: Area, prior: number, rank: number): string {
  const flagged = prior > 0.3
  if (rank === 1 && !flagged) {
    return `${AREA_LABEL[area]} is your relative weak spot — nothing here looks badly wrong.`
  }
  return COLD_HEADLINE[area][flagged ? 0 : 1]
}

/** When nothing was self-rated, fall back to where amateurs typically lose most. */
const TYPICAL_HEADLINE: Record<Area, string> = {
  app: 'Approach play is where most amateurs lose the most.',
  ott: 'Penalty shots off the tee are the next biggest cost.',
  putt: 'Putting matters less than most golfers think.',
  short: 'Short game is worth less than the long game, but it is quick to fix.',
}

function coldStart(opts: DiagnoseOptions, now: string): GameProfile {
  const priors = opts.priors ?? {}
  const rated = Object.values(priors).some((v) => v !== undefined)

  // Nothing rated: rank by the population prior rather than inventing a focus
  // from four identical zeros.
  const order = rated
    ? (['ott', 'app', 'short', 'putt'] as Area[]).sort(
        (a, b) => (priors[b] ?? 0) - (priors[a] ?? 0),
      )
    : (['app', 'ott', 'putt', 'short'] as Area[])

  const areas: AreaResult[] = order.map((area, i) => ({
    area,
    rank: (i + 1) as 1 | 2 | 3 | 4,
    z: priors[area] ?? 0,
    shotsLostVsScratch: null,
    recoverableShots: null,
    headline: rated
      ? coldHeadline(area, priors[area] ?? 0, i + 1)
      : TYPICAL_HEADLINE[area],
  }))
  return {
    computedAt: now,
    roundsUsed: 0,
    handicapUsed: opts.handicap ?? 0,
    handicapSource: opts.handicapSource ?? 'self_assessed',
    confidence: 'estimate',
    areas,
    totalShotsLostVsScratch: null,
    flags: ['low_data'],
  }
}

function computeFlags(x: {
  weightedN: number
  rawZ: Record<Area, number>
  recoverable: Record<Area, number>
  avgUdPct: number
  benchUdPct: number
  selfAssessedWorst?: Area
}): string[] {
  const flags: string[] = []
  if (x.weightedN < 3) flags.push('low_data')
  if (x.selfAssessedWorst === 'putt' && x.rawZ.putt < 0.2)
    flags.push('putting_myth')
  const others = [x.recoverable.app, x.recoverable.short, x.recoverable.putt]
  const nextHighest = Math.max(...others)
  if (x.recoverable.ott > 1.5 * nextHighest && x.recoverable.ott > 0)
    flags.push('penalty_dominant')
  if (x.avgUdPct * 100 < 0.5 * x.benchUdPct) flags.push('short_game_gap')
  return flags
}

function headlineFor(
  area: Area,
  rawZ: number,
  recoverable: number,
  lowData: boolean,
): string {
  const label = AREA_LABEL[area]
  if (lowData) return `${label} — log a few rounds to firm this up.`
  if (recoverable >= 1.0)
    return `${label} is where the quickest shots are — about ${round1(recoverable)} to save.`
  if (rawZ > 0.3) return `${label} is costing you more than your peers.`
  return `${label} is holding up well against your peers.`
}

const round1 = (n: number) => Math.round(n * 10) / 10
const round2 = (n: number) => Math.round(n * 100) / 100
