import type { Venue } from '@/types'

/**
 * The three venues a brand-new user starts with. They can be edited or deleted
 * in Settings. Ids are stable so seeding is idempotent.
 */
export const STARTER_VENUES: Venue[] = [
  {
    id: 'venue_club',
    name: 'Golf club',
    capabilities: ['putting_green', 'short_game', 'bunker'],
    isDefault: true,
  },
  {
    id: 'venue_range',
    name: 'Driving range',
    capabilities: ['range', 'short_game'],
  },
  {
    id: 'venue_home',
    name: 'At home',
    capabilities: ['home'],
  },
]
