import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Capability, Category } from '@/types'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Chip } from '@/components/Chip'
import { ModeBadge } from '@/components/ModeBadge'
import { useVenues } from '@/store/venues'
import { useSettings } from '@/store/settings'
import { useSession } from '@/store/session'
import { GENERATABLE_DRILLS, getDrill } from '@/data/drills'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/data/labels'

const TIME_PRESETS = [15, 30, 45, 60]

/** Categories with a generatable drill at this set of capabilities. */
function availableCategories(caps: Capability[]): Category[] {
  const present = new Set<Category>()
  for (const d of GENERATABLE_DRILLS) {
    if (d.requires.some((r) => caps.includes(r))) present.add(d.category)
  }
  return CATEGORY_ORDER.filter((c) => present.has(c))
}

export function Today() {
  const navigate = useNavigate()
  const venues = useVenues((s) => s.venues)
  const { lastVenueId, handicap } = useSettings()
  const build = useSession((s) => s.build)
  const current = useSession((s) => s.current)

  const firstVenueId =
    lastVenueId && venues.some((v) => v.id === lastVenueId)
      ? lastVenueId
      : (venues.find((v) => v.isDefault) ?? venues[0])?.id

  const [venueId, setVenueId] = useState<string | undefined>(firstVenueId)
  const [minutes, setMinutes] = useState(30)
  const [customOpen, setCustomOpen] = useState(false)
  const [focus, setFocus] = useState<Category | undefined>()
  const [reason, setReason] = useState<string | undefined>()

  const venue = venues.find((v) => v.id === venueId)
  const focusOptions = useMemo(
    () => (venue ? availableCategories(venue.capabilities) : []),
    [venue],
  )

  const onBuild = () => {
    if (!venueId) return
    const result = build({ venueId, minutes, focus })
    setReason(result?.reason)
  }

  const planIsForThisVenue = current && current.venueId === venueId

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Today"
        subtitle="Time and place — we'll build the session."
      />

      <div className="space-y-6 px-4 pt-5">
        {/* Venue */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Where are you?
          </h2>
          <div className="flex flex-wrap gap-2">
            {venues.map((v) => (
              <Chip
                key={v.id}
                selected={v.id === venueId}
                onClick={() => {
                  setVenueId(v.id)
                  setFocus(undefined)
                }}
              >
                {v.name}
              </Chip>
            ))}
          </div>
        </section>

        {/* Time */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            How long have you got?
          </h2>
          <div className="flex flex-wrap gap-2">
            {TIME_PRESETS.map((m) => (
              <Chip
                key={m}
                selected={!customOpen && m === minutes}
                onClick={() => {
                  setMinutes(m)
                  setCustomOpen(false)
                }}
              >
                {m} min
              </Chip>
            ))}
            <Chip selected={customOpen} onClick={() => setCustomOpen(true)}>
              Custom
            </Chip>
          </div>
          {customOpen && (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="flex-1 accent-[var(--color-accent)]"
              />
              <span className="tabular w-16 text-right text-lg font-semibold text-ink">
                {minutes} min
              </span>
            </div>
          )}
        </section>

        {/* Focus */}
        {focusOptions.length > 1 && (
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Focus on… <span className="font-normal">(optional)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <Chip selected={focus === undefined} onClick={() => setFocus(undefined)}>
                Any
              </Chip>
              {focusOptions.map((c) => (
                <Chip key={c} selected={focus === c} onClick={() => setFocus(c)}>
                  {CATEGORY_LABELS[c]}
                </Chip>
              ))}
            </div>
          </section>
        )}

        {/* Build */}
        <button
          type="button"
          onClick={onBuild}
          disabled={!venueId}
          className="h-14 w-full rounded-xl bg-accent text-lg font-semibold text-white active:opacity-90 disabled:opacity-40"
        >
          Build my session
        </button>

        {/* Result */}
        {planIsForThisVenue && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-ink">Your session</h2>
              <span className="tabular text-sm text-ink-soft">
                {current!.blocks.reduce((a, b) => a + b.minutes, 0)} min ·{' '}
                {current!.blocks.length} block
                {current!.blocks.length === 1 ? '' : 's'}
              </span>
            </div>

            {reason && (
              <p className="rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink-soft">
                {reason}
              </p>
            )}

            <ol className="space-y-2">
              {current!.blocks.map((b, i) => {
                const drill = getDrill(b.drillId)
                if (!drill) return null
                return (
                  <li
                    key={`${b.drillId}-${i}`}
                    className="flex items-center gap-3 rounded-lg border border-line bg-card px-3 py-3"
                  >
                    <span className="tabular w-6 text-center text-sm font-semibold text-ink-soft">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink">
                        {drill.name}
                      </div>
                      <div className="mt-0.5">
                        <ModeBadge mode={drill.mode} />
                      </div>
                    </div>
                    <span className="tabular shrink-0 text-sm font-semibold text-ink">
                      {b.minutes} min
                    </span>
                  </li>
                )
              })}
            </ol>

            <button
              type="button"
              onClick={() => navigate('/run')}
              className="h-14 w-full rounded-xl border-2 border-accent bg-accent-soft text-lg font-semibold text-accent active:opacity-90"
            >
              Start session
            </button>
            <p className="text-center text-xs text-ink-soft">
              For a {handicap} handicap · targets shown as you play
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
