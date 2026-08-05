import type { Capability, Category, Drill, Mode, SessionBlock } from '@/types'

/**
 * The result of the solver. `blocks` are in the order they should be performed.
 * `reason` is set only when the session had to degrade (few facilities, no
 * pressure drill available, time too tight to keep every block) — it is written
 * as user-facing copy so the Today screen can show it verbatim.
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
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

/**
 * The ordered list of modes to try to fill, by time available.
 *  - under 20 min: warm up, then build. No pressure — no time to earn it.
 *  - 20–40 min: warm up, build, pressure.
 *  - over 40 min: warm up, two builds, pressure, and a test when there's room.
 */
function shapeFor(minutes: number): Mode[] {
  if (minutes < 20) return ['warmup', 'build']
  if (minutes <= 40) return ['warmup', 'build', 'pressure']
  return minutes >= 55
    ? ['warmup', 'build', 'build', 'pressure', 'test']
    : ['warmup', 'build', 'build', 'pressure']
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
}

/**
 * Rank a candidate for a slot. Higher is better. The weights encode the rules:
 *  - focus bias dominates (×4) so a focus session stays on-focus…
 *  - …but freshness (×2) still breaks ties within the focus category, so we
 *    avoid a recently-used drill when an equivalent one exists;
 *  - a small variety bonus (×1) nudges toward an unused category on ties.
 */
function rank(d: Drill, ctx: PickContext): number {
  const focusMatch = ctx.focus && d.category === ctx.focus ? 1 : 0
  const fresh = ctx.recent.has(d.id) ? 0 : 1
  const unusedCategory = (ctx.usedCategories.get(d.category) ?? 0) === 0 ? 1 : 0
  return focusMatch * 4 + fresh * 2 + unusedCategory * 1
}

/** Best available drill for a given mode, or undefined if none fit. */
function pickForMode(mode: Mode, ctx: PickContext): Drill | undefined {
  const pool = ctx.eligible.filter(
    (d) => d.mode === mode && !ctx.chosenIds.has(d.id),
  )
  if (pool.length === 0) return undefined
  // Sort by rank desc, then id for a stable, deterministic choice.
  return [...pool].sort(
    (a, b) => rank(b, ctx) - rank(a, ctx) || a.id.localeCompare(b.id),
  )[0]
}

/**
 * Rule 5: never let a session be 100% one category unless the venue only
 * supports one. If everything landed in a single category but another category
 * is actually available, swap one non-final block for a same-mode drill in a
 * different category.
 */
function diversify(chosen: Drill[], eligible: Drill[]): Drill[] {
  if (chosen.length < 2) return chosen
  const categories = new Set(chosen.map((d) => d.category))
  if (categories.size > 1) return chosen

  const onlyCategory = chosen[0].category
  const anotherExists = eligible.some((d) => d.category !== onlyCategory)
  if (!anotherExists) return chosen // venue genuinely supports one category

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
 * Spread `budget` minutes across the drills. Each block sits between its
 * `minMinutes` floor and a generous soft cap, and time above the floors is
 * distributed in proportion to each drill's typical length. Returns whole
 * minutes that sum as close to the budget as the floors/caps allow.
 */
function allocate(drills: Drill[], budget: number): number[] {
  const floor = drills.map((d) => Math.max(1, Math.floor(d.minMinutes)))
  const cap = drills.map((d, i) => Math.max(floor[i], Math.ceil(d.minutes) + 20))
  const weight = drills.map((d) => Math.max(1, d.minutes))
  const alloc = [...floor]

  let remaining = budget - sum(alloc)
  if (remaining <= 0) return alloc // already at/over budget at the floors

  const openSlots = () =>
    drills.map((_, i) => i).filter((i) => alloc[i] < cap[i])

  // Proportional pass.
  const first = openSlots()
  if (first.length > 0) {
    const wsum = sum(first.map((i) => weight[i]))
    for (const i of first) {
      const share = Math.floor((remaining * weight[i]) / wsum)
      alloc[i] += Math.min(share, cap[i] - alloc[i])
    }
  }

  // Hand out any leftover a minute at a time, biggest drills first.
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

/**
 * Pick a block to drop when the floors alone overshoot the time budget. Prefer
 * a duplicated mode (the "extra" build), never the final block, and otherwise
 * the lowest-consequence non-final block.
 */
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
 * testable and always produces the same session for the same inputs.
 */
export function generateSession(opts: GenerateOptions): GeneratedSession {
  const { minutes, capabilities, focus, allDrills } = opts
  const recent = new Set(opts.recentDrillIds ?? [])
  const reasons: string[] = []

  const eligible = allDrills.filter((d) => isEligible(d, capabilities))
  if (eligible.length === 0) {
    return {
      blocks: [],
      totalMinutes: 0,
      reason: 'None of your drills match this venue’s facilities yet.',
    }
  }

  // 1) Fill each slot in the shape; skip a slot the venue can't support.
  const ctx: PickContext = {
    eligible,
    chosenIds: new Set(),
    recent,
    focus,
    usedCategories: new Map(),
  }
  let chosen: Drill[] = []
  for (const mode of shapeFor(minutes)) {
    const pick = pickForMode(mode, ctx)
    if (!pick) continue
    chosen.push(pick)
    ctx.chosenIds.add(pick.id)
    ctx.usedCategories.set(
      pick.category,
      (ctx.usedCategories.get(pick.category) ?? 0) + 1,
    )
  }

  // Fallback: the shape's modes matched nothing, but drills do exist — give the
  // single most consequential drill rather than an empty session.
  if (chosen.length === 0) {
    const best = [...eligible].sort(
      (a, b) =>
        CONSEQUENCE[b.mode] - CONSEQUENCE[a.mode] || a.id.localeCompare(b.id),
    )[0]
    chosen = [best]
    reasons.push('Limited options here — this is the best single drill that fits.')
  }

  // 2) Enforce category variety, then order so the last block is the most
  //    consequential thing available (rule 3: finish on a consequence).
  chosen = diversify(chosen, eligible)
  chosen.sort((a, b) => CONSEQUENCE[a.mode] - CONSEQUENCE[b.mode])

  const last = chosen[chosen.length - 1]
  if (minutes >= 20 && CONSEQUENCE[last.mode] < CONSEQUENCE.pressure) {
    reasons.push(
      'No pressure or test drill is available here, so the session finishes on the most demanding drill it could.',
    )
  }

  // 3) Fit the time budget. Compress toward floors first; only drop a block if
  //    the floors still overshoot by more than the tolerance.
  let allocation = allocate(chosen, minutes)
  let trimmed = false
  while (
    sum(allocation) > minutes * (1 + TOLERANCE) &&
    chosen.length > 1
  ) {
    const dropIdx = chooseDropIndex(chosen)
    if (dropIdx < 0) break
    chosen.splice(dropIdx, 1)
    trimmed = true
    allocation = allocate(chosen, minutes)
  }
  if (trimmed) reasons.push('Trimmed the session to fit the time you have.')

  const blocks: SessionBlock[] = chosen.map((d, i) => ({
    drillId: d.id,
    minutes: allocation[i],
    completed: false,
  }))

  return {
    blocks,
    totalMinutes: sum(allocation),
    reason: reasons.length ? Array.from(new Set(reasons)).join(' ') : undefined,
  }
}
