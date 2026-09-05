import type {
  Benchmark,
  Capability,
  Category,
  Drill,
  Equipment,
  LogType,
  Mode,
  SkillId,
  SpecialDrill,
} from '@/types'
import { LOOSENER_ID } from '@/lib/generator'
import rawOriginal from './library/drills.json'
import rawBatch2 from './library/drills-batch-2.json'
import rawBatch3 from './library/drills-batch-3-home.json'

/**
 * The full 35-drill library, merged from the three authored JSON batches and
 * normalised to the Drill shape:
 *  - metric.myTarget (Brett's 9-handicap target) becomes a single Under 9 band;
 *    the other bands stay empty until there's real data.
 *  - special 'random_yardage_20_100' maps to our 'random_yardage'.
 *  - minMinutes was missing on the original 13 — injected below. Least
 *    confident: p3 Draw and Hit, d2 Nine Tee Shots, p1 Four Rungs. The four
 *    course (Ghost Nine) drills get minMinutes = minutes; they never generate.
 */

interface RawMetric {
  label: string
  max: number
  lowerIsBetter: boolean
  myTarget?: number
}
interface RawDrill {
  id: string
  name: string
  category: string
  mode: string
  requires: string[]
  equipment?: string[]
  minutes: number
  minMinutes?: number
  purpose: string
  why?: string
  setup: string[]
  tip: string
  scoring: string
  metric: RawMetric
  logType: string
  focusArea?: string
  special?: string
  surfaceNote?: string
  primarySkill: string
  skills: string[]
}

// minMinutes for the original 13 (missing in source). Course drills = minutes.
const MIN_MINUTES: Record<string, number> = {
  r1: 12, r2: 10, r3: 25, p1: 15, p2: 12, p3: 12, p4: 25,
  u1: 12, u2: 10, u3: 20, d1: 12, d2: 15, d3: 120,
}

function mapSpecial(s?: string): SpecialDrill | undefined {
  if (s === 'carry_table') return 'carry_table'
  if (s === 'random_yardage_20_100' || s === 'random_yardage') return 'random_yardage'
  return undefined
}

function normalize(raw: RawDrill): Drill {
  const benchmarks: Benchmark[] =
    raw.metric.myTarget !== undefined
      ? [{ band: 'Under 9', target: raw.metric.myTarget }]
      : []
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category as Category,
    mode: raw.mode as Mode,
    requires: raw.requires as Capability[],
    equipment: (raw.equipment ?? []) as Equipment[],
    minutes: raw.minutes,
    minMinutes: raw.minMinutes ?? MIN_MINUTES[raw.id] ?? Math.round(raw.minutes * 0.6),
    purpose: raw.purpose,
    why: raw.why,
    setup: raw.setup,
    tip: raw.tip,
    scoring: raw.scoring,
    metric: {
      label: raw.metric.label,
      max: raw.metric.max,
      lowerIsBetter: raw.metric.lowerIsBetter,
    },
    benchmarks,
    logType: raw.logType as LogType,
    primarySkill: raw.primarySkill as SkillId,
    skills: raw.skills as SkillId[],
    focusArea: raw.focusArea,
    special: mapSpecial(raw.special),
    surfaceNote: raw.surfaceNote,
  }
}

export const DRILLS: Drill[] = [
  ...(rawOriginal as unknown as RawDrill[]),
  ...(rawBatch2 as unknown as RawDrill[]),
  ...(rawBatch3 as unknown as RawDrill[]),
].map(normalize)

/**
 * The composed warm-up loosener. Not part of the browsable library and never
 * selected by the generator — it's prepended to every session as a brief opener.
 */
export const LOOSENER: Drill = {
  id: LOOSENER_ID,
  name: 'Quick loosener',
  category: 'full_swing',
  mode: 'warmup',
  requires: ['range_grass', 'range_mat', 'net', 'sim', 'short_game', 'putting_green', 'home_swing'],
  equipment: [],
  minutes: 3,
  minMinutes: 2,
  purpose: 'Wake the swing up before you start scoring.',
  setup: [
    'A dozen easy swings, building from half to full.',
    'A few balls if you have them — wedge up through a mid iron.',
    'No scoring here. Just get loose and find your tempo.',
  ],
  tip: 'Tempo, not power. You are warming up, not auditioning.',
  scoring: 'No score — just get moving.',
  metric: { label: '', max: 0, lowerIsBetter: false },
  benchmarks: [],
  logType: 'none',
  primarySkill: 'routine',
  skills: ['routine'],
}

const BY_ID = new Map<string, Drill>(
  [...DRILLS, LOOSENER].map((d) => [d.id, d]),
)
export const getDrill = (id: string): Drill | undefined => BY_ID.get(id)

/** Ghost Nine and any other standalone on-course drills. */
export const COURSE_DRILLS = DRILLS.filter((d) => d.mode === 'course')

/** Everything the generator may draw from (course drills excluded). */
export const GENERATABLE_DRILLS = DRILLS.filter((d) => d.mode !== 'course')

/**
 * What we put in front of someone who has never played. Hand-picked rather
 * than generated: a brand-new golfer has no game to diagnose, so this is the
 * honest starting order — grip and setup, then contact, then putting. All are
 * `build` fundamentals that need nothing but a club.
 */
export const BEGINNER_STARTER_IDS = ['h4', 's4', 'h8'] as const

export const STARTER_DRILLS: Drill[] = BEGINNER_STARTER_IDS.map(
  (id) => BY_ID.get(id),
).filter((d): d is Drill => Boolean(d))

/** Generatable drills a venue can actually run: ANY capability, ALL equipment. */
export function eligibleDrills(
  caps: Capability[],
  equipment: Equipment[],
): Drill[] {
  return GENERATABLE_DRILLS.filter(
    (d) =>
      d.requires.some((r) => caps.includes(r)) &&
      d.equipment.every((e) => equipment.includes(e)),
  )
}
