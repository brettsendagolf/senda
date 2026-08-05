import { useEffect, useState } from 'react'
import { useSettings } from './settings'
import { useVenues } from './venues'
import { useEntries } from './entries'
import { useSession } from './session'

/**
 * Load everything from storage once on startup. Returns false until every store
 * has hydrated, so the app can hold a blank frame rather than flashing empty
 * state (venues, active session) that then pops in.
 */
export function useHydrate(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      useSettings.getState().hydrate(),
      useVenues.getState().hydrate(),
      useEntries.getState().hydrate(),
      useSession.getState().hydrate(),
    ]).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return ready
}
