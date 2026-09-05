import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '@/components/ScreenHeader'
import { NumberStepper } from '@/components/NumberStepper'
import { Chip } from '@/components/Chip'
import { defaultsFor, roundWarnings } from '@/lib/roundValidation'
import { newId } from '@/lib/id'
import { useProfile } from '@/store/profile'

/**
 * Log a round — Spec A7. Seven numbers from memory, about 30 seconds, no
 * keyboard anywhere. Hole count comes first because 9 holes is the beginner's
 * native format and a first-class case, not a setting buried later.
 */
export function LogRound() {
  const navigate = useNavigate()
  const addRound = useProfile((s) => s.addRound)

  const [holes, setHoles] = useState(18)
  const [d, setD] = useState(() => defaultsFor(18))
  const [saving, setSaving] = useState(false)
  // Attempts default to the greens you missed — the usual case — but stay
  // editable, because you can also chip from a bunker beside a green you hit.
  const [attempts, setAttempts] = useState(() => missedGreens(18, defaultsFor(18).gir))

  // Changing the hole count rescales every default rather than leaving
  // 18-hole numbers sitting under a 9-hole heading.
  const setHoleCount = (n: number) => {
    const next = defaultsFor(n)
    setHoles(n)
    setD(next)
    setAttempts(missedGreens(n, next.gir))
  }
  const set = <K extends keyof ReturnType<typeof defaultsFor>>(
    k: K,
    v: number,
  ) => setD((prev) => ({ ...prev, [k]: v }))

  const attemptsForHoles = Math.max(d.upDownMade, attempts)

  const warnings = useMemo(
    () =>
      roundWarnings({
        holesPlayed: holes,
        par: d.par,
        grossScore: d.grossScore,
        gir: d.gir,
        penalties: d.penalties,
        putts: d.putts,
        upDownAttempts: attemptsForHoles,
        threePutts: d.threePutts,
      }),
    [holes, d, attemptsForHoles],
  )

  const save = async () => {
    setSaving(true)
    await addRound({
      id: newId(),
      playedAt: new Date().toISOString().slice(0, 10),
      holesPlayed: holes,
      par: d.par,
      grossScore: d.grossScore,
      gir: d.gir,
      penalties: d.penalties,
      putts: d.putts,
      upDownMade: d.upDownMade,
      upDownAttempts: attemptsForHoles,
      fairwaysHit: d.fairwaysHit,
      fairwaysPossible: d.fairwaysPossible,
      threePutts: d.threePutts,
      source: 'manual',
      createdAt: new Date().toISOString(),
    })
    navigate('/progress', { replace: true })
  }

  const toPar = d.grossScore - d.par

  return (
    <div className="pb-10">
      <ScreenHeader
        back
        title="Log a round"
        subtitle="Seven numbers, roughly 30 seconds. A rough guess beats not logging it."
      />

      <div className="space-y-3 px-4 pt-4">
        {/* Hole count first */}
        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            How many holes?
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {[9, 18].map((n) => (
              <Chip key={n} selected={holes === n} onClick={() => setHoleCount(n)}>
                {n} holes
              </Chip>
            ))}
            {![9, 18].includes(holes) && (
              <Chip selected onClick={() => {}}>
                {holes} holes
              </Chip>
            )}
          </div>
          {holes !== 9 && holes !== 18 && (
            <p className="mt-2 text-xs text-ink-mute">
              11, 13 and 15 holes all count towards a handicap too.
            </p>
          )}
        </div>

        <NumberStepper
          label="Par for what you played"
          value={d.par}
          min={27}
          max={80}
          onChange={(v) => set('par', v)}
        />

        <NumberStepper
          label="Score"
          hint={
            toPar === 0
              ? 'Level par'
              : toPar > 0
                ? `${toPar} over par`
                : `${Math.abs(toPar)} under par`
          }
          value={d.grossScore}
          min={d.par - 10}
          max={d.par + 80}
          onChange={(v) => set('grossScore', v)}
        />

        <NumberStepper
          label="Greens in regulation"
          hint="On the green in one on a par 3, two on a par 4, three on a par 5."
          value={d.gir}
          min={0}
          max={holes}
          onChange={(v) => set('gir', v)}
        />

        <NumberStepper
          label="Penalties and lost balls"
          hint="Include water, out of bounds and any ball you couldn't find. This is the single most useful number here — and the one most often under-counted."
          value={d.penalties}
          min={0}
          max={20}
          onChange={(v) => set('penalties', v)}
        />

        <NumberStepper
          label="Putts"
          value={d.putts}
          min={0}
          max={holes * 4}
          onChange={(v) => set('putts', v)}
        />

        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            Up and downs
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-mute">
            Missed the green, then got it down in two.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Mini
              label="Made"
              value={d.upDownMade}
              min={0}
              max={attemptsForHoles}
              onChange={(v) => set('upDownMade', v)}
            />
            <Mini
              label="Tried"
              value={attemptsForHoles}
              min={d.upDownMade}
              max={holes}
              onChange={setAttempts}
            />
          </div>
        </div>

        <NumberStepper
          label="Fairways hit"
          hint="We collect it, but it never drives the diagnosis — fairway accuracy barely changes across handicaps."
          value={d.fairwaysHit}
          min={0}
          max={d.fairwaysPossible}
          onChange={(v) => set('fairwaysHit', v)}
        />

        <NumberStepper
          label="Three-putts"
          value={d.threePutts}
          min={0}
          max={holes}
          onChange={(v) => set('threePutts', v)}
        />

        {warnings.length > 0 && (
          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-warn">
              Worth a second look
            </div>
            <ul className="mt-2 space-y-1.5">
              {warnings.map((w) => (
                <li key={w} className="text-sm leading-relaxed text-ink-soft">
                  {w}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-mute">
              You can save anyway — these are just nudges.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-14 w-full rounded-xl bg-accent text-lg font-semibold text-on-accent active:opacity-90 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save round'}
        </button>
        <p className="pb-2 text-center text-xs leading-relaxed text-ink-mute">
          Each round you log sharpens your Game Profile.
        </p>
      </div>
    </div>
  )
}

const missedGreens = (holes: number, gir: number) => Math.max(0, holes - gir)

function Mini({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n))
  return (
    <div>
      <div className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`Decrease ${label}`}
          className="h-12 w-12 shrink-0 rounded-xl border border-line bg-paper text-xl text-ink-soft active:bg-sunken"
        >
          −
        </button>
        <span className="tabular flex-1 text-center text-2xl font-bold text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`Increase ${label}`}
          className="h-12 w-12 shrink-0 rounded-xl border border-line bg-paper text-xl text-ink-soft active:bg-sunken"
        >
          +
        </button>
      </div>
    </div>
  )
}
