/**
 * Warm-ups are pre-round routines, NOT generated sessions. The sequence is
 * fixed by design — stretch, wedges, irons, driver, first tee — so they are
 * stored as authored data and read straight through, never shuffled.
 */

export interface WarmupItem {
  name: string
  reps: string
  note: string
}

export interface WarmupBlock {
  name: string
  minutes: number
  needs: 'anywhere' | 'balls' | 'putting' | 'shortgame'
  items: WarmupItem[]
}

export interface Warmup {
  id: string
  label: string // "15 min", "30 min", "60 min"
  totalMinutes: number // core-block minutes (the 60 is 50 core + a greens add-on)
  blocks: WarmupBlock[]
}

/** An optional block you can append to a warm-up (greens, short game). */
export interface WarmupAddon {
  id: string
  name: string
  minutes: number
  needs: 'putting' | 'shortgame'
  items: WarmupItem[]
}
