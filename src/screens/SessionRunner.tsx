import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@/types'
import { useSession } from '@/store/session'
import { useSettings } from '@/store/settings'
import { useVenues } from '@/store/venues'
import { getDrill } from '@/data/drills'
import { ModeBadge } from '@/components/ModeBadge'
import { BenchmarkStrip } from '@/components/BenchmarkStrip'
import { DrillScoreInput } from '@/components/DrillScoreInput'

const firstIncomplete = (s: Session) => {
  const i = s.blocks.findIndex((b) => !b.completed)
  return i === -1 ? 0 : i
}

export function SessionRunner() {
  const navigate = useNavigate()
  const current = useSession((s) => s.current)
  const scoreBlock = useSession((s) => s.scoreBlock)
  const finish = useSession((s) => s.finish)
  const handicap = useSettings((s) => s.handicap)
  const venues = useVenues((s) => s.venues)

  const [index, setIndex] = useState(() => (current ? firstIncomplete(current) : 0))
  const [value, setValue] = useState<number | undefined>()
  const [summary, setSummary] = useState<Session | null>(null)

  // Finished view — captured before finish() clears the active session.
  if (summary) return <Summary session={summary} onDone={() => navigate('/')} />

  if (!current || current.blocks.length === 0) return <Navigate to="/" replace />

  const block = current.blocks[index]
  const drill = getDrill(block.drillId)
  if (!drill) return <Navigate to="/" replace />

  const isLast = index === current.blocks.length - 1

  // The surface caveat only applies at a mats-only range.
  const venue = venues.find((v) => v.id === current.venueId)
  const matsOnly =
    !!venue &&
    venue.capabilities.includes('range_mat') &&
    !venue.capabilities.includes('range_grass')
  const showSurfaceNote = matsOnly && !!drill.surfaceNote

  const onNext = () => {
    if (value !== undefined) scoreBlock(index, value)
    if (isLast) {
      const finished = useSession.getState().current
      setSummary(finished)
      finish()
      return
    }
    setIndex(index + 1)
    setValue(undefined)
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Header: progress + exit. Safe-area top respected. */}
      <div
        className="shrink-0 border-b border-line px-4 pb-3"
        style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}
      >
        <div className="flex items-center justify-between">
          <span className="tabular text-sm font-semibold text-ink-soft">
            Block {index + 1} of {current.blocks.length}
          </span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="min-h-11 px-2 text-sm font-medium text-ink-soft"
          >
            Save &amp; exit
          </button>
        </div>
        <div className="mt-2 flex gap-1">
          {current.blocks.map((b, i) => (
            <span
              key={i}
              className={
                'h-1.5 flex-1 rounded-full ' +
                (b.completed || i < index
                  ? 'bg-accent'
                  : i === index
                    ? 'bg-accent/40'
                    : 'bg-line')
              }
            />
          ))}
        </div>
      </div>

      {/* One scroll container for the whole block. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-1 flex items-center gap-2">
          <ModeBadge mode={drill.mode} />
          <span className="tabular text-sm text-ink-soft">{block.minutes} min</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{drill.name}</h1>
        <p className="mt-1 text-ink-soft">{drill.purpose}</p>

        {showSurfaceNote && (
          <p
            className="mt-3 rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink"
            style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-test)' }}
          >
            <span className="font-semibold">On mats: </span>
            {drill.surfaceNote}
          </p>
        )}

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

        {/* Score — unless this is the unscored loosener */}
        {drill.logType !== 'none' && (
          <div className="mt-5">
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Your score
            </h2>
            <p className="mb-3 text-sm text-ink-soft">{drill.scoring}</p>
            <DrillScoreInput
              key={block.drillId + index}
              drill={drill}
              onValueChange={setValue}
            />

            <div className="mt-4">
              <BenchmarkStrip
                benchmarks={drill.benchmarks}
                metric={drill.metric}
                handicap={handicap}
                score={value}
              />
            </div>
          </div>
        )}
      </div>

      {/* Advance — fixed above the home indicator. */}
      <div
        className="shrink-0 border-t border-line px-4 pt-3"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={onNext}
          className="h-14 w-full rounded-xl bg-accent text-lg font-semibold text-white active:opacity-90"
        >
          {drill.logType === 'none'
            ? 'Ready — start'
            : value !== undefined
              ? isLast
                ? 'Log & finish'
                : 'Log & next'
              : isLast
                ? 'Finish'
                : 'Skip'}
        </button>
      </div>
    </div>
  )
}

function Summary({
  session,
  onDone,
}: {
  session: Session
  onDone: () => void
}) {
  // The loosener has no score, so don't count it in "X of Y scored".
  const scorable = session.blocks.filter(
    (b) => getDrill(b.drillId)?.logType !== 'none',
  )
  const logged = scorable.filter((b) => b.score !== undefined)
  return (
    <div className="flex h-full flex-col bg-paper">
      <div
        className="px-4"
        style={{ paddingTop: 'calc(var(--safe-top) + 2rem)' }}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Session complete
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          Nicely done.
        </h1>
        <p className="mt-1 text-ink-soft">
          {logged.length} of {scorable.length} block
          {scorable.length === 1 ? '' : 's'} scored and saved.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <ul className="space-y-2">
          {session.blocks.map((b, i) => {
            const drill = getDrill(b.drillId)
            if (!drill) return null
            return (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-card px-3 py-3"
              >
                <span className="min-w-0 flex-1 truncate text-ink">
                  {drill.name}
                </span>
                <span className="tabular shrink-0 font-semibold text-ink">
                  {b.score !== undefined ? b.score : '—'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div
        className="shrink-0 px-4 pt-3"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={onDone}
          className="h-14 w-full rounded-xl bg-accent text-lg font-semibold text-white active:opacity-90"
        >
          Done
        </button>
      </div>
    </div>
  )
}
