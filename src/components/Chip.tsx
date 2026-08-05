import type { ReactNode } from 'react'

/**
 * A selectable pill. Min height 44px so it's a comfortable tap target outdoors
 * in gloves — a fundamental the brief calls out.
 */
export function Chip({
  selected,
  onClick,
  children,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        'inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors ' +
        (selected
          ? 'border-accent bg-accent-soft text-accent'
          : 'border-line bg-card text-ink-soft active:bg-paper')
      }
    >
      {children}
    </button>
  )
}
