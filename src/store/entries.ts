import { create } from 'zustand'
import type { Entry } from '@/types'
import { storage, keys } from '@/lib/storage'
import { newId } from '@/lib/id'

interface EntriesState {
  entries: Entry[]
  hydrated: boolean
  hydrate: () => Promise<void>
  addEntry: (input: Omit<Entry, 'id' | 'ts'>) => Entry
  /** Every entry for a drill, newest first. */
  forDrill: (drillId: string) => Entry[]
}

export const useEntries = create<EntriesState>((set, get) => ({
  entries: [],
  hydrated: false,

  hydrate: async () => {
    const entries = await storage.list<Entry>(keys.entryPrefix)
    entries.sort((a, b) => a.ts - b.ts)
    set({ entries, hydrated: true })
  },

  addEntry: (input) => {
    const entry: Entry = { ...input, id: newId(), ts: Date.now() }
    void storage.set(keys.entry(entry.id), entry)
    set({ entries: [...get().entries, entry] })
    return entry
  },

  forDrill: (drillId) =>
    get()
      .entries.filter((e) => e.drillId === drillId)
      .sort((a, b) => b.ts - a.ts),
}))
