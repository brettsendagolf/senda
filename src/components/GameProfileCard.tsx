import type { Area, GameProfile } from '@/types'

const AREA_LABEL: Record<Area, string> = {
  ott: 'Off the tee',
  app: 'Approach',
  short: 'Short game',
  putt: 'Putting',
}

/**
 * "Shots lost by area" is ONE measure across four categories, so it uses a
 * single hue with the focus item darkened — four colours would imply four
 * unrelated things (Master Brief §5.4, rule 1).
 */
const RAMP = [
  'var(--color-g600)',
  'var(--color-g400)',
  'var(--color-g300)',
  'var(--color-g200)',
]

const CONFIDENCE_COPY: Record<GameProfile['confidence'], string> = {
  estimate:
    'built from your answers plus data from golfers at your level. This sharpens fast once you log 5 rounds.',
  low: 'a couple of rounds in. Keep logging and this tightens up.',
  medium: 'based on the rounds you have logged so far.',
  good: 'based on a solid run of logged rounds.',
}

export function GameProfileCard({
  profile,
  showStartHere = true,
}: {
  profile: GameProfile
  showStartHere?: boolean
}) {
  const areas = [...profile.areas].sort((a, b) => a.rank - b.rank)
  // Bar length: proportional to shots lost when we have them, else to rank.
  const maxShots = Math.max(
    ...areas.map((a) => a.shotsLostVsScratch ?? 0),
    0.0001,
  )
  const widthFor = (i: number, shots: number | null) =>
    shots !== null
      ? Math.max(8, (shots / maxShots) * 100)
      : [100, 74, 55, 38][i] ?? 30

  const isEstimate = profile.confidence === 'estimate'

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      {areas.map((a, i) => (
        <div key={a.area} className={i === areas.length - 1 ? '' : 'mb-3.5'}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold text-ink">
              {AREA_LABEL[a.area]}
              {showStartHere && a.rank === 1 && (
                <span className="ml-2 inline-block rounded bg-accent px-1.5 py-0.5 align-[2px] text-[10px] font-bold uppercase tracking-wide text-on-accent">
                  Start here
                </span>
              )}
            </span>
            {a.shotsLostVsScratch !== null && (
              <span className="tabular text-sm font-semibold text-ink-soft">
                {a.shotsLostVsScratch.toFixed(1)}
              </span>
            )}
          </div>
          <div className="h-2.5 overflow-hidden rounded bg-sunken">
            <div
              className="h-full rounded"
              style={{
                width: `${widthFor(i, a.shotsLostVsScratch)}%`,
                background: RAMP[i] ?? RAMP[3],
              }}
            />
          </div>
          <p className="mt-1 text-xs text-ink-mute">{a.headline}</p>
        </div>
      ))}

      <div className="-mx-4 mt-4 h-px bg-line" />
      <p className="mt-3 text-xs leading-relaxed text-ink-mute">
        <span
          className="font-semibold"
          style={{ color: isEstimate ? 'var(--color-warn)' : 'var(--color-good)' }}
        >
          {isEstimate ? 'Estimate' : `${cap(profile.confidence)} confidence`}
        </span>{' '}
        — {CONFIDENCE_COPY[profile.confidence]}
      </p>
    </div>
  )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
