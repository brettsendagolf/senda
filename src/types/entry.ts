/**
 * One logged drill score. Entries are the raw history the Progress screen reads
 * from — last score, best score, the sparkline of the last ten, and so on.
 */
export interface Entry {
  id: string
  drillId: string
  sessionId?: string
  score: number
  note?: string
  ts: number // epoch milliseconds
}
