import type { Mode } from '@/types'
import { MODE_META } from '@/data/labels'

// Solid + soft tint per mode. Kept here as literals so the badge never depends
// on Tailwind arbitrary-value plumbing.
const COLORS: Record<Mode, { fg: string; bg: string }> = {
  warmup: { fg: '#3f6b52', bg: '#e7efe9' },
  build: { fg: '#345169', bg: '#e5edf2' },
  pressure: { fg: '#9c3327', bg: '#f4e2df' },
  test: { fg: '#7a5f33', bg: '#efe7d7' },
}

export function ModeBadge({ mode }: { mode: Mode }) {
  const c = COLORS[mode]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: c.fg, backgroundColor: c.bg }}
    >
      {MODE_META[mode].label}
    </span>
  )
}
