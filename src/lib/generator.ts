import type {
  Capability,
  Category,
  Drill,
  Equipment,
  Mode,
  SessionBlock,
  SkillId,
} from '@/types'

/** Id of the composed warm-up block the generator prepends to every session. */
export const LOOSENER_ID = 'loosener'

export interface GeneratedSession {
  blocks: SessionBlock[]
  totalMinutes: number
  reason?: string
}

export interface GenerateOptions {
  minutes: number
  capabilities: Capability[]
  equipment?: Equipment[] //   kit available; a drill needs ALL of its equipment
  focus?: Category[] //        bias toward these categories (may be several)
  recentDrillIds?: string[]
  allDrills: Drill[]
  /** maxBlockMinutes per capability — caps time spent on any one activity. */
  capabilityMaxBlock?: Partial<Record<Capability, number>>
}

const TOLERANCE = 0.1

const CONSEQUENCE: Record<Mode, number> = {
  warmup: 0,
  build: 1,
  pressure: 2,
  test: 3,
  course: 4,
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

function loosenerMinutes(minutes: number): number {
  if (minutes < 25) return 2
  if (minutes < 50) return 3
  return 5
}

function scoredShape(minutes: number): Mode[] {
  if (minutes < 20) return ['build']
  if (minutes <= 40) return ['build', 'pressure']
  if (minutes < 55) return ['build', 'build', 'pressure']
  return ['build', 'build', 'pressure', 'test']
}

/** A drill fits if the venue has ANY required capability and ALL its equipment. */
function isEligible(
  d: Drill,
  caps: Capability[],
  equipment: Equipment[],
): boolean {
  return (
    d.requires.some((r) => caps.includes(r)) &&
    d.equipment.every((e) => equipment.includes(e))
  )
}

interface PickContext {
  eligible: Drill[]
  chosenIds: Set<string>
  recent: Set<string>
  focus?: Category[]
  usedCategories: Map<Category, number>
  usedSkills: Map<SkillId, number>
}

function rank(d: Drill, ctx: PickContext): number {
  const focusMatch = ctx.focus?.length && ctx.focus.includes(d.category) ? 1 : 0
  const fresh = ctx.recent.has(d.id) ? 0 : 1
  const unusedSkill = (ctx.usedSkills.get(d.primarySkill) ?? 0) === 0 ? 1 : 0
  const unusedCategory = (ctx.usedCategories.get(d.category) ?? 0) === 0 ? 1 : 0
  return focusMatch * 5 + fresh * 2 + unusedSkill * 2 + unusedCategory * 1
}

function pickForMode(mode: Mode, ctx: PickContext): Drill | undefined {
  const pool = ctx.eligible.filter(
    (d) => d.mode === mode && !ctx.chosenIds.has(d.id),
  )
  if (pool.length === 0) return undefined
  return [...pool].sort(
    (a, b) => rank(b, ctx) - rank(a, ctx) || a.id.localeCompare(b.id),
  )[0]
}

function diversify(chosen: Drill[], eligible: Drill[]): Drill[] {
  if (chosen.length < 2) return chosen
  const categories = new Set(chosen.map((d) => d.category))
  if (categories.size > 1) return chosen

  const onlyCategory = chosen[0].category
  const anotherExists = eligible.some((d) => d.category !== onlyCategory)
  if (!anotherExists) return chosen

  for (let i = 0; i < chosen.length - 1; i++) {
    const used = new Set(chosen.map((d) => d.id))
    const alt = eligible
      .filter(
        (d) =>
          d.mode === chosen[i].mode &&
          d.category !== onlyCategory &&
          !used.has(d.id),
      )
      .sort((a, b) => a.id.localeCompare(b.id))[0]
    if (alt) {
      chosen[i] = alt
      return chosen
    }
  }
  return chosen
}

/**
 * The capability a drill's time counts against — the venue-provided one with
 * the smallest maxBlockMinutes (the binding constraint). Blocks and the session
 * are then capped so no single activity runs past its own limit.
 */
function bindingBucket(
  d: Drill,
  caps: Capability[],
  capMax: Partial<Record<Capability, number>> | undefined,
): { bucket: string; cap: number } {
  if (!capMax) return { bucket: '_', cap: Infinity }
  const usable = d.requires.filter((r) => caps.includes(r))
  if (usable.length === 0) return { bucket: '_', cap: Infinity }
  let best = usable[0]
  for (const c of usable) {
    if ((capMax[c] ?? Infinity) < (capMax[best] ?? Infinity)) best = c
  }
  return { bucket: best, cap: capMax[best] ?? Infinity }
}

/**
 * Spread `budget` minutes across the drills. Each minute goes to the block that
 * is furthest below its share, respecting per-block soft caps and per-capability
 * totals (so a mirror+carpet session can't become 30 minutes of mirror).
 */
function allocate(
  drills: Drill[],
  budget: number,
  blockCap: number[],
  bucketOf: string[],
  bucketCap: Record<string, number>,
): number[] {
  const weight = drills.map((d) => Math.max(1, d.minutes))
  const alloc = drills.map((d, i) =>
    Math.min(Math.max(1, Math.floor(d.minMinutes)), blockCap[i]),
  )
  const bucketUsed: Record<string, number> = {}
  for (let i = 0; i < drills.length; i++)
    bucketUsed[bucketOf[i]] = (bucketUsed[bucketOf[i]] ?? 0) + alloc[i]

  const canAdd = (i: number) =>
    alloc[i] < blockCap[i] && bucketUsed[bucketOf[i]] < bucketCap[bucketOf[i]]

  let used = sum(alloc)
  let guard = 100_000
  while (used < budget && guard-- > 0) {
    let best = -1
    let bestRatio = Infinity
    for (let i = 0; i < drills.length; i++) {
      if (!canAdd(i)) continue
      const r = alloc[i] / weight[i]
      if (r < bestRatio) {
        bestRatio = r
        best = i
      }
    }
    if (best < 0) break
    alloc[best] += 1
    bucketUsed[bucketOf[best]] += 1
    used += 1
  }
  return alloc
}

function chooseDropIndex(drills: Drill[]): number {
  const lastIdx = drills.length - 1
  if (lastIdx < 1) return -1

  const modeCounts = new Map<Mode, number>()
  for (const d of drills) modeCounts.set(d.mode, (modeCounts.get(d.mode) ?? 0) + 1)

  for (let i = lastIdx - 1; i >= 0; i--) {
    if ((modeCounts.get(drills[i].mode) ?? 0) > 1) return i
  }

  let best = -1
  let bestConsequence = Infinity
  for (let i = 0; i < lastIdx; i++) {
    const c = CONSEQUENCE[drills[i].mode]
    if (c < bestConsequence) {
      bestConsequence = c
      best = i
    }
  }
  return best
}

/**
 * Build a practice session that fits the time available, the venue's facilities
 * and its equipment. Pure — no React, storage or randomness — so it always
 * produces the same session for the same inputs. Every session opens with a
 * short composed loosener, then the scored blocks.
 */
export function generateSession(opts: GenerateOptions): GeneratedSession {
  const { minutes, capabilities, focus, allDrills } = opts
  const equipment = opts.equipment ?? []
  const capMax = opts.capabilityMaxBlock
  const recent = new Set(opts.recentDrillIds ?? [])
  const reasons: string[] = []

  const eligible = allDrills.filter(
    (d) => d.mode !== 'course' && isEligible(d, capabilities, equipment),
  )
  if (eligible.length === 0) {
    return {
      blocks: [],
      totalMinutes: 0,
      reason:
        'Nothing in the library fits this venue yet. Try a different place, or tick more of the kit you have.',
    }
  }

  const ctx: PickContext = {
    eligible,
    chosenIds: new Set(),
    recent,
    focus,
    usedCategories: new Map(),
    usedSkills: new Map(),
  }
  let chosen: Drill[] = []
  for (const mode of scoredShape(minutes)) {
    const pick = pickForMode(mode, ctx)
    if (!pick) continue
    chosen.push(pick)
    ctx.chosenIds.add(pick.id)
    ctx.usedCategories.set(pick.category, (ctx.usedCategories.get(pick.category) ?? 0) + 1)
    ctx.usedSkills.set(pick.primarySkill, (ctx.usedSkills.get(pick.primarySkill) ?? 0) + 1)
  }

  if (chosen.length === 0) {
    const best = [...eligible].sort(
      (a, b) =>
        CONSEQUENCE[b.mode] - CONSEQUENCE[a.mode] || a.id.localeCompare(b.id),
    )[0]
    chosen = [best]
    reasons.push('Limited options here — this is the best single drill that fits.')
  }

  chosen = diversify(chosen, eligible)
  chosen.sort((a, b) => CONSEQUENCE[a.mode] - CONSEQUENCE[b.mode])

  const last = chosen[chosen.length - 1]
  if (minutes >= 20 && CONSEQUENCE[last.mode] < CONSEQUENCE.pressure) {
    reasons.push(
      'No pressure or test drill is available here, so the session finishes on the most demanding drill it could.',
    )
  }

  // Fit into the budget left after the loosener, capping per capability.
  const loose = loosenerMinutes(minutes)
  const scoredBudget = Math.max(1, minutes - loose)

  const fit = (drills: Drill[]) => {
    const bucketOf: string[] = []
    const bucketCap: Record<string, number> = {}
    const blockCap: number[] = []
    for (const d of drills) {
      const { bucket, cap } = bindingBucket(d, capabilities, capMax)
      bucketOf.push(bucket)
      bucketCap[bucket] = cap
      blockCap.push(Math.min(Math.ceil(d.minutes) + 20, cap))
    }
    return allocate(drills, scoredBudget, blockCap, bucketOf, bucketCap)
  }

  let allocation = fit(chosen)
  let trimmed = false
  while (sum(allocation) > scoredBudget * (1 + TOLERANCE) && chosen.length > 1) {
    const dropIdx = chooseDropIndex(chosen)
    if (dropIdx < 0) break
    chosen.splice(dropIdx, 1)
    trimmed = true
    allocation = fit(chosen)
  }
  if (trimmed) reasons.push('Trimmed the session to fit the time you have.')

  const blocks: SessionBlock[] = [
    { drillId: LOOSENER_ID, minutes: loose, completed: false },
    ...chosen.map((d, i) => ({
      drillId: d.id,
      minutes: allocation[i],
      completed: false,
    })),
  ]

  return {
    blocks,
    totalMinutes: loose + sum(allocation),
    reason: reasons.length ? Array.from(new Set(reasons)).join(' ') : undefined,
  }
}
