/**
 * What a place lets you physically do. A venue is described purely by which of
 * these it supports — the generator never looks at a venue's name, only its
 * capabilities, so "the range down the road" and "my club" are interchangeable
 * as far as the solver is concerned.
 */
export type Capability =
  | 'range' //          hitting into open space, full shots, see ball flight
  | 'net' //            hitting into a net, no flight feedback
  | 'putting_green' //  a practice putting green
  | 'short_game' //     chipping/pitching area with a green
  | 'bunker' //         a practice bunker
  | 'sim' //            launch monitor or simulator
  | 'course' //         on course, playing holes
  | 'home' //           indoors, carpet, no ball flight, minimal space

/**
 * A user-created place with a set of capabilities. Replaces hardcoded course
 * names — the user builds their own list of the places they actually practise.
 */
export interface Venue {
  id: string
  name: string // "My club", "Range down the road", "Living room"
  capabilities: Capability[]
  isDefault?: boolean
}
