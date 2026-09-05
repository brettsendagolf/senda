import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Area, Experience, OnboardingProfile } from '@/types'
import { GameProfileCard } from '@/components/GameProfileCard'
import {
  ASSESSMENT,
  EXPERIENCE_OPTIONS,
  FACILITY_OPTIONS,
  hasNoFacilities,
  profileFromOnboarding,
  toggleFacility,
} from '@/lib/onboarding'
import { STARTER_DRILLS } from '@/data/drills'
import { venuesFromFacilities } from '@/data/venues'
import { useProfile } from '@/store/profile'
import { useVenues } from '@/store/venues'
import { useSettings } from '@/store/settings'

type StepKey = 'where' | 'handicap' | 'assess' | 'reveal'

/**
 * First run. The flow adapts to the answer on screen one:
 *   never played → Where are you → starter drills. No assessment and no Game
 *                  Profile: there is no game to diagnose yet, and inventing
 *                  one would be the dishonesty this product exists to avoid.
 *   has handicap → Where are you → handicap → assessment → Game Profile.
 *   otherwise    → Where are you → assessment → Game Profile.
 * No account, no paywall. The job of onboarding is to produce a plan.
 */
export function Onboarding() {
  const navigate = useNavigate()
  const saveOnboarding = useProfile((s) => s.saveOnboarding)
  const existing = useProfile((s) => s.onboarding)
  const setHandicap = useSettings((s) => s.setHandicap)
  const replaceVenues = useVenues((s) => s.replaceAll)

  // Re-taking from Profile: start from the previous answers and go back there.
  const isRetake = existing !== null

  const [step, setStep] = useState(0)
  const [experience, setExperience] = useState<Experience | undefined>(
    existing?.experience,
  )
  const [handicap, setHcp] = useState<number | undefined>(existing?.handicap)
  const [ratings, setRatings] = useState<Partial<Record<Area, number>>>(
    existing?.selfRatings ?? {},
  )
  const [facilities, setFacilities] = useState<string[]>(
    existing?.facilities ?? [],
  )

  const draft: OnboardingProfile = useMemo(
    () => ({
      // Guarded by the disabled CTA — you cannot leave screen one unanswered.
      experience: experience ?? 'learning',
      handicap,
      selfRatings: ratings,
      facilities,
      completedAt: new Date().toISOString(),
    }),
    [experience, handicap, ratings, facilities],
  )
  const profile = useMemo(() => profileFromOnboarding(draft), [draft])

  const steps = useMemo<StepKey[]>(() => {
    if (experience === 'never') return ['where', 'reveal']
    if (experience === 'handicap')
      return ['where', 'handicap', 'assess', 'reveal']
    return ['where', 'assess', 'reveal']
  }, [experience])

  // Experience can only be changed on the first screen, so the index stays
  // valid; the clamp is belt and braces.
  const current = steps[Math.min(step, steps.length - 1)]

  const finish = async () => {
    await saveOnboarding(draft)
    if (handicap !== undefined) setHandicap(handicap)
    // First run only: name the venues from the facilities they picked. On a
    // re-take we leave venues alone — they may have been edited since.
    if (!isRetake) await replaceVenues(venuesFromFacilities(facilities))
    navigate(isRetake ? '/profile' : '/', { replace: true })
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-6"
        style={{ paddingTop: 'calc(var(--safe-top) + 1rem)' }}
      >
        {/* Progress dots */}
        <div className="mb-5 flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={
                'h-1 flex-1 rounded-full ' + (i <= step ? 'bg-accent' : 'bg-sunken')
              }
            />
          ))}
        </div>

        {isRetake && step === 0 && (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="-ml-1 mb-2 flex min-h-11 items-center text-sm font-medium text-ink-soft"
          >
            ‹ Profile
          </button>
        )}

        {current === 'where' && (
          <StepWhere experience={experience} onPick={setExperience} />
        )}
        {current === 'handicap' && (
          <StepHandicap handicap={handicap} onHandicap={setHcp} />
        )}
        {current === 'assess' && (
          <StepAssess
            ratings={ratings}
            onRate={(area, v) => setRatings((r) => ({ ...r, [area]: v }))}
            facilities={facilities}
            onToggleFacility={(k) => setFacilities((f) => toggleFacility(f, k))}
          />
        )}
        {current === 'reveal' && (
          <StepReveal
            profile={profile}
            experience={experience}
            facilities={facilities}
          />
        )}
      </div>

      <div
        className="shrink-0 border-t border-line px-5 pt-3"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={() => (current === 'reveal' ? finish() : setStep(step + 1))}
          disabled={current === 'where' && !experience}
          className="h-14 w-full rounded-xl bg-accent text-lg font-semibold text-on-accent active:opacity-90 disabled:opacity-40"
        >
          {current === 'reveal'
            ? isRetake
              ? 'Save'
              : "Let's go"
            : current === 'assess'
              ? 'Build my Game Profile'
              : current === 'where' && experience === 'never'
                ? 'Show me where to start'
                : 'Continue'}
        </button>
        {current === 'where' && (
          <p className="mt-2 text-center text-xs text-ink-mute">
            No account needed yet.
          </p>
        )}
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="mt-1 h-11 w-full text-sm font-medium text-ink-soft"
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}

function StepWhere({
  experience,
  onPick,
}: {
  experience?: Experience
  onPick: (e: Experience) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Where are you now?
      </h1>
      <p className="mt-1.5 text-ink-soft">
        No wrong answer. This just tells us where to start you.
      </p>

      <div className="mt-5 space-y-2.5">
        {EXPERIENCE_OPTIONS.map((o) => {
          const on = o.value === experience
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onPick(o.value)}
              aria-pressed={on}
              className={
                'w-full rounded-2xl border-[1.5px] px-4 py-3.5 text-left ' +
                (on ? 'border-accent bg-accent-soft' : 'border-line bg-card')
              }
            >
              <span className="block text-base text-ink">{o.label}</span>
              <span
                className={
                  'mt-0.5 block text-[13px] ' +
                  (on ? 'text-accent' : 'text-ink-mute')
                }
              >
                {o.sub}
              </span>
            </button>
          )
        })}
      </div>

    </div>
  )
}

/** Only shown to a golfer who says they have an index. */
function StepHandicap({
  handicap,
  onHandicap,
}: {
  handicap?: number
  onHandicap: (n: number | undefined) => void
}) {
  // Hold the raw text. Deriving the field's value from the parsed number ate
  // the decimal point the moment it was typed ("8." -> 8 -> "8"), so "8.2"
  // became "82" and then clamped to 54.
  const [text, setText] = useState(
    handicap === undefined ? '' : String(handicap),
  )

  const onType = (raw: string) => {
    // digits plus at most one decimal point
    const cleaned = raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
    setText(cleaned)
    if (cleaned === '' || cleaned === '.') return onHandicap(undefined)
    const n = Number(cleaned)
    onHandicap(Number.isNaN(n) ? undefined : Math.min(54, n))
  }

  // Only tidy up once they've finished typing, so clamping never fights them
  // mid-entry.
  const normalise = () => {
    if (text === '' || text === '.') return setText('')
    const n = Number(text)
    if (!Number.isNaN(n)) setText(String(Math.min(54, n)))
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        What's your handicap?
      </h1>
      <p className="mt-1.5 text-ink-soft">
        We use it to compare you with golfers at your level — never against tour
        players. That comparison is the whole point.
      </p>

      <div className="mt-5 rounded-2xl border border-line bg-card p-4">
        <label
          htmlFor="hcp"
          className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute"
        >
          Handicap index
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="hcp"
            inputMode="decimal"
            value={text}
            onChange={(e) => onType(e.target.value)}
            onBlur={normalise}
            placeholder="e.g. 18.4"
            className="tabular h-14 w-32 rounded-xl border border-line bg-paper px-3 text-2xl font-semibold text-ink"
          />
          <span className="text-sm text-ink-mute">
            Up to 54. You can change this any time.
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-mute">
        Don't know it offhand? Leave it blank — we'll estimate one from your
        scores once you've logged a few rounds.
      </p>
    </div>
  )
}

function StepAssess({
  ratings,
  onRate,
  facilities,
  onToggleFacility,
}: {
  ratings: Partial<Record<Area, number>>
  onRate: (area: Area, v: number) => void
  facilities: string[]
  onToggleFacility: (k: string) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Quick assessment
      </h1>
      <p className="mt-1.5 text-ink-soft">
        A few taps. Think about your last few rounds — rough is fine.
      </p>

      <div className="mt-5 space-y-3">
        {ASSESSMENT.map((q) => (
          <div key={q.area} className="rounded-2xl border border-line bg-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
              {q.eyebrow}
            </div>
            <p className="mt-1.5 text-[15px] text-ink">{q.question}</p>
            {q.help && (
              <p className="mt-1 text-xs leading-relaxed text-ink-mute">{q.help}</p>
            )}
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {q.options.map((opt, i) => {
                const on = ratings[q.area] === i
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onRate(q.area, i)}
                    aria-pressed={on}
                    className={
                      'min-h-11 rounded-xl border-[1.5px] px-1 text-[13px] font-medium ' +
                      (on
                        ? 'border-accent bg-accent-soft text-accent'
                        : 'border-line bg-card text-ink-soft')
                    }
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {q.area === 'ott' && (
              <p className="mt-2 text-xs leading-relaxed text-ink-mute">
                We ask about penalties, not fairways hit. Fairway accuracy barely
                changes between a 25 and a scratch golfer — penalty shots change
                by 8×.
              </p>
            )}
          </div>
        ))}

        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            Where can you practise?
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {FACILITY_OPTIONS.map((f) => {
              const on = facilities.includes(f.key)
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onToggleFacility(f.key)}
                  aria-pressed={on}
                  className={
                    'min-h-11 rounded-full px-3.5 text-[13px] font-semibold ' +
                    (on ? 'bg-accent-soft text-accent' : 'bg-sunken text-ink-soft')
                  }
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepReveal({
  profile,
  experience,
  facilities,
}: {
  profile: ReturnType<typeof profileFromOnboarding>
  experience?: Experience
  facilities: string[]
}) {
  const worst = [...profile.areas].sort((a, b) => a.rank - b.rank)[0]
  const never = experience === 'never'

  // A brand-new golfer has no shots to diagnose. Give them a starting point,
  // not a verdict on a game they haven't played yet.
  if (never) {
    return (
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
          Your starting point
        </div>
        <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight text-ink">
          Start with these three.
        </h1>
        <p className="mt-2 text-ink-soft">
          You haven't played yet, so there's nothing to diagnose and we're not
          going to invent it. These are the fundamentals, in the order they're
          worth learning. Each needs nothing but a club.
        </p>

        <ol className="mt-5 space-y-2.5">
          {STARTER_DRILLS.map((d, i) => (
            <li
              key={d.id}
              className="rounded-2xl border border-line bg-card p-4"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">
                  {i + 1}
                </span>
                <span className="font-semibold text-ink">{d.name}</span>
                <span className="tabular ml-auto shrink-0 text-sm text-ink-mute">
                  {d.minutes} min
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {d.purpose}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-3 text-xs leading-relaxed text-ink-mute">
          You'll find these and the rest of the library under Practice.
        </p>

        <div className="mt-3 rounded-2xl border border-line bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            Before you go
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            The Learn tab has the things nobody tells you — what happens at a
            driving range, what it costs, what to do on your first round, and
            how to get a handicap. It's free, always.
          </p>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-mute">
          Once you've played a few rounds we'll build you a real Game Profile
          showing exactly where your shots are going.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
        Your Game Profile
      </div>
      <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight text-ink">
        Here's where your shots are going.
      </h1>
      <p className="mt-2 text-ink-soft">
        Ranked worst first, against golfers at your level.
      </p>

      <div className="mt-5">
        <GameProfileCard profile={profile} />
      </div>

      {hasNoFacilities(facilities) ? (
        <div className="mt-3 rounded-2xl border border-line bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            Start with these
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            You haven't got anywhere set up to practise yet, so here are the
            fundamentals — each needs nothing but a club and a bit of floor.
          </p>
          <ol className="mt-3 space-y-2">
            {STARTER_DRILLS.map((d, i) => (
              <li key={d.id} className="flex items-baseline gap-2.5">
                <span className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">
                  {i + 1}
                </span>
                <span className="font-medium text-ink">{d.name}</span>
                <span className="tabular ml-auto shrink-0 text-sm text-ink-mute">
                  {d.minutes} min
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-ink-mute">
            Add a range or a green in Settings whenever you get to one and we'll
            build fuller sessions.
          </p>
        </div>
      ) : (
      <div className="mt-3 rounded-2xl border border-accent bg-accent-soft p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-accent">
          Where we'll start
        </div>
        <p className="mt-1 text-[15px] font-semibold text-ink">{worst.headline}</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          Your first session is built around it — pick your time and place on
          Today.
        </p>
      </div>
      )}

      {profile.flags.includes('putting_myth') && (
        <p className="mt-3 rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink-soft">
          You rated putting your worst area — but it's rarely where the shots
          actually go. We'll keep an eye on it as you log rounds.
        </p>
      )}
    </div>
  )
}
