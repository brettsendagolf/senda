import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { WarmupBlock } from '@/types/warmup'
import { getAddon, getWarmup } from '@/data/warmups'

interface WarmupNavState {
  warmupId?: string
  addonIds?: string[]
}

export function WarmupRunner() {
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as WarmupNavState

  const warmup = state.warmupId ? getWarmup(state.warmupId) : undefined
  const addonBlocks: WarmupBlock[] = (state.addonIds ?? [])
    .map((id) => getAddon(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({ name: a.name, minutes: a.minutes, needs: a.needs, items: a.items }))

  const [index, setIndex] = useState(0)

  if (!warmup) return <Navigate to="/" replace />

  const blocks: WarmupBlock[] = [...warmup.blocks, ...addonBlocks]
  const total = blocks.reduce((a, b) => a + b.minutes, 0)
  const block = blocks[index]
  const isLast = index === blocks.length - 1

  return (
    <div className="flex h-full flex-col bg-paper">
      <div
        className="shrink-0 border-b border-line px-4 pb-3"
        style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}
      >
        <div className="flex items-center justify-between">
          <span className="tabular text-sm font-semibold text-ink-soft">
            Warm-up · {total} min
          </span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="min-h-11 px-2 text-sm font-medium text-ink-soft"
          >
            Exit
          </button>
        </div>
        <div className="mt-2 flex gap-1">
          {blocks.map((_, i) => (
            <span
              key={i}
              className={
                'h-1.5 flex-1 rounded-full ' +
                (i < index ? 'bg-accent' : i === index ? 'bg-accent/40' : 'bg-line')
              }
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="tabular text-sm text-ink-soft">
          Block {index + 1} of {blocks.length} · {block.minutes} min
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{block.name}</h1>

        <ul className="mt-4 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="rounded-lg border border-line bg-card p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink">{item.name}</span>
                <span className="tabular shrink-0 text-sm font-medium text-accent">
                  {item.reps}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{item.note}</p>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="shrink-0 border-t border-line px-4 pt-3"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={() => (isLast ? navigate('/') : setIndex(index + 1))}
          className="h-14 w-full rounded-xl bg-accent text-lg font-semibold text-on-accent active:opacity-90"
        >
          {isLast ? 'Done — to the first tee' : 'Next block'}
        </button>
      </div>
    </div>
  )
}
