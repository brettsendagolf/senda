import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Area, Experience, OnboardingProfile } from '@/types'
import { GameProfileCard } from '@/components/GameProfileCard'
import {
  assessmentFor,
  EXPERIENCE_OPTIONS,
  FACILITY_OPTIONS,
  profileFromOnboarding,
} from '@/lib/onboarding'
import { useProfile } from '@/store/profile'
import { useSettings } from '@/store/settings'

/**
 * First run: Where are you now → Quick assessment → Game Profile reveal.
 * No account, no paywall. The job of onboarding is to produce a plan, and to
 * state its confidence honestly from the first screen.
 */
export function Onboarding() {
  const navigate = useNavigate()
  const saveOnboarding = useProfile((s) => s.saveOnboarding)
  const setHandicap = useSettings((s) => s.setHandicap)

  const [step, setStep] = useState(0)
  const [experience, setExperience] = useState<Experience>('learning')
  const [handicap, setHcp] = useState<number | undefined>()
  const [ratings, setRatings] = useState<Partial<Record<Area, number>>>({})
  const [facilities, setFacilities] = useState<string[]>(['range', 'short'])

  const draft: OnboardingProfile = useMemo(
    () => ({
      experience,
      handicap,
      selfRatings: ratings,
      facilities,
      completedAt: new Date().toISOString(),
    }),
    [experience, handicap, ratings, facilities],
  )
  const profile = useMemo(() => profileFromOnboarding(draft), [draft])

  const finish = async () => {
    await saveOnboarding(draft)
    if (handicap !== undefined) setHandicap(handicap)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-full flex-col bg-paper">
      <div
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-6"
        style={{ paddingTop: 'calc(var(--safe-top) + 1rem)' }}
      >
        {/* Progress dots */}
        <div className="mb-5 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={
                'h-1 flex-1 rounded-full ' + (i <= step ? 'bg-accent' : 'bg-sunken')
              }
            />
          ))}
        </div>

        {step === 0 && (
          <StepWhere
            experience={experience}
            onPick={setExperience}
            handicap={handicap}
            onHandicap={setHcp}
          />
        )}
        {step === 1 && (
          <StepAssess
            experience={experience}
            ratings={ratings}
            onRate={(area, v) => setRatings((r) => ({ ...r, [area]: v }))}
            facilities={facilities}
            onToggleFacility={(k) =>
              setFacilities((f) =>
                f.includes(k) ? f.filter((x) => x !== k) : [...f, k],
              )
            }
          />
        )}
        {step === 2 && <StepReveal profile={profile} experience={experience} />}
      </div>

      <div
        className="shrink-0 border-t border-line px-5 pt-3"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={() => (step === 2 ? finish() : setStep(step + 1))}
          className="h-14 w-full rounded-xl bg-accent text-lg font-semibold text-on-accent active:opacity-90"
        >
          {step === 0
            ? 'Continue'
            : step === 1
              ? experience === 'never'
                ? 'Show me where to start'
                : 'Build my Game Profile'
              : "Let's go"}
        </button>
        {step === 0 && (
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
  handicap,
  onHandicap,
}: {
  experience: Experience
  onPick: (e: Experience) => void
  handicap?: number
  onHandicap: (n: number | undefined) => void
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

      {experience === 'handicap' && (
        <div className="mt-4 rounded-2xl border border-line bg-card p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-mute">
            Your handicap index
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              inputMode="decimal"
              value={handicap ?? ''}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d.]/g, '')
                onHandicap(v === '' ? undefined : Math.min(54, Number(v)))
              }}
              placeholder="e.g. 18.4"
              className="tabular h-12 w-28 rounded-lg border border-line bg-paper px-3 text-lg text-ink"
            />
            <span className="text-sm text-ink-mute">Up to 54. You can change this later.</span>
          </div>
        </div>
      )}
    </div>
  )
}

function StepAssess({
  experience,
  ratings,
  onRate,
  facilities,
  onToggleFacility,
}: {
  experience: Experience
  ratings: Partial<Record<Area, number>>
  onRate: (area: Area, v: number) => void
  facilities: string[]
  onToggleFacility: (k: string) => void
}) {
  const never = experience === 'never'
  const questions = assessmentFor(experience)
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        {never ? 'A few quick questions' : 'Quick assessment'}
      </h1>
      <p className="mt-1.5 text-ink-soft">
        {never
          ? "Nothing here needs a score or a round — just how you feel about each part. Not sure? Pick the last option."
          : 'A few taps. Think about your last few rounds — rough is fine.'}
      </p>

      <div className="mt-5 space-y-3">
        {questions.map((q) => (
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
            {/* The penalties rationale only lands for someone who has played. */}
            {!never && q.area === 'ott' && (
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
}: {
  profile: ReturnType<typeof profileFromOnboarding>
  experience: Experience
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
          Let's get you swinging.
        </h1>
        <p className="mt-2 text-ink-soft">
          You haven't played yet, so there's nothing to diagnose — and we're not
          going to invent it. Here's where beginners get the most out of their
          first few sessions.
        </p>

        <div className="mt-5 rounded-2xl border border-accent bg-accent-soft p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-accent">
            Start with
          </div>
          <p className="mt-1 text-lg font-semibold text-ink">
            Contact, then the short game
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            Clean contact is the one thing everything else is built on, and
            chipping and putting are where a beginner saves the most shots
            fastest. Pick your time and place on Today and we'll build it.
          </p>
        </div>

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

      {profile.flags.includes('putting_myth') && (
        <p className="mt-3 rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink-soft">
          You rated putting your worst area — but it's rarely where the shots
          actually go. We'll keep an eye on it as you log rounds.
        </p>
      )}
    </div>
  )
}
