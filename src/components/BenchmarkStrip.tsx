import type { Benchmark, Metric } from '@/types'
import { BANDS, bandForHandicap, type BandName } from '@/lib/handicap'

/**
 * Shows the handicap bands left (easiest) to right (hardest) with each band's
 * target. The player's own band is ringed. If a score is supplied, the best
 * band it reaches is filled — so you can see at a glance where the number lands.
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

  const meets = (target: number | undefined) => {
    if (target === undefined || score === undefined) return false
    return metric.lowerIsBetter ? score <= target : score >= target
  }

  // Hardest band first (BANDS order) → the achieved band is the first one met.
  const achieved = BANDS.find((b) => meets(targetOf(b.band)))?.band

  // Display easiest → hardest so improvement reads left to right.
  const display = [...BANDS].reverse()

  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {display.map(({ band }) => {
          const target = targetOf(band)
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
                {target ?? '—'}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-1.5 text-center text-[11px] text-ink-soft">
        Ringed band is yours ({userBand}). {metric.label} ·{' '}
        {metric.lowerIsBetter ? 'lower is better' : 'higher is better'}
      </p>
    </div>
  )
}
