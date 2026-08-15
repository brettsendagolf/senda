import type { Capability } from '@/types'
import {
  CAP_MAX_BLOCK,
  GROUP_CEILINGS,
  CAPABILITY_META,
  PICKER_OPTIONS,
} from '@/data/capabilities'

/**
 * The additive session-length ceiling. Switching activity resets attention, so
 * a mirror plus a carpet supports a longer session than either alone:
 *
 *   ceiling = sum(maxBlockMinutes across the venue's capabilities),
 *             clamped to the highest groupCeiling among them,
 *             rounded DOWN to the nearest picker option.
 *
 * Returns 0 for a venue with no capabilities.
 */
export function sessionCeiling(capabilities: Capability[]): number {
  if (capabilities.length === 0) return 0
  const raw = capabilities.reduce((s, c) => s + (CAP_MAX_BLOCK[c] ?? 0), 0)
  const groupCeiling = Math.max(
    ...capabilities.map((c) => GROUP_CEILINGS[CAPABILITY_META[c].group]),
  )
  const clamped = Math.min(raw, groupCeiling)
  const options = [...PICKER_OPTIONS].filter((o) => o <= clamped)
  return options.length ? Math.max(...options) : PICKER_OPTIONS[0]
}

/** The time-picker options at or below the venue's ceiling. */
export function pickerOptionsFor(capabilities: Capability[]): number[] {
  const ceiling = sessionCeiling(capabilities)
  return [...PICKER_OPTIONS].filter((o) => o <= ceiling)
}

/** The per-capability block-time caps, passed to the generator. */
export const capabilityMaxBlock = CAP_MAX_BLOCK
