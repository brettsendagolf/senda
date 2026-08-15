import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Sticky screen header. Its top padding includes the safe-area inset, so the
 * title can never slide under the iPhone status bar. Pass `back` on screens
 * reached from Profile rather than from a tab.
 */
export function ScreenHeader({
  title,
  subtitle,
  right,
  back,
  backLabel = 'Back',
}: {
  title: string
  subtitle?: string
  right?: ReactNode
  back?: boolean
  backLabel?: string
}) {
  const navigate = useNavigate()
  return (
    <header
      className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 pb-3 backdrop-blur"
      style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}
    >
      {back && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="-ml-1 mb-1 flex min-h-11 items-center text-sm font-medium text-ink-soft"
        >
          ‹ {backLabel}
        </button>
      )}
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
