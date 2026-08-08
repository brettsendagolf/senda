import type {
  Capability,
  Category,
  Drill,
  Mode,
  SessionBlock,
  SkillId,
} from '@/types'

/** Id of the composed warm-up block the generator prepends to every session. */
export const LOOSENER_ID = 'loosener'

/**
 * The result of the solver. `blocks` are in the order they should be performed
 * and always open with the composed loosener. `reason` is set only when the
 * session had to degrade (few facilities, no pressure drill available, time too
 * tight to keep every block) — it is user-facing copy the Today screen shows
 * verbatim.
 */
export interface GeneratedSession {
  blocks: SessionBlock[]
  totalMinutes: number
  reason?: string
}

export interface GenerateOptions {
  minutes: number
  capabilities: Capability[]
  focus?: Category
  recentDrillIds?: string[] // avoid repeating the last session's drills
  allDrills: Drill[]
}

/** Total allocated time must land within ±10% of what was requested. */
const TOLERANCE = 0.1

/** How much a mode "counts" — the session should end on the highest one. */
const CONSEQUENCE: Record<Mode, number> = {
  warmup: 0,
  build: 1,
  pressure: 2,
  test: 3,
  course: 4, // never appears in a generated session; here for completeness
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

/** A brief loosener, scaled a little with the session but always short. */
function loosenerMinutes(minutes: number): number {
  if (minutes < 25) return 2
  if (minutes < 50) return 3
  return 5
}

/**
 * The scored modes to fill, by time available (the warm-up slot is handled
 * separately by the composed loosener, so it's not in these lists).
 *  - under 20 min: one build. No pressure — no time to earn it.
 *  - 20–40 min: build, pressure.
 *  - over 40 min: two builds, pressure, and a test when there's room.
 * Only one pressure block ever, unless the session is over 45 minutes.
 */
function scoredShape(minutes: number): Mode[] {
  if (minutes < 20) return ['build']
  if (minutes <= 40) return ['build', 'pressure']
  if (minutes < 55) return ['build', 'build', 'pressure']
  return ['build', 'build', 'pressure', 'test']
}

/** A drill fits a venue if the venue has ANY of the drill's required caps. */
function isEligible(d: Drill, caps: Capability[]): boolean {
  return d.requires.some((r) => caps.includes(r))
}

interface PickContext {
  eligible: Drill[]
  chosenIds: Set<string>
  recent: Set<string>
  focus?: Category
  usedCategories: Map<Category, number>
  usedSkills: Map<SkillId, number>
}

/**
 * Rank a candidate for a slot. Higher is better. The weights encode the rules:
 *  - focus bias dominates (×5) so a focus session stays on-focus;
 *  - freshness (×2) avoids a recently-used drill when an equivalent exists;
 *  - skill variety (×2) stops three distance-control drills in a row;
 *  - category variety (×1) breaks remaining ties toward a new shot type.
 */
function rank(d: Drill, ctx: PickContext): number {
  const focusMatch = ctx.focus && d.category === ctx.focus ? 1 : 0
  const fresh = ctx.recent.has(d.id) ? 0 : 1
  const unusedSkill = (ctx.usedSkills.get(d.primarySkill) ?? 0) === 0 ? 1 : 0
  const unusedCategory = (ctx.usedCategories.get(d.category) ?? 0) === 0 ? 1 : 0
  return focusMatch * 5 + fresh * 2 + unusedSkill * 2 + unusedCategory * 1
}

/** Best available drill for a given mode, or undefined if none fit. */
function pickForMode(mode: Mode, ctx: PickContext): Drill | undefined {
  const pool = ctx.eligible.filter(
    (d) => d.mode === mode && !ctx.chosenIds.has(d.id),
  )
  if (pool.length === 0) return undefined
  return [...pool].sort(
    (a, b) => rank(b, ctx) - rank(a, ctx) || a.id.localeCompare(b.id),
  )[0]
}

/**
 * Rule: never let a session be 100% one category unless the venue only supports
 * one. If everything landed in a single category but another is available, swap
 * one non-final block for a same-mode drill in a different category.
 */
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
 * Spread `budget` minutes across the drills, each between its `minMinutes` floor
 * and a generous soft cap, in proportion to typical length. Whole minutes that
 * sum as close to the budget as the floors/caps allow.
 */
function allocate(drills: Drill[], budget: number): number[] {
  const floor = drills.map((d) => Math.max(1, Math.floor(d.minMinutes)))
  const cap = drills.map((d, i) => Math.max(floor[i], Math.ceil(d.minutes) + 20))
  const weight = drills.map((d) => Math.max(1, d.minutes))
  const alloc = [...floor]

  let remaining = budget - sum(alloc)
  if (remaining <= 0) return alloc

  const openSlots = () =>
    drills.map((_, i) => i).filter((i) => alloc[i] < cap[i])

  const first = openSlots()
  if (first.length > 0) {
    const wsum = sum(first.map((i) => weight[i]))
    for (const i of first) {
      const share = Math.floor((remaining * weight[i]) / wsum)
      alloc[i] += Math.min(share, cap[i] - alloc[i])
    }
  }

  remaining = budget - sum(alloc)
  let idxs = openSlots().sort((a, b) => weight[b] - weight[a] || a - b)
  let guard = 10_000
  while (remaining > 0 && idxs.length > 0 && guard-- > 0) {
    const before = remaining
    for (const i of idxs) {
      if (remaining <= 0) break
      if (alloc[i] < cap[i]) {
        alloc[i] += 1
        remaining -= 1
      }
    }
    idxs = idxs.filter((i) => alloc[i] < cap[i])
    if (remaining === before) break
  }
  return alloc
}

/** Pick a block to drop when the floors overshoot the time budget. */
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
 * Build a practice session that fits the time available and the venue's
 * facilities. Pure — no React, no storage, no randomness — so it is trivially
 * testable and always produces the same session for the same inputs. Every
 * session opens with a short composed loosener, then the scored blocks.
 */
export function generateSession(opts: GenerateOptions): GeneratedSession {
  const { minutes, capabilities, focus, allDrills } = opts
  const recent = new Set(opts.recentDrillIds ?? [])
  const reasons: string[] = []

  // Course (Ghost Nine) drills are standalone and never generated.
  const eligible = allDrills.filter(
    (d) => d.mode !== 'course' && isEligible(d, capabilities),
  )
  if (eligible.length === 0) {
    return {
      blocks: [],
      totalMinutes: 0,
      reason:
        'Nothing in the library fits this venue yet. Try a different place, or add drills for it.',
    }
  }

  // 1) Fill each scored slot; skip a slot the venue can't support.
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
    ctx.usedCategories.set(
      pick.category,
      (ctx.usedCategories.get(pick.category) ?? 0) + 1,
    )
    ctx.usedSkills.set(
      pick.primarySkill,
      (ctx.usedSkills.get(pick.primarySkill) ?? 0) + 1,
    )
  }

  if (chosen.length === 0) {
    const best = [...eligible].sort(
      (a, b) =>
        CONSEQUENCE[b.mode] - CONSEQUENCE[a.mode] || a.id.localeCompare(b.id),
    )[0]
    chosen = [best]
    reasons.push('Limited options here — this is the best single drill that fits.')
  }

  // 2) Category variety, then order so the last block is the most consequential.
  chosen = diversify(chosen, eligible)
  chosen.sort((a, b) => CONSEQUENCE[a.mode] - CONSEQUENCE[b.mode])

  const last = chosen[chosen.length - 1]
  if (minutes >= 20 && CONSEQUENCE[last.mode] < CONSEQUENCE.pressure) {
    reasons.push(
      'No pressure or test drill is available here, so the session finishes on the most demanding drill it could.',
    )
  }

  // 3) Fit the scored blocks into the budget left after the loosener.
  const loose = loosenerMinutes(minutes)
  const scoredBudget = Math.max(1, minutes - loose)
  let allocation = allocate(chosen, scoredBudget)
  let trimmed = false
  while (sum(allocation) > scoredBudget * (1 + TOLERANCE) && chosen.length > 1) {
    const dropIdx = chooseDropIndex(chosen)
    if (dropIdx < 0) break
    chosen.splice(dropIdx, 1)
    trimmed = true
    allocation = allocate(chosen, scoredBudget)
  }
  if (trimmed) reasons.push('Trimmed the session to fit the time you have.')

  // 4) Prepend the composed loosener; scored blocks follow.
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
