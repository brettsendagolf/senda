import { useState } from 'react'
import type { Metric } from '@/types'

/**
 * Aggregate entry — one number via a big keypad. Targets are 56px tall so they
 * work at arm's length, in wind, in gloves.
 */
export function AggregateEntry({
  metric,
  onValueChange,
}: {
  metric: Metric
  onValueChange: (value: number | undefined) => void
}) {
  const [text, setText] = useState('')

  const set = (next: string) => {
    // Clamp to the metric's max so a fat-fingered extra digit can't sail past.
    const n = next === '' ? undefined : Math.min(Number(next), metric.max)
    const clamped = n === undefined ? '' : String(n)
    setText(clamped)
    onValueChange(n)
  }

  const press = (d: string) => set((text + d).replace(/^0+(?=\d)/, ''))
  const back = () => set(text.slice(0, -1))

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div>
      <div className="mb-3 rounded-lg border border-line bg-card py-4 text-center">
        <div className="tabular text-5xl font-bold text-ink">
          {text === '' ? '—' : text}
        </div>
        <div className="mt-1 text-xs text-ink-soft">
          {metric.label} · out of {metric.max}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className="tabular h-14 rounded-lg border border-line bg-card text-2xl font-semibold text-ink active:bg-paper"
          >
            {k}
          </button>
        ))}
        <button
          type="button"
          onClick={() => set('')}
          className="h-14 rounded-lg border border-line bg-card text-sm font-medium text-ink-soft active:bg-paper"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => press('0')}
          className="tabular h-14 rounded-lg border border-line bg-card text-2xl font-semibold text-ink active:bg-paper"
        >
          0
        </button>
        <button
          type="button"
          onClick={back}
          aria-label="Delete"
          className="h-14 rounded-lg border border-line bg-card text-2xl text-ink-soft active:bg-paper"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}

/**
 * Per-shot entry — tap a value for each shot; the running total becomes the
 * score. A simple, robust MVP: 0 / 1 / 2 point taps with an undo and a shot
 * counter. Good enough for the placeholder point-based tests.
 */
export function PerShotEntry({
  metric,
  onValueChange,
}: {
  metric: Metric
  onValueChange: (value: number | undefined) => void
}) {
  const [shots, setShots] = useState<number[]>([])
  const total = shots.reduce((a, b) => a + b, 0)

  const add = (points: number) => {
    const next = [...shots, points]
    setShots(next)
    onValueChange(next.reduce((a, b) => a + b, 0))
  }
  const undo = () => {
    const next = shots.slice(0, -1)
    setShots(next)
    onValueChange(next.length ? next.reduce((a, b) => a + b, 0) : undefined)
  }

  return (
    <div>
      <div className="mb-3 rounded-lg border border-line bg-card py-4 text-center">
        <div className="tabular text-5xl font-bold text-ink">{total}</div>
        <div className="mt-1 text-xs text-ink-soft">
          {metric.label} · shot {shots.length} logged
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => add(p)}
            className="tabular flex h-16 flex-col items-center justify-center rounded-lg border border-line bg-card active:bg-paper"
          >
            <span className="text-2xl font-semibold text-ink">{p}</span>
            <span className="text-[11px] text-ink-soft">
              {p === 0 ? 'miss' : p === 1 ? 'close' : 'inside'}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={undo}
        disabled={shots.length === 0}
        className="mt-2 h-11 w-full rounded-lg border border-line bg-card text-sm font-medium text-ink-soft active:bg-paper disabled:opacity-40"
      >
        Undo last shot
      </button>
    </div>
  )
}
