import { create } from 'zustand'
import type { Capability, Equipment, Venue } from '@/types'
import { storage, keys } from '@/lib/storage'
import { newId } from '@/lib/id'
import { STARTER_VENUES } from '@/data/venues'
import { CAPABILITY_ORDER } from '@/data/capabilities'

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

// Legacy capabilities from the first data model, mapped onto the current one.
const LEGACY_CAP: Record<string, Capability[]> = {
  range: ['range_mat'],
  home: ['home_putting'],
}
const KNOWN_CAPS = new Set<string>(CAPABILITY_ORDER)

/** Bring an older stored venue up to the current shape (caps + equipment). */
function migrateVenue(v: Venue): Venue {
  const caps: Capability[] = []
  for (const c of v.capabilities ?? []) {
    if (LEGACY_CAP[c]) caps.push(...LEGACY_CAP[c])
    else if (KNOWN_CAPS.has(c)) caps.push(c)
  }
  return {
    ...v,
    capabilities: [...new Set(caps)],
    equipment: (v.equipment ?? []) as Equipment[],
  }
}

interface VenuesState {
  venues: Venue[]
  hydrated: boolean
  hydrate: () => Promise<void>
  addVenue: (
    name: string,
    capabilities: Capability[],
    equipment: Equipment[],
  ) => Venue
  /** Swap the whole set — used once, when onboarding names the venues. */
  replaceAll: (venues: Venue[]) => Promise<void>
  updateVenue: (id: string, patch: Partial<Omit<Venue, 'id'>>) => void
  removeVenue: (id: string) => void
}

export const useVenues = create<VenuesState>((set, get) => ({
  venues: [],
  hydrated: false,

  hydrate: async () => {
    let venues = await storage.list<Venue>(keys.venuePrefix)
    if (venues.length === 0) {
      venues = STARTER_VENUES
      await Promise.all(venues.map((v) => storage.set(keys.venue(v.id), v)))
    } else {
      // Migrate any legacy venues and persist the upgraded shape.
      const migrated = venues.map(migrateVenue)
      await Promise.all(migrated.map((v) => storage.set(keys.venue(v.id), v)))
      venues = migrated
    }
    set({ venues: sortVenues(venues), hydrated: true })
  },

  addVenue: (name, capabilities, equipment) => {
    const venue: Venue = { id: newId(), name, capabilities, equipment }
    void storage.set(keys.venue(venue.id), venue)
    set({ venues: [...get().venues, venue] })
    return venue
  },

  replaceAll: async (venues) => {
    const existing = await storage.list<Venue>(keys.venuePrefix)
    await Promise.all(existing.map((v) => storage.remove(keys.venue(v.id))))
    await Promise.all(venues.map((v) => storage.set(keys.venue(v.id), v)))
    set({ venues })
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
