import {
  get as idbGet,
  set as idbSet,
  del as idbDel,
  entries as idbEntries,
  clear as idbClear,
  createStore,
} from 'idb-keyval'

/**
 * The one door to persistence. Every read and write in the app goes through a
 * StorageAdapter, so swapping IndexedDB for a real backend later is a change to
 * this file only — no component or store imports idb-keyval directly.
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  /** All values whose key starts with `prefix` (default: everything). */
  list<T>(prefix?: string): Promise<T[]>
}

// A dedicated IndexedDB store keeps our keys out of any other app on the origin.
const store = createStore('practice-book', 'kv')

export const storage: StorageAdapter = {
  async get<T>(key: string): Promise<T | undefined> {
    return (await idbGet(key, store)) as T | undefined
  },
  async set<T>(key: string, value: T): Promise<void> {
    await idbSet(key, value, store)
  },
  async remove(key: string): Promise<void> {
    await idbDel(key, store)
  },
  async list<T>(prefix = ''): Promise<T[]> {
    const all = await idbEntries(store)
    return all
      .filter(([k]) => typeof k === 'string' && (k as string).startsWith(prefix))
      .map(([, v]) => v as T)
  },
}

/**
 * Canonical key namespaces. Callers build keys through these helpers so the
 * `list()` prefixes always line up with the keys `set()` wrote.
 */
export const keys = {
  venue: (id: string) => `venue:${id}`,
  venuePrefix: 'venue:',
  session: (id: string) => `session:${id}`,
  sessionPrefix: 'session:',
  entry: (id: string) => `entry:${id}`,
  entryPrefix: 'entry:',
  settings: 'settings',
} as const

/** Shape of the JSON produced by the Settings "export data" action. */
export interface ExportBundle {
  app: 'practice-book'
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

/** Serialise the entire store into a portable JSON bundle. */
export async function exportAll(): Promise<ExportBundle> {
  const all = await idbEntries(store)
  const data: Record<string, unknown> = {}
  for (const [k, v] of all) if (typeof k === 'string') data[k] = v
  return {
    app: 'practice-book',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
}

/**
 * Load a previously exported bundle. Replaces everything by default; pass
 * `{ merge: true }` to keep existing keys and overwrite only the ones present.
 */
export async function importAll(
  bundle: ExportBundle,
  opts?: { merge?: boolean },
): Promise<void> {
  if (!bundle || bundle.app !== 'practice-book' || !bundle.data) {
    throw new Error('Not a Practice Book export file.')
  }
  if (!opts?.merge) await idbClear(store)
  for (const [k, v] of Object.entries(bundle.data)) await idbSet(k, v, store)
}
