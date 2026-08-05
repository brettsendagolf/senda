import { describe, it, expect } from 'vitest'
import type { Capability, Category, Drill, Mode } from '@/types'
import { generateSession } from './generator'

// --- Fixtures -------------------------------------------------------------
// A small library that spans the categories and modes the tests need. Fields
// the generator ignores (why, setup, benchmarks…) get harmless defaults.

let seq = 0
function makeDrill(p: Partial<Drill> & { id: string; category: Category; mode: Mode; requires: Capability[] }): Drill {
  seq += 1
  return {
    minutes: 10,
    minMinutes: 6,
    name: p.id,
    purpose: 'test drill',
    why: 'because',
    setup: ['do the thing'],
    tip: 'a tip',
    scoring: 'count them',
    metric: { label: 'Points', max: 10, lowerIsBetter: false },
    benchmarks: [{ band: 'Under 9', target: 7 }],
    logType: 'aggregate',
    ...p,
  }
}

const DRILLS: Drill[] = [
  // Putting — a full ladder so a putting-green-only venue can build a session.
  makeDrill({ id: 'p_warm', category: 'putting', mode: 'warmup', requires: ['putting_green'], minutes: 6, minMinutes: 4 }),
  makeDrill({ id: 'p_build1', category: 'putting', mode: 'build', requires: ['putting_green'], minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'p_build2', category: 'putting', mode: 'build', requires: ['putting_green'], minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'p_press', category: 'putting', mode: 'pressure', requires: ['putting_green'], minutes: 10, minMinutes: 6 }),
  makeDrill({ id: 'p_test', category: 'putting', mode: 'test', requires: ['putting_green'], minutes: 12, minMinutes: 8 }),

  // Wedges — only exist where you can hit real shots. Never at a putting green.
  makeDrill({ id: 'w_build', category: 'wedges', mode: 'build', requires: ['short_game', 'range'], minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'w_press', category: 'wedges', mode: 'pressure', requires: ['short_game', 'range'], minutes: 12, minMinutes: 8 }),

  // Chipping / driving / full swing — extra categories for the full venue.
  makeDrill({ id: 'c_build', category: 'chipping', mode: 'build', requires: ['short_game'], minutes: 10, minMinutes: 6 }),
  makeDrill({ id: 'd_warm', category: 'driving', mode: 'warmup', requires: ['range'], minutes: 8, minMinutes: 5 }),
  makeDrill({ id: 'd_build', category: 'driving', mode: 'build', requires: ['range'], minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'b_press', category: 'bunker', mode: 'pressure', requires: ['bunker'], minutes: 10, minMinutes: 6 }),

  // Home — indoor warmup + build only. No pressure or test possible at home.
  makeDrill({ id: 'h_warm', category: 'putting', mode: 'warmup', requires: ['home'], minutes: 6, minMinutes: 4 }),
  makeDrill({ id: 'h_build', category: 'chipping', mode: 'build', requires: ['home'], minutes: 10, minMinutes: 6 }),
]

const ALL_CAPS: Capability[] = ['range', 'net', 'putting_green', 'short_game', 'bunker', 'sim', 'course']

const drillById = (id: string) => DRILLS.find((d) => d.id === id)!
const withinTolerance = (total: number, requested: number) =>
  total >= requested * 0.9 && total <= requested * 1.1

// --- Tests ----------------------------------------------------------------

describe('generateSession', () => {
  it('15 min at a putting-green-only venue → a valid putting session under 17 min', () => {
    const { blocks, totalMinutes } = generateSession({
      minutes: 15,
      capabilities: ['putting_green'],
      allDrills: DRILLS,
    })
    expect(blocks.length).toBeGreaterThan(0)
    expect(totalMinutes).toBeLessThan(17)
    for (const b of blocks) {
      expect(drillById(b.drillId).category).toBe('putting')
    }
  })

  it('60 min at a full venue → 4+ blocks ending on pressure or test', () => {
    const { blocks } = generateSession({
      minutes: 60,
      capabilities: ALL_CAPS,
      allDrills: DRILLS,
    })
    expect(blocks.length).toBeGreaterThanOrEqual(4)
    const lastMode = drillById(blocks[blocks.length - 1].drillId).mode
    expect(['pressure', 'test']).toContain(lastMode)
  })

  it('a home-only venue returns a non-empty session', () => {
    const { blocks } = generateSession({
      minutes: 30,
      capabilities: ['home'],
      allDrills: DRILLS,
    })
    expect(blocks.length).toBeGreaterThan(0)
  })

  it('focus "wedges" at a putting-green-only venue returns no wedge drills', () => {
    const { blocks } = generateSession({
      minutes: 45,
      capabilities: ['putting_green'],
      focus: 'wedges',
      allDrills: DRILLS,
    })
    for (const b of blocks) {
      expect(drillById(b.drillId).category).not.toBe('wedges')
    }
  })

  it('avoids a recent drill when an equivalent alternative exists', () => {
    const { blocks } = generateSession({
      minutes: 15,
      capabilities: ['putting_green'],
      recentDrillIds: ['p_build1'],
      allDrills: DRILLS,
    })
    const buildBlock = blocks.find((b) => drillById(b.drillId).mode === 'build')
    expect(buildBlock).toBeDefined()
    expect(buildBlock!.drillId).toBe('p_build2')
  })

  it('total minutes are always within ±10% of requested', () => {
    const scenarios: { minutes: number; capabilities: Capability[] }[] = [
      { minutes: 15, capabilities: ['putting_green'] },
      { minutes: 20, capabilities: ALL_CAPS },
      { minutes: 30, capabilities: ['putting_green', 'short_game'] },
      { minutes: 45, capabilities: ALL_CAPS },
      { minutes: 60, capabilities: ALL_CAPS },
      { minutes: 30, capabilities: ['home'] },
    ]
    for (const s of scenarios) {
      const { totalMinutes, blocks } = generateSession({
        ...s,
        allDrills: DRILLS,
      })
      expect(blocks.length).toBeGreaterThan(0)
      expect(withinTolerance(totalMinutes, s.minutes)).toBe(true)
    }
  })

  it('does not repeat the same drill within one session', () => {
    const { blocks } = generateSession({
      minutes: 60,
      capabilities: ALL_CAPS,
      allDrills: DRILLS,
    })
    const ids = blocks.map((b) => b.drillId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('is not 100% one category when the venue supports more', () => {
    const { blocks } = generateSession({
      minutes: 60,
      capabilities: ALL_CAPS,
      allDrills: DRILLS,
    })
    const categories = new Set(blocks.map((b) => drillById(b.drillId).category))
    expect(categories.size).toBeGreaterThan(1)
  })
})
