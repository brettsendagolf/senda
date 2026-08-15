import { create } from 'zustand'
import type { Category, Session } from '@/types'
import { storage } from '@/lib/storage'
import { newId } from '@/lib/id'
import { generateSession } from '@/lib/generator'
import { capabilityMaxBlock } from '@/lib/limits'
import { DRILLS } from '@/data/drills'
import { useSettings } from './settings'
import { useVenues } from './venues'
import { useEntries } from './entries'

// The in-progress session persists under its own fixed key so a mid-session
// reload (phone locks in your pocket on the green) picks up where you left off.
const ACTIVE_KEY = 'session:active'

interface BuildResult {
  session: Session
  reason?: string
}

interface SessionState {
  current: Session | null
  hydrated: boolean
  hydrate: () => Promise<void>
  /** Generate a session for a venue + time, make it current, and persist it. */
  build: (opts: {
    venueId: string
    minutes: number
    focus?: Category
  }) => BuildResult | null
  /** Record a score for a block and log it to history. */
  scoreBlock: (index: number, score: number) => void
  /** Finish: remember the drills used (for variety) and drop the active session. */
  finish: () => void
  /** Abandon without finishing. */
  discard: () => void
}

function persistActive(session: Session | null): void {
  if (session) void storage.set(ACTIVE_KEY, session)
  else void storage.remove(ACTIVE_KEY)
}

export const useSession = create<SessionState>((set, get) => ({
  current: null,
  hydrated: false,

  hydrate: async () => {
    const active = await storage.get<Session>(ACTIVE_KEY)
    set({ current: active ?? null, hydrated: true })
  },

  build: ({ venueId, minutes, focus }) => {
    const venue = useVenues.getState().venues.find((v) => v.id === venueId)
    if (!venue) return null

    const { recentDrillIds } = useSettings.getState()
    const result = generateSession({
      minutes,
      capabilities: venue.capabilities,
      equipment: venue.equipment,
      focus,
      recentDrillIds,
      allDrills: DRILLS,
      capabilityMaxBlock,
    })
    if (result.blocks.length === 0) {
      return { session: emptySession(venueId, minutes, focus), reason: result.reason }
    }

    const session: Session = {
      id: newId(),
      date: new Date().toISOString(),
      venueId,
      requestedMinutes: minutes,
      focus,
      blocks: result.blocks,
    }
    set({ current: session })
    persistActive(session)
    useSettings.getState().setLastVenueId(venueId)
    return { session, reason: result.reason }
  },

  scoreBlock: (index, score) => {
    const current = get().current
    if (!current) return
    const block = current.blocks[index]
    if (!block) return

    const blocks = current.blocks.map((b, i) =>
      i === index ? { ...b, completed: true, score } : b,
    )
    const updated: Session = { ...current, blocks }
    set({ current: updated })
    persistActive(updated)

    useEntries.getState().addEntry({
      drillId: block.drillId,
      sessionId: current.id,
      score,
    })
  },

  finish: () => {
    const current = get().current
    if (current) {
      useSettings
        .getState()
        .setRecentDrillIds(current.blocks.map((b) => b.drillId))
    }
    set({ current: null })
    persistActive(null)
  },

  discard: () => {
    set({ current: null })
    persistActive(null)
  },
}))

function emptySession(venueId: string, minutes: number, focus?: Category): Session {
  return {
    id: newId(),
    date: new Date().toISOString(),
    venueId,
    requestedMinutes: minutes,
    focus,
    blocks: [],
  }
}
