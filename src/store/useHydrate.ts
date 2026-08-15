import { useEffect, useState } from 'react'
import { useSettings } from './settings'
import { useVenues } from './venues'
import { useEntries } from './entries'
import { useSession } from './session'
import { useProfile } from './profile'

/** If storage is blocked or wedged, don't hold the app hostage. */
const HYDRATE_TIMEOUT_MS = 4000

/**
 * Load everything from storage once on startup. Returns false until every store
 * has hydrated, so the app can hold a blank frame rather than flashing empty
 * state. A failure or a hang still releases the app — a blank screen forever is
 * worse than starting with defaults (Safari private mode blocks IndexedDB).
 */
export function useHydrate(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const done = () => {
      if (!cancelled) setReady(true)
    }

    const timer = setTimeout(() => {
      if (!cancelled) {
        console.warn('Storage did not respond in time — starting with defaults.')
        done()
      }
    }, HYDRATE_TIMEOUT_MS)

    Promise.all([
      useSettings.getState().hydrate(),
      useVenues.getState().hydrate(),
      useEntries.getState().hydrate(),
      useSession.getState().hydrate(),
      useProfile.getState().hydrate(),
    ])
      .catch((err) => {
        console.error('Hydration failed, starting with defaults:', err)
      })
      .finally(() => {
        clearTimeout(timer)
        done()
      })

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return ready
}
