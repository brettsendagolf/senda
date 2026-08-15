import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ScreenHeader } from '@/components/ScreenHeader'
import { EXPERIENCE_OPTIONS } from '@/lib/onboarding'
import { bandForHandicap } from '@/lib/handicap'
import { useGameProfile, useProfile } from '@/store/profile'
import { useSettings } from '@/store/settings'
import { useEntries } from '@/store/entries'

/**
 * Profile — the hub for everything that isn't "what do I do next" or "practise
 * now": progress, learning, preferences and your data. Keeping these behind one
 * tab is what lets the bar stay at three.
 */
export function Profile() {
  const navigate = useNavigate()
  const onboarding = useProfile((s) => s.onboarding)
  const gameProfile = useGameProfile()
  const roundCount = useProfile((s) => s.rounds.length)
  const handicap = useSettings((s) => s.handicap)
  const entryCount = useEntries((s) => s.entries.length)

  const experienceLabel = onboarding
    ? EXPERIENCE_OPTIONS.find((o) => o.value === onboarding.experience)?.label
    : undefined
  const worst = gameProfile
    ? [...gameProfile.areas].sort((a, b) => a.rank - b.rank)[0]
    : undefined

  return (
    <div className="pb-10">
      <ScreenHeader title="Profile" />

      <div className="space-y-6 px-4 pt-4">
        {/* Who you are */}
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.8" />
              <path d="M4.5 20a7.5 7.5 0 0115 0" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink">
              {experienceLabel ?? 'Golfer'}
            </p>
            <p className="tabular mt-0.5 text-sm text-ink-soft">
              Handicap {handicap} · {bandForHandicap(handicap)}
            </p>
          </div>
        </div>

        {/* Where your game is */}
        {worst && (
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="w-full rounded-2xl border border-line bg-card p-4 text-left active:bg-paper"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
              Your focus
            </div>
            <p className="mt-1 font-semibold text-ink">{worst.headline}</p>
            <p className="tabular mt-1 text-sm text-ink-soft">
              {roundCount > 0
                ? `${roundCount} round${roundCount === 1 ? '' : 's'} logged`
                : 'Log a round to make this yours'}
              {entryCount > 0 && ` · ${entryCount} drill score${entryCount === 1 ? '' : 's'}`}
            </p>
          </button>
        )}

        <Group>
          <Row
            label="Progress"
            hint="Game Profile, drill scores and history"
            onClick={() => navigate('/progress')}
          />
          <Row
            label="Learn"
            hint="Free guides, tailored to where you are"
            onClick={() => navigate('/learn')}
          />
        </Group>

        <Group>
          <Row
            label="About you"
            hint={
              onboarding
                ? 'Change your experience and self-assessment'
                : 'Tell us where you are'
            }
            onClick={() => navigate('/onboarding')}
          />
          <Row
            label="Settings"
            hint="Handicap, units, venues and your data"
            onClick={() => navigate('/settings')}
          />
        </Group>

        <p className="px-1 text-xs leading-relaxed text-ink-mute">
          Everything is stored on this device. Export a copy any time from
          Settings.
        </p>
      </div>
    </div>
  )
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      {children}
    </div>
  )
}

function Row({
  label,
  hint,
  onClick,
}: {
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-t border-line px-4 py-3.5 text-left first:border-t-0 active:bg-paper"
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium text-ink">{label}</div>
        {hint && <div className="mt-0.5 text-[13px] text-ink-mute">{hint}</div>}
      </div>
      <span className="shrink-0 text-ink-mute">›</span>
    </button>
  )
}
