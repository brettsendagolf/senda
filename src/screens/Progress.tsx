import type { Drill } from '@/types'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Sparkline } from '@/components/Sparkline'
import { DRILLS } from '@/data/drills'
import { CATEGORY_LABELS } from '@/data/labels'
import { BANDS } from '@/lib/handicap'
import { useEntries } from '@/store/entries'

function bestScore(scores: number[], lowerIsBetter: boolean): number {
  return lowerIsBetter ? Math.min(...scores) : Math.max(...scores)
}

function bandForScore(drill: Drill, score: number): string | undefined {
  const meets = (target?: number) =>
    target !== undefined &&
    (drill.metric.lowerIsBetter ? score <= target : score >= target)
  // Hardest band first — the achieved band is the first one met.
  return BANDS.find((b) =>
    meets(drill.benchmarks.find((x) => x.band === b.band)?.target),
  )?.band
}

export function Progress() {
  const entries = useEntries((s) => s.entries)

  // Drills that have at least one logged score, most-recently-used first.
  const rows = DRILLS.map((drill) => {
    const mine = entries
      .filter((e) => e.drillId === drill.id)
      .sort((a, b) => a.ts - b.ts)
    return { drill, scores: mine.map((e) => e.score), lastTs: mine.at(-1)?.ts ?? 0 }
  })
    .filter((r) => r.scores.length > 0)
    .sort((a, b) => b.lastTs - a.lastTs)

  return (
    <div className="pb-8">
      <ScreenHeader title="Progress" subtitle="Your last ten, per drill" />

      <div className="px-4 pt-4">
        {rows.length === 0 ? (
          <p className="rounded-lg border border-line bg-card px-3 py-8 text-center text-sm text-ink-soft">
            Log a score in a session or from a drill and it'll show up here.
          </p>
        ) : (
          <ul className="space-y-2">
            {rows.map(({ drill, scores }) => {
              const last = scores.at(-1)!
              const best = bestScore(scores, drill.metric.lowerIsBetter)
              const band = bandForScore(drill, best)
              const last10 = scores.slice(-10)
              return (
                <li
                  key={drill.id}
                  className="rounded-lg border border-line bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">
                        {drill.name}
                      </div>
                      <div className="mt-0.5 text-xs text-ink-soft">
                        {CATEGORY_LABELS[drill.category]} · {drill.metric.label}
                      </div>
                    </div>
                    <Sparkline values={last10} />
                  </div>

                  <div className="mt-3 flex items-end justify-between border-t border-line pt-2">
                    <Stat label="Last" value={last} />
                    <Stat label="Best" value={best} />
                    <div className="text-right">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                        Band
                      </div>
                      <div className="text-sm font-semibold text-accent">
                        {band ?? '—'}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </div>
      <div className="tabular text-lg font-semibold text-ink">{value}</div>
    </div>
  )
}
