import type { Category } from './drill'

/** One drill within a session, with the time budgeted for it and its result. */
export interface SessionBlock {
  drillId: string
  minutes: number
  completed: boolean
  score?: number
}

/** A generated (and possibly in-progress) practice session. */
export interface Session {
  id: string
  date: string
  venueId: string
  requestedMinutes: number
  focus?: Category[] //  optional user-chosen emphasis (may be several)
  blocks: SessionBlock[]
}
