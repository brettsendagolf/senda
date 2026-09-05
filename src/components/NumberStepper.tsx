/**
 * Big − / + stepper. Every round-entry field uses one: the Brief's budget is
 * 30 seconds and zero keyboards, and a keypad on a phone in a clubhouse is
 * slower and more error-prone than two large targets.
 */
export function NumberStepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  suffix?: string
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n))
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
        {label}
      </div>
      {hint && (
        <p className="mt-1 text-[13px] leading-relaxed text-ink-mute">{hint}</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="h-14 w-14 shrink-0 rounded-xl border border-line bg-paper text-2xl text-ink-soft active:bg-sunken disabled:opacity-30"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <span className="tabular text-4xl font-bold text-ink">{value}</span>
          {suffix && (
            <span className="ml-1 text-sm text-ink-mute">{suffix}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="h-14 w-14 shrink-0 rounded-xl border border-line bg-paper text-2xl text-ink-soft active:bg-sunken disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}
