import type { Round } from '@/types'

/**
 * Soft warnings, never hard blocks (Spec A7). Golfers misremember rounds;
 * refusing the round loses the round *and* the user. Impossible values are
 * prevented by the steppers' own limits rather than by rejecting a save.
 */
export function roundWarnings(r: {
  holesPlayed: number
  par: number
  grossScore: number
  gir: number
  penalties: number
  putts: number
  upDownAttempts: number
  threePutts: number
}): string[] {
  const w: string[] = []

  if (r.putts < r.gir)
    w.push('Fewer putts than greens hit — did you chip in?')

  if (r.upDownAttempts > r.holesPlayed - r.gir + 2)
    w.push("That's more up-and-downs than greens you missed.")

  if (r.threePutts * 3 > r.putts)
    w.push('That many three-putts would use up most of your putts.')

  if (r.grossScore < r.par + r.gir / 2)
    w.push("That's a very good round — double-check the score?")

  const overPar = r.grossScore - r.par
  const scaled = overPar * (18 / r.holesPlayed)
  if (r.penalties === 0 && scaled > 25)
    w.push('Really no penalty shots? Most rounds like this have a few.')

  return w
}

/** Sensible starting values so most fields need no touching at all. */
export function defaultsFor(holesPlayed: number) {
  const f = holesPlayed / 18
  return {
    par: Math.round(72 * f),
    grossScore: Math.round(72 * f) + Math.round(18 * f),
    gir: Math.round(3 * f),
    penalties: Math.round(2 * f),
    putts: Math.round(32 * f),
    upDownMade: Math.round(2 * f),
    fairwaysHit: Math.round(5 * f),
    fairwaysPossible: Math.round(14 * f),
    threePutts: Math.round(2 * f),
  }
}

export type RoundDraft = Omit<Round, 'id' | 'createdAt' | 'source'>
