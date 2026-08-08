import type { Capability, Category, Mode } from '@/types'

export const CAPABILITY_LABELS: Record<Capability, string> = {
  range: 'Range',
  net: 'Net',
  putting_green: 'Putting green',
  short_game: 'Short game area',
  bunker: 'Bunker',
  sim: 'Simulator',
  course: 'On course',
  home: 'At home',
}

/** Order the capabilities appear in the venue editor. */
export const CAPABILITY_ORDER: Capability[] = [
  'putting_green',
  'short_game',
  'bunker',
  'range',
  'net',
  'sim',
  'course',
  'home',
]

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
