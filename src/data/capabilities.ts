import type { Capability, CapabilityGroup, Equipment } from '@/types'

/**
 * The facility model, ported from library/capabilities.json. Capabilities are
 * grouped; a drill needs ANY of its required capabilities but ALL of its
 * equipment. Session length is governed by an additive ceiling (see lib/limits).
 */

interface CapabilityMeta {
  label: string
  group: CapabilityGroup
  help: string
}

export const CAPABILITY_META: Record<Capability, CapabilityMeta> = {
  range_grass: { label: 'Range — real grass', group: 'range', help: 'Hitting off turf. Divots, real low point feedback.' },
  range_mat: { label: 'Range — mats', group: 'range', help: 'Hitting off artificial mats. Ball flight yes, turf feedback no.' },
  net: { label: 'Net', group: 'enclosed', help: 'Hitting into a net. No ball flight to judge.' },
  sim: { label: 'Simulator / launch monitor', group: 'enclosed', help: 'Indoor bay with distance and dispersion numbers.' },
  putting_green: { label: 'Putting green', group: 'short', help: 'Full outdoor putting surface.' },
  short_game: { label: 'Short game area', group: 'short', help: 'Chipping and pitching area with a green to land on.' },
  bunker: { label: 'Practice bunker', group: 'short', help: 'Sand you are allowed to practise in.' },
  course: { label: 'On the course', group: 'course', help: 'Playing holes, quiet enough for a second ball.' },
  home_putting: { label: 'Home — carpet or mat', group: 'home', help: 'Somewhere flat to putt indoors.' },
  home_swing: { label: 'Home — room to swing', group: 'home', help: 'Space for a small swing with foam balls.' },
  home_mirror: { label: 'Home — mirror only', group: 'home', help: 'No ball, no space. Rehearsal and setup work.' },
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  towel: 'Towel',
  alignment_sticks: 'Alignment sticks',
  face_spray: 'Face spray or impact tape',
  line_spray: 'Line spray or chalk',
  foam_balls: 'Foam or plastic balls',
  mirror: 'Full length mirror',
  putter: 'Putter',
  two_coins: 'Two coins or tees',
  wedge: 'Wedge',
}

export const EQUIPMENT_ORDER: Equipment[] = [
  'putter', 'wedge', 'foam_balls', 'two_coins', 'alignment_sticks',
  'towel', 'mirror', 'face_spray', 'line_spray',
]

/** Longest a session should spend on that single activity (minutes). */
export const CAP_MAX_BLOCK: Record<Capability, number> = {
  home_mirror: 15,
  home_putting: 20,
  home_swing: 25,
  net: 45,
  range_mat: 60,
  range_grass: 60,
  sim: 60,
  putting_green: 45,
  short_game: 60,
  bunker: 30,
  course: 180,
}

export const GROUP_CEILINGS: Record<CapabilityGroup, number> = {
  home: 45,
  enclosed: 60,
  range: 60,
  short: 60,
  course: 180,
}

export const PICKER_OPTIONS = [10, 15, 20, 30, 45, 60] as const

/** Venue editor lays capabilities out under their group. */
export const CAPABILITY_GROUPS: {
  group: CapabilityGroup
  label: string
  capabilities: Capability[]
}[] = [
  { group: 'range', label: 'Driving range', capabilities: ['range_grass', 'range_mat'] },
  { group: 'enclosed', label: 'Net / simulator', capabilities: ['net', 'sim'] },
  { group: 'short', label: 'Short game', capabilities: ['putting_green', 'short_game', 'bunker'] },
  { group: 'home', label: 'At home', capabilities: ['home_putting', 'home_swing', 'home_mirror'] },
  { group: 'course', label: 'On the course', capabilities: ['course'] },
]

/** Flat capability order (grouped order), for coverage and misc listing. */
export const CAPABILITY_ORDER: Capability[] = CAPABILITY_GROUPS.flatMap(
  (g) => g.capabilities,
)

export const HONESTY_MIN_DRILLS = 3
