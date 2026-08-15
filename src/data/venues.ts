import type { Venue } from '@/types'

/**
 * The starter venues a brand-new user gets, on the current capability model.
 * Each is chosen to actually yield a session out of the box — including "At
 * home", which now has real drills. Users edit capabilities and tick equipment
 * in Settings. Ids are stable so seeding is idempotent.
 */
export const STARTER_VENUES: Venue[] = [
  {
    id: 'venue_club',
    name: 'Golf club',
    capabilities: ['putting_green', 'short_game', 'bunker'],
    equipment: ['putter', 'wedge', 'two_coins'],
    isDefault: true,
  },
  {
    id: 'venue_range',
    name: 'Driving range',
    capabilities: ['range_mat', 'short_game'],
    equipment: ['alignment_sticks', 'towel', 'wedge'],
  },
  {
    id: 'venue_home',
    name: 'At home',
    capabilities: ['home_putting', 'home_mirror'],
    equipment: ['putter', 'two_coins', 'mirror'],
  },
]
