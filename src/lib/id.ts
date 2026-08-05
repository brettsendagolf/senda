/** Stable unique id. crypto.randomUUID is available in Safari and Node. */
export const newId = (): string => crypto.randomUUID()
