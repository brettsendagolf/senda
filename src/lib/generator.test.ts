import { describe, it, expect } from 'vitest'
import type { Capability, Category, Drill, Mode, SkillId } from '@/types'
import { generateSession, LOOSENER_ID } from './generator'

// --- Fixtures -------------------------------------------------------------
// A small library spanning the categories, modes and skills the tests need.

function makeDrill(
  p: Partial<Drill> & {
    id: string
    category: Category
    mode: Mode
    requires: Capability[]
    primarySkill: SkillId
  },
): Drill {
  return {
    minutes: 10,
    minMinutes: 6,
    name: p.id,
    purpose: 'test drill',
    setup: ['do the thing'],
    tip: 'a tip',
    scoring: 'count them',
    metric: { label: 'Points', max: 10, lowerIsBetter: false },
    benchmarks: [{ band: 'Under 9', target: 7 }],
    logType: 'aggregate',
    equipment: [],
    skills: [p.primarySkill],
    ...p,
  }
}

const DRILLS: Drill[] = [
  makeDrill({ id: 'p_build1', category: 'putting', mode: 'build', requires: ['putting_green'], primarySkill: 'start_line', minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'p_build2', category: 'putting', mode: 'build', requires: ['putting_green'], primarySkill: 'start_line', minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'p_press', category: 'putting', mode: 'pressure', requires: ['putting_green'], primarySkill: 'pressure', minutes: 10, minMinutes: 6 }),
  makeDrill({ id: 'p_test', category: 'putting', mode: 'test', requires: ['putting_green'], primarySkill: 'start_line', minutes: 12, minMinutes: 8 }),

  makeDrill({ id: 'w_build', category: 'wedges', mode: 'build', requires: ['short_game', 'range_mat'], primarySkill: 'distance_control', minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'w_press', category: 'wedges', mode: 'pressure', requires: ['short_game', 'range_mat'], primarySkill: 'distance_control', minutes: 12, minMinutes: 8 }),

  makeDrill({ id: 'c_build', category: 'chipping', mode: 'build', requires: ['short_game'], primarySkill: 'strike', minutes: 10, minMinutes: 6 }),
  makeDrill({ id: 'd_build', category: 'driving', mode: 'build', requires: ['range_mat'], primarySkill: 'start_line', minutes: 12, minMinutes: 8 }),
  makeDrill({ id: 'b_press', category: 'bunker', mode: 'pressure', requires: ['bunker'], primarySkill: 'lie_adjustment', minutes: 10, minMinutes: 6 }),

  // Home — build only, no pressure or test possible at home.
  makeDrill({ id: 'h_build', category: 'chipping', mode: 'build', requires: ['home_putting'], primarySkill: 'strike', minutes: 10, minMinutes: 6 }),

  // The only sim drill, and it needs a towel — for the equipment test.
  makeDrill({ id: 'e_build', category: 'full_swing', mode: 'build', requires: ['sim'], equipment: ['towel'], primarySkill: 'strike', minutes: 12, minMinutes: 8 }),

  // A course drill that must never be generated.
  makeDrill({ id: 'x_course', category: 'putting', mode: 'course', requires: ['course'], primarySkill: 'pressure', minutes: 25, minMinutes: 25 }),
]

const ALL_CAPS: Capability[] = ['range_grass', 'range_mat', 'net', 'putting_green', 'short_game', 'bunker', 'sim', 'course']

const drillById = (id: string) => DRILLS.find((d) => d.id === id)!
const scored = <T extends { drillId: string }>(blocks: T[]) =>
  blocks.filter((b) => b.drillId !== LOOSENER_ID)
const withinTolerance = (total: number, requested: number) =>
  total >= requested * 0.9 && total <= requested * 1.1

// --- Tests ----------------------------------------------------------------

describe('generateSession', () => {
  it('every session opens with the composed loosener', () => {
    const { blocks } = generateSession({
      minutes: 30,
      capabilities: ALL_CAPS,
      allDrills: DRILLS,
    })
    expect(blocks[0].drillId).toBe(LOOSENER_ID)
    expect(blocks.length).toBeGreaterThan(1)
  })

  it('15 min at a putting-green-only venue → a valid putting session under 17 min', () => {
    const { blocks, totalMinutes } = generateSession({
      minutes: 15,
      capabilities: ['putting_green'],
      allDrills: DRILLS,
    })
    expect(totalMinutes).toBeLessThan(17)
    expect(scored(blocks).length).toBeGreaterThan(0)
    for (const b of scored(blocks)) {
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
      capabilities: ['home_putting'],
      allDrills: DRILLS,
    })
    expect(scored(blocks).length).toBeGreaterThan(0)
  })

  it('needs ALL of a drill\'s equipment to offer it', () => {
    // e_build is the only sim drill and it requires a towel.
    const noKit = generateSession({
      minutes: 30,
      capabilities: ['sim'],
      allDrills: DRILLS,
    })
    expect(noKit.blocks.length).toBe(0)

    const withKit = generateSession({
      minutes: 30,
      capabilities: ['sim'],
      equipment: ['towel'],
      allDrills: DRILLS,
    })
    expect(scored(withKit.blocks).some((b) => b.drillId === 'e_build')).toBe(true)
  })

  it('caps time on a single capability (mirror-heavy home venue)', () => {
    // Two build drills sharing home_mirror (cap 15 min) shouldn't exceed it.
    const mirrorDrills: Drill[] = [
      makeDrill({ id: 'm1', category: 'full_swing', mode: 'build', requires: ['home_mirror'], primarySkill: 'routine', minutes: 20, minMinutes: 6 }),
      makeDrill({ id: 'm2', category: 'putting', mode: 'build', requires: ['home_mirror'], primarySkill: 'start_line', minutes: 20, minMinutes: 6 }),
    ]
    const { blocks } = generateSession({
      minutes: 30,
      capabilities: ['home_mirror'],
      allDrills: mirrorDrills,
      capabilityMaxBlock: { home_mirror: 15 },
    })
    const mirrorMinutes = scored(blocks).reduce((a, b) => a + b.minutes, 0)
    expect(mirrorMinutes).toBeLessThanOrEqual(15)
  })

  it('never includes a course (Ghost Nine) drill, even at a course venue', () => {
    const { blocks } = generateSession({
      minutes: 60,
      capabilities: ['course', 'putting_green', 'range_mat', 'short_game'],
      allDrills: DRILLS,
    })
    for (const b of scored(blocks)) {
      expect(drillById(b.drillId).mode).not.toBe('course')
    }
  })

  it('focus "wedges" at a putting-green-only venue returns no wedge drills', () => {
    const { blocks } = generateSession({
      minutes: 45,
      capabilities: ['putting_green'],
      focus: ['wedges'],
      allDrills: DRILLS,
    })
    for (const b of scored(blocks)) {
      expect(drillById(b.drillId).category).not.toBe('wedges')
    }
  })

  it('biases toward every focus category, not just one', () => {
    const { blocks } = generateSession({
      minutes: 30,
      capabilities: ALL_CAPS,
      focus: ['driving', 'bunker'],
      allDrills: DRILLS,
    })
    const cats = scored(blocks).map((b) => drillById(b.drillId).category)
    expect(cats).toContain('driving')
    expect(cats).toContain('bunker')
  })

  it('avoids a recent drill when an equivalent alternative exists', () => {
    const { blocks } = generateSession({
      minutes: 15,
      capabilities: ['putting_green'],
      recentDrillIds: ['p_build1'],
      allDrills: DRILLS,
    })
    const buildBlock = scored(blocks).find(
      (b) => drillById(b.drillId).mode === 'build',
    )
    expect(buildBlock).toBeDefined()
    expect(buildBlock!.drillId).toBe('p_build2')
  })

  it('balances on skill — no three identical primary skills in a row', () => {
    const { blocks } = generateSession({
      minutes: 60,
      capabilities: ALL_CAPS,
      allDrills: DRILLS,
    })
    const skills = scored(blocks).map((b) => drillById(b.drillId).primarySkill)
    const maxSame = Math.max(
      ...[...new Set(skills)].map((s) => skills.filter((x) => x === s).length),
    )
    expect(maxSame).toBeLessThanOrEqual(2)
  })

  it('total minutes are always within ±10% of requested', () => {
    const scenarios: { minutes: number; capabilities: Capability[] }[] = [
      { minutes: 15, capabilities: ['putting_green'] },
      { minutes: 20, capabilities: ALL_CAPS },
      { minutes: 30, capabilities: ['putting_green', 'short_game'] },
      { minutes: 45, capabilities: ALL_CAPS },
      { minutes: 60, capabilities: ALL_CAPS },
      { minutes: 30, capabilities: ['home_putting'] },
    ]
    for (const s of scenarios) {
      const { totalMinutes, blocks } = generateSession({
        ...s,
        allDrills: DRILLS,
      })
      expect(scored(blocks).length).toBeGreaterThan(0)
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
    const categories = new Set(
      scored(blocks).map((b) => drillById(b.drillId).category),
    )
    expect(categories.size).toBeGreaterThan(1)
  })
})
