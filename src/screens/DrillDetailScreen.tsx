import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getDrill } from '@/data/drills'
import { CATEGORY_LABELS } from '@/data/labels'
import { ModeBadge } from '@/components/ModeBadge'
import { BenchmarkStrip } from '@/components/BenchmarkStrip'
import { AggregateEntry, PerShotEntry } from '@/components/ScoreEntry'
import { useSettings } from '@/store/settings'
import { useEntries } from '@/store/entries'

export function DrillDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const handicap = useSettings((s) => s.handicap)
  const addEntry = useEntries((s) => s.addEntry)

  const [logging, setLogging] = useState(false)
  const [value, setValue] = useState<number | undefined>()
  const [saved, setSaved] = useState(false)

  const drill = id ? getDrill(id) : undefined
  if (!drill) return <Navigate to="/drills" replace />

  const onSave = () => {
    if (value === undefined) return
    addEntry({ drillId: drill.id, score: value })
    setSaved(true)
    setLogging(false)
    setValue(undefined)
  }

  return (
    <div className="pb-10">
      {/* Back header, safe-area aware */}
      <header
        className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 pb-3 backdrop-blur"
        style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="min-h-11 text-sm font-medium text-ink-soft"
        >
          ‹ Back
        </button>
      </header>

      <div className="px-4 pt-3">
        <div className="mb-1 flex items-center gap-2">
          <ModeBadge mode={drill.mode} />
          <span className="text-xs text-ink-soft">
            {CATEGORY_LABELS[drill.category]}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{drill.name}</h1>
        <p className="mt-1 text-ink-soft">{drill.purpose}</p>

        <p className="mt-3 text-sm text-ink">{drill.why}</p>

        <div className="mt-4 rounded-lg border border-line bg-card p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Set up
          </h2>
          <ol className="mt-2 space-y-1.5">
            {drill.setup.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink">
                <span className="tabular shrink-0 font-semibold text-accent">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-line pt-2 text-sm text-ink-soft">
            <span className="font-semibold text-ink">Tip. </span>
            {drill.tip}
          </p>
        </div>

        <div className="mt-4">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Scoring
          </h2>
          <p className="text-sm text-ink-soft">{drill.scoring}</p>
          <div className="mt-3">
            <BenchmarkStrip
              benchmarks={drill.benchmarks}
              metric={drill.metric}
              handicap={handicap}
              score={logging ? value : undefined}
            />
          </div>
        </div>

        {/* Standalone logging */}
        {!logging ? (
          <div className="mt-5 space-y-2">
            {saved && (
              <p className="rounded-lg border border-line bg-accent-soft px-3 py-2 text-center text-sm text-accent">
                Score saved to your history.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setLogging(true)
                setSaved(false)
              }}
              className="h-14 w-full rounded-xl border-2 border-accent bg-accent-soft text-lg font-semibold text-accent active:opacity-90"
            >
              Log a score
            </button>
          </div>
        ) : (
          <div className="mt-5">
            {drill.logType === 'per_shot' ? (
              <PerShotEntry metric={drill.metric} onValueChange={setValue} />
            ) : (
              <AggregateEntry metric={drill.metric} onValueChange={setValue} />
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLogging(false)
                  setValue(undefined)
                }}
                className="h-12 flex-1 rounded-xl border border-line bg-card font-medium text-ink-soft active:bg-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={value === undefined}
                className="h-12 flex-1 rounded-xl bg-accent font-semibold text-white active:opacity-90 disabled:opacity-40"
              >
                Save score
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
