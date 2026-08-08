import { useState } from 'react'
import type { Metric } from '@/types'

/**
 * Carry Numbers (special: 'carry_table'). A 3×2 grid — three wedges by two
 * swing lengths — of carry distances. The score is the largest gap between two
 * consecutive numbers once sorted, which is what the drill's metric measures
 * (lower is better: a small largest-gap means the set covers every distance).
 */
const WEDGES = ['50°', '54°', '58°']
const SWINGS = ['Half', 'Three-quarter']

export function CarryTableEntry({
  onValueChange,
}: {
  metric: Metric
  onValueChange: (value: number | undefined) => void
}) {
  // cells[wedgeIndex][swingIndex] as strings for controlled inputs.
  const [cells, setCells] = useState<string[][]>([
    ['', ''],
    ['', ''],
    ['', ''],
  ])

  const recompute = (grid: string[][]) => {
    const nums = grid
      .flat()
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b)
    if (nums.length < 2) return onValueChange(undefined)
    let largest = 0
    for (let i = 1; i < nums.length; i++) largest = Math.max(largest, nums[i] - nums[i - 1])
    onValueChange(largest)
  }

  const setCell = (w: number, s: number, val: string) => {
    const clean = val.replace(/[^\d]/g, '').slice(0, 3)
    const grid = cells.map((row) => [...row])
    grid[w][s] = clean
    setCells(grid)
    recompute(grid)
  }

  return (
    <div className="rounded-lg border border-line bg-card p-3">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
        <div />
        {SWINGS.map((s) => (
          <div
            key={s}
            className="text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft"
          >
            {s}
          </div>
        ))}
        {WEDGES.map((wedge, w) => (
          <Row key={wedge}>
            <div className="flex items-center text-sm font-semibold text-ink">
              {wedge}
            </div>
            {SWINGS.map((_, s) => (
              <input
                key={s}
                inputMode="numeric"
                value={cells[w][s]}
                onChange={(e) => setCell(w, s, e.target.value)}
                placeholder="yds"
                className="tabular h-12 w-full rounded-md border border-line bg-paper text-center text-lg text-ink"
                aria-label={`${wedge} ${SWINGS[s]} carry`}
              />
            ))}
          </Row>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-ink-soft">
        Enter the average carry for each. Your score is the largest gap between
        consecutive numbers — smaller is better.
      </p>
    </div>
  )
}

// A row is just the three grid children in order; this keeps the JSX readable.
function Row({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/**
 * Draw and Hit (special: 'random_yardage'). Draws a random target between 25 and
 * 75 yards before each shot, you tap the points for that shot, and it draws the
 * next. Running total across 15 shots is the score.
 */
const SHOTS = 15
const drawYardage = () => 25 + Math.floor(Math.random() * 51) // 25–75 inclusive

export function RandomYardageEntry({
  onValueChange,
}: {
  metric: Metric
  onValueChange: (value: number | undefined) => void
}) {
  const [shots, setShots] = useState<{ yards: number; points: number }[]>([])
  const [yards, setYards] = useState<number>(() => drawYardage())

  const total = shots.reduce((a, b) => a + b.points, 0)
  const done = shots.length >= SHOTS

  const record = (points: number) => {
    if (done) return
    const next = [...shots, { yards, points }]
    setShots(next)
    onValueChange(next.reduce((a, b) => a + b.points, 0))
    if (next.length < SHOTS) setYards(drawYardage())
  }
  const undo = () => {
    if (shots.length === 0) return
    const last = shots[shots.length - 1]
    const next = shots.slice(0, -1)
    setShots(next)
    setYards(last.yards)
    onValueChange(next.length ? next.reduce((a, b) => a + b.points, 0) : undefined)
  }

  return (
    <div>
      <div className="mb-3 rounded-lg border border-line bg-card py-4 text-center">
        {done ? (
          <>
            <div className="tabular text-5xl font-bold text-ink">{total}</div>
            <div className="mt-1 text-xs text-ink-soft">
              All {SHOTS} shots in · points out of 30
            </div>
          </>
        ) : (
          <>
            <div className="tabular text-5xl font-bold text-ink">{yards}</div>
            <div className="mt-1 text-xs text-ink-soft">
              yards · shot {shots.length + 1} of {SHOTS} · {total} pts so far
            </div>
          </>
        )}
      </div>
      {!done && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { p: 0, label: 'outside 30' },
            { p: 1, label: 'inside 30' },
            { p: 2, label: 'inside 15' },
          ].map(({ p, label }) => (
            <button
              key={p}
              type="button"
              onClick={() => record(p)}
              className="flex h-16 flex-col items-center justify-center rounded-lg border border-line bg-card active:bg-paper"
            >
              <span className="tabular text-2xl font-semibold text-ink">{p}</span>
              <span className="text-[11px] text-ink-soft">{label}</span>
            </button>
          ))}
        </div>
      )}
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
