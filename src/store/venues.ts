import { create } from 'zustand'
import type { Capability, Venue } from '@/types'
import { storage, keys } from '@/lib/storage'
import { newId } from '@/lib/id'
import { STARTER_VENUES } from '@/data/venues'

// IndexedDB returns keys in lexicographic order, which would reshuffle venues on
// every reload. Sort starters into their intended order first, others by name.
const STARTER_ORDER = STARTER_VENUES.map((v) => v.id)
function sortVenues(vs: Venue[]): Venue[] {
  return [...vs].sort((a, b) => {
    const ia = STARTER_ORDER.indexOf(a.id)
    const ib = STARTER_ORDER.indexOf(b.id)
    if (ia !== -1 || ib !== -1) {
      return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib)
    }
    return a.name.localeCompare(b.name)
  })
}

interface VenuesState {
  venues: Venue[]
  hydrated: boolean
  hydrate: () => Promise<void>
  addVenue: (name: string, capabilities: Capability[]) => Venue
  updateVenue: (id: string, patch: Partial<Omit<Venue, 'id'>>) => void
  removeVenue: (id: string) => void
}

export const useVenues = create<VenuesState>((set, get) => ({
  venues: [],
  hydrated: false,

  hydrate: async () => {
    let venues = await storage.list<Venue>(keys.venuePrefix)
    if (venues.length === 0) {
      // First run — seed the three starter venues and persist them.
      venues = STARTER_VENUES
      await Promise.all(venues.map((v) => storage.set(keys.venue(v.id), v)))
    }
    // Keep the starter order stable; user-added venues fall in after.
    set({ venues: sortVenues(venues), hydrated: true })
  },

  addVenue: (name, capabilities) => {
    const venue: Venue = { id: newId(), name, capabilities }
    void storage.set(keys.venue(venue.id), venue)
    set({ venues: [...get().venues, venue] })
    return venue
  },

  updateVenue: (id, patch) => {
    const venues = get().venues.map((v) =>
      v.id === id ? { ...v, ...patch } : v,
    )
    const updated = venues.find((v) => v.id === id)
    if (updated) void storage.set(keys.venue(id), updated)
    set({ venues })
  },

  removeVenue: (id) => {
    void storage.remove(keys.venue(id))
    set({ venues: get().venues.filter((v) => v.id !== id) })
  },
}))
