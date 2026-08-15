/**
 * What a place lets you physically do. A venue is described by which of these it
 * supports — the generator never looks at a venue's name, only its capabilities
 * and equipment. A drill needs ANY of its required capabilities but ALL of its
 * required equipment.
 */
export type Capability =
  | 'range_grass' //   hitting off turf — real low-point feedback
  | 'range_mat' //     hitting off mats — flight yes, turf feedback no
  | 'net' //           hitting into a net, no ball flight
  | 'sim' //           simulator / launch monitor
  | 'putting_green' // full outdoor putting surface
  | 'short_game' //    chipping / pitching area with a green
  | 'bunker' //        practice sand
  | 'course' //        on the course, playing holes
  | 'home_putting' //  carpet or mat, putter only
  | 'home_swing' //    room for a small swing with foam balls
  | 'home_mirror' //   no ball, no space — rehearsal only

/** Capabilities are grouped; the group drives the session-length ceiling. */
export type CapabilityGroup = 'range' | 'enclosed' | 'short' | 'course' | 'home'

/** Kit a drill can require. A venue lists what it has; drills need all of theirs. */
export type Equipment =
  | 'towel'
  | 'alignment_sticks'
  | 'face_spray'
  | 'line_spray'
  | 'foam_balls'
  | 'mirror'
  | 'putter'
  | 'two_coins'
  | 'wedge'

/**
 * A user-created place. Replaces hardcoded course names — the user builds their
 * own list of the places they actually practise and ticks the kit they have.
 */
export interface Venue {
  id: string
  name: string // "My club", "Range down the road", "Living room"
  capabilities: Capability[]
  equipment: Equipment[]
  isDefault?: boolean
}
