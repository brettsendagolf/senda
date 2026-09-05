import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Category, Venue } from '@/types'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Chip } from '@/components/Chip'
import { ModeBadge } from '@/components/ModeBadge'
import { useVenues } from '@/store/venues'
import { useSettings } from '@/store/settings'
import { useSession } from '@/store/session'
import { eligibleDrills, getDrill } from '@/data/drills'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/data/labels'
import { HONESTY_MIN_DRILLS } from '@/data/capabilities'
import { pickerOptionsFor } from '@/lib/limits'
import { WARMUPS, WARMUP_ADDONS } from '@/data/warmups'
import { isBeginner } from '@/lib/onboarding'
import { useProfile } from '@/store/profile'

type Entry = 'practice' | 'warmup'

/** Categories with an eligible drill at this venue (capabilities + kit). */
function availableCategories(venue: Venue): Category[] {
  const present = new Set<Category>(
    eligibleDrills(venue.capabilities, venue.equipment).map((d) => d.category),
  )
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

  const onboarding = useProfile((s) => s.onboarding)
  const beginner = onboarding ? isBeginner(onboarding.experience) : false

  const [entry, setEntry] = useState<Entry>('practice')
  const [venueId, setVenueId] = useState<string | undefined>(firstVenueId)
  const [minutes, setMinutes] = useState(30)
  const [customOpen, setCustomOpen] = useState(false)
  const [focus, setFocus] = useState<Category[]>([])
  const [reason, setReason] = useState<string | undefined>()

  const venue = venues.find((v) => v.id === venueId)
  const focusOptions = useMemo(
    () => (venue ? availableCategories(venue) : []),
    [venue],
  )

  // Time options are governed by the venue's additive session-length ceiling.
  const timeOptions = useMemo(
    () => (venue ? pickerOptionsFor(venue.capabilities) : []),
    [venue],
  )
  const ceiling = timeOptions.length ? timeOptions[timeOptions.length - 1] : 0
  const eligibleCount = venue
    ? eligibleDrills(venue.capabilities, venue.equipment).length
    : 0

  // Keep the requested time within what the venue supports.
  const effectiveMinutes = ceiling ? Math.min(minutes, ceiling) : minutes

  const selectVenue = (v: Venue) => {
    setVenueId(v.id)
    setFocus([])
    setReason(undefined)
    const opts = pickerOptionsFor(v.capabilities)
    const max = opts.length ? opts[opts.length - 1] : 0
    if (max && minutes > max) {
      setMinutes(max)
      setCustomOpen(false)
    }
  }

  const onBuild = () => {
    if (!venueId) return
    const result = build({
      venueId,
      minutes: effectiveMinutes,
      focus: focus.length ? focus : undefined,
    })
    setReason(result?.reason)
  }

  const planIsForThisVenue = current && current.venueId === venueId

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Today"
        subtitle={
          entry === 'practice'
            ? "Time and place — we'll build the session."
            : 'Before a round — a fixed routine to the first tee.'
        }
      />

      {/* Practice vs Warm up */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-card p-1">
          {(['practice', 'warmup'] as Entry[]).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEntry(e)}
              className={
                'min-h-11 rounded-lg text-sm font-semibold capitalize ' +
                (entry === e ? 'bg-accent text-on-accent' : 'text-ink-soft')
              }
            >
              {e === 'practice' ? 'Practice' : 'Warm up'}
            </button>
          ))}
        </div>
      </div>

      {entry === 'warmup' && <WarmupPanel />}

      {entry === 'practice' && (
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
                onClick={() => selectVenue(v)}
              >
                {v.name}
              </Chip>
            ))}
          </div>
        </section>

        {/* Time — only options the venue's session-length ceiling allows */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            How long have you got?
          </h2>
          <div className="flex flex-wrap gap-2">
            {timeOptions.map((m) => (
              <Chip
                key={m}
                selected={!customOpen && m === effectiveMinutes}
                onClick={() => {
                  setMinutes(m)
                  setCustomOpen(false)
                }}
              >
                {m} min
              </Chip>
            ))}
            {ceiling > timeOptions[0] && (
              <Chip selected={customOpen} onClick={() => setCustomOpen(true)}>
                Custom
              </Chip>
            )}
          </div>
          {ceiling > 0 && ceiling < 45 && (
            <p className="mt-2 text-xs text-ink-soft">
              This venue tops out around {ceiling} min — the picker only offers
              what it can honestly support.
            </p>
          )}
          {customOpen && (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={ceiling || 60}
                step={5}
                value={effectiveMinutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="flex-1 accent-[var(--color-accent)]"
              />
              <span className="tabular w-16 text-right text-lg font-semibold text-ink">
                {effectiveMinutes} min
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
              <Chip selected={focus.length === 0} onClick={() => setFocus([])}>
                Any
              </Chip>
              {focusOptions.map((c) => (
                <Chip
                  key={c}
                  selected={focus.includes(c)}
                  onClick={() =>
                    setFocus((f) =>
                      f.includes(c) ? f.filter((x) => x !== c) : [...f, c],
                    )
                  }
                >
                  {CATEGORY_LABELS[c]}
                </Chip>
              ))}
            </div>
          </section>
        )}

        {/* New to golf: keep the guides one tap away, not buried in Profile. */}
        {beginner && (
          <button
            type="button"
            onClick={() => navigate('/learn')}
            className="w-full rounded-2xl bg-ink p-4 text-left active:opacity-90"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-paper/60">
              New to this?
            </div>
            <p className="mt-1 font-semibold text-paper">
              What happens at a driving range
            </p>
            <p className="mt-1 text-sm leading-relaxed text-paper/75">
              What it costs, what to bring, and what to do when you get there.
              Free guides in Learn.
            </p>
          </button>
        )}

        {/* Played rather than practised? */}
        <button
          type="button"
          onClick={() => navigate('/log-round')}
          className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5 text-left active:bg-paper"
        >
          <div className="min-w-0 flex-1">
            <div className="font-medium text-ink">Played a round?</div>
            <div className="mt-0.5 text-[13px] text-ink-mute">
              Log it in 30 seconds — it sharpens your Game Profile
            </div>
          </div>
          <span className="shrink-0 text-ink-mute">›</span>
        </button>

        {/* Honesty: few drills fit this venue */}
        {venue && eligibleCount > 0 && eligibleCount < HONESTY_MIN_DRILLS && (
          <p className="rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink-soft">
            Only {eligibleCount} drill{eligibleCount === 1 ? '' : 's'} fit{' '}
            {venue.name} right now — you'll get those rather than a padded
            session. Tick more kit or capabilities to unlock more.
          </p>
        )}

        {/* Build */}
        <button
          type="button"
          onClick={onBuild}
          disabled={!venueId}
          className="h-14 w-full rounded-xl bg-btn text-lg font-semibold text-on-btn active:opacity-90 disabled:opacity-40"
        >
          Build my session
        </button>

        {/* Honest empty state — a venue with nothing that fits */}
        {reason && !planIsForThisVenue && (
          <p className="rounded-lg border border-line bg-card px-3 py-3 text-sm text-ink-soft">
            {reason}
          </p>
        )}

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
      )}
    </div>
  )
}

/** Warm-up entry point — pick a routine and optional greens / short-game blocks. */
function WarmupPanel() {
  const navigate = useNavigate()
  const [warmupId, setWarmupId] = useState(WARMUPS[1].id) // default 30 min
  const [addons, setAddons] = useState<Set<string>>(new Set())

  const warmup = WARMUPS.find((w) => w.id === warmupId)!
  const addonMinutes = WARMUP_ADDONS.filter((a) => addons.has(a.id)).reduce(
    (sum, a) => sum + a.minutes,
    0,
  )
  const total = warmup.totalMinutes + addonMinutes

  const toggleAddon = (id: string) =>
    setAddons((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="space-y-6 px-4 pt-5">
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          How long before you tee off?
        </h2>
        <div className="flex flex-wrap gap-2">
          {WARMUPS.map((w) => (
            <Chip
              key={w.id}
              selected={w.id === warmupId}
              onClick={() => setWarmupId(w.id)}
            >
              {w.label}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Add before the tee <span className="font-normal">(optional)</span>
        </h2>
        <div className="space-y-2">
          {WARMUP_ADDONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAddon(a.id)}
              aria-pressed={addons.has(a.id)}
              className={
                'flex min-h-11 w-full items-center justify-between rounded-lg border px-3 py-2 text-left ' +
                (addons.has(a.id)
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-card')
              }
            >
              <span
                className={
                  'font-medium ' +
                  (addons.has(a.id) ? 'text-accent' : 'text-ink')
                }
              >
                {a.name}
              </span>
              <span className="tabular text-sm text-ink-soft">+{a.minutes} min</span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-lg border border-line bg-card px-3 py-3">
        <span className="text-sm text-ink-soft">Total</span>
        <span className="tabular text-lg font-semibold text-ink">{total} min</span>
      </div>

      <button
        type="button"
        onClick={() =>
          navigate('/warmup', {
            state: { warmupId, addonIds: [...addons] },
          })
        }
        className="h-14 w-full rounded-xl bg-btn text-lg font-semibold text-on-btn active:opacity-90"
      >
        Start warm-up
      </button>
    </div>
  )
}
