import type { Benchmark } from '@/types'

/**
 * The four handicap bands drills are benchmarked against. `threshold` is
 * exclusive: a player is in the first band whose threshold their handicap is
 * below. So a 9 handicap sits in "Under 15", a 5 in "Under 9", a 4 in "Under 5".
 */
export const BANDS = [
  { band: 'Under 5', threshold: 5 },
  { band: 'Under 9', threshold: 9 },
  { band: 'Under 15', threshold: 15 },
  { band: 'Under 24', threshold: 24 },
] as const

export type BandName = (typeof BANDS)[number]['band']

/** The band a given handicap falls into. */
export function bandForHandicap(handicap: number): BandName {
  const hit = BANDS.find((b) => handicap < b.threshold)
  return (hit ?? BANDS[BANDS.length - 1]).band
}

/** Look up a drill's target for a given band, if it has one. */
export function targetForBand(
  benchmarks: Benchmark[],
  band: BandName,
): number | undefined {
  return benchmarks.find((b) => b.band === band)?.target
}
