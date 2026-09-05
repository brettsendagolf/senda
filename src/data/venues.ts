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

/**
 * Turn the onboarding "where can you practise" answers into real venues, so
 * Today offers the places the golfer actually named rather than a generic
 * seed. One venue per facility: they are genuinely different places with
 * different drills, and they stay editable in Settings.
 */
export function venuesFromFacilities(facilities: string[]): Venue[] {
  const make = (
    id: string,
    name: string,
    capabilities: Venue['capabilities'],
    equipment: Venue['equipment'],
  ): Venue => ({ id, name, capabilities, equipment })

  const venues: Venue[] = []
  if (facilities.includes('range'))
    venues.push(make('venue_range', 'Driving range', ['range_mat'], ['wedge']))
  if (facilities.includes('putting_green'))
    venues.push(
      make('venue_green', 'Putting green', ['putting_green'], ['putter', 'two_coins']),
    )
  if (facilities.includes('short_game'))
    venues.push(
      make('venue_short', 'Short game area', ['short_game'], ['wedge', 'towel']),
    )
  if (facilities.includes('net'))
    venues.push(make('venue_net', 'Net', ['net'], ['towel']))
  if (facilities.includes('sim'))
    venues.push(make('venue_sim', 'Simulator', ['sim'], []))

  // Nowhere set up yet — give them somewhere the fundamentals still work.
  if (venues.length === 0)
    venues.push(
      make(
        'venue_indoors',
        'Indoors',
        ['home_mirror', 'home_putting'],
        ['putter'],
      ),
    )

  venues[0].isDefault = true
  return venues
}
