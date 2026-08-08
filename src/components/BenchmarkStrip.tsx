import type { Benchmark, Metric } from '@/types'
import { BANDS, bandForHandicap, type BandName } from '@/lib/handicap'

/**
 * Shows the handicap bands that actually have a target, easiest → hardest, with
 * the player's own band ringed. If a score is supplied, the best band it reaches
 * is filled. The library currently only carries an "Under 9" target per drill,
 * so this is honest about empty bands rather than inventing numbers.
 */
export function BenchmarkStrip({
  benchmarks,
  metric,
  handicap,
  score,
}: {
  benchmarks: Benchmark[]
  metric: Metric
  handicap: number
  score?: number
}) {
  const userBand = bandForHandicap(handicap)
  const targetOf = (band: BandName) =>
    benchmarks.find((b) => b.band === band)?.target

  // Only the bands with a real target, easiest → hardest for left-to-right read.
  const populated = [...BANDS]
    .reverse()
    .filter((b) => targetOf(b.band) !== undefined)

  const directionNote = `${metric.label} · ${
    metric.lowerIsBetter ? 'lower is better' : 'higher is better'
  }`

  if (populated.length === 0) {
    return (
      <div className="rounded-md border border-line bg-card px-3 py-3 text-center">
        <p className="text-sm text-ink-soft">No target for this drill yet.</p>
        <p className="mt-0.5 text-[11px] text-ink-soft">{directionNote}</p>
      </div>
    )
  }

  const meets = (target: number | undefined) => {
    if (target === undefined || score === undefined) return false
    return metric.lowerIsBetter ? score <= target : score >= target
  }
  // Hardest band first — the achieved band is the first one met.
  const achieved = BANDS.find((b) => meets(targetOf(b.band)))?.band
  const userBandPopulated = populated.some((b) => b.band === userBand)

  return (
    <div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${populated.length}, minmax(0, 1fr))` }}
      >
        {populated.map(({ band }) => {
          const isUser = band === userBand
          const isAchieved = band === achieved
          return (
            <div
              key={band}
              className={
                'rounded-md border px-1 py-1.5 text-center ' +
                (isAchieved
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-card') +
                (isUser ? ' ring-2 ring-accent ring-offset-1 ring-offset-paper' : '')
              }
            >
              <div className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                {band}
              </div>
              <div
                className={
                  'tabular text-base font-semibold ' +
                  (isAchieved ? 'text-accent' : 'text-ink')
                }
              >
                {targetOf(band)}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-1.5 text-center text-[11px] text-ink-soft">
        {userBandPopulated
          ? `Ringed band is yours (${userBand}).`
          : `No target for your band (${userBand}) yet — showing what's set.`}{' '}
        {directionNote}
      </p>
    </div>
  )
}
