import type { ReactNode } from 'react'

/**
 * Sticky screen header. Its top padding includes the safe-area inset, so the
 * title can never slide under the iPhone status bar — the exact collision the
 * brief says the competitor gets wrong.
 */
export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <header
      className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 pb-3 backdrop-blur"
      style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0 pb-0.5">{right}</div>}
      </div>
    </header>
  )
}
