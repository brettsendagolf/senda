import type { Category, Mode } from '@/types'

// Capability + equipment labels live in data/capabilities.ts (they carry group
// and help text too). This module is just categories and modes.

export const CATEGORY_LABELS: Record<Category, string> = {
  putting: 'Putting',
  chipping: 'Chipping',
  pitching: 'Pitching',
  wedges: 'Wedges',
  bunker: 'Bunker',
  full_swing: 'Full swing',
  driving: 'Driving',
}

export const CATEGORY_ORDER: Category[] = [
  'putting',
  'chipping',
  'pitching',
  'wedges',
  'bunker',
  'full_swing',
  'driving',
]

interface ModeMeta {
  label: string
  /** The theme colour token this mode maps to (see index.css @theme). */
  color: 'warmup' | 'build' | 'pressure' | 'test' | 'course'
}

export const MODE_META: Record<Mode, ModeMeta> = {
  warmup: { label: 'Warm-up', color: 'warmup' },
  build: { label: 'Build', color: 'build' },
  pressure: { label: 'Pressure', color: 'pressure' },
  test: { label: 'Test', color: 'test' },
  course: { label: 'On the course', color: 'course' },
}
