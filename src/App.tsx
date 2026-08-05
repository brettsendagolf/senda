/*
 * Placeholder shell — confirms the toolchain (Vite + React + Tailwind v4 tokens)
 * is wired up. Real screens and routing land in the next step.
 */
function App() {
  return (
    <div
      className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
    >
      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
        Practice Book
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Scaffold ready</h1>
      <p className="max-w-xs text-sm text-ink-soft">
        Tooling is wired up. Types, storage, the session generator and the four
        screens come next.
      </p>
      <p className="tabular mt-2 rounded-md border border-line bg-card px-3 py-1 text-sm text-ink-soft">
        393&nbsp;px&nbsp;target · safe-area&nbsp;aware
      </p>
    </div>
  )
}

export default App
