import { create } from 'zustand'
import { storage, keys } from '@/lib/storage'

export type Units = 'yards' | 'meters'

/** The slice we actually write to storage. */
interface PersistedSettings {
  handicap: number
  units: Units
  lastVenueId?: string
  recentDrillIds: string[]
}

interface SettingsState extends PersistedSettings {
  hydrated: boolean
  hydrate: () => Promise<void>
  setHandicap: (handicap: number) => void
  setUnits: (units: Units) => void
  setLastVenueId: (id: string) => void
  /** Remember the drills used last, so the generator can vary next time. */
  setRecentDrillIds: (ids: string[]) => void
}

const DEFAULTS: PersistedSettings = {
  handicap: 9, // Brett is a 9 working toward 5
  units: 'yards',
  lastVenueId: undefined,
  recentDrillIds: [],
}

function persist(s: PersistedSettings): void {
  const bundle: PersistedSettings = {
    handicap: s.handicap,
    units: s.units,
    lastVenueId: s.lastVenueId,
    recentDrillIds: s.recentDrillIds,
  }
  void storage.set(keys.settings, bundle)
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.get<PersistedSettings>(keys.settings)
    set({ ...DEFAULTS, ...saved, hydrated: true })
  },

  setHandicap: (handicap) => {
    set({ handicap })
    persist(get())
  },
  setUnits: (units) => {
    set({ units })
    persist(get())
  },
  setLastVenueId: (lastVenueId) => {
    set({ lastVenueId })
    persist(get())
  },
  setRecentDrillIds: (recentDrillIds) => {
    set({ recentDrillIds })
    persist(get())
  },
}))
