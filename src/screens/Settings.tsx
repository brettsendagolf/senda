import { useRef, useState } from 'react'
import type { Capability, Equipment, Venue } from '@/types'
import { ScreenHeader } from '@/components/ScreenHeader'
import {
  CAPABILITY_META,
  CAPABILITY_GROUPS,
  EQUIPMENT_LABELS,
  EQUIPMENT_ORDER,
} from '@/data/capabilities'
import { bandForHandicap } from '@/lib/handicap'
import { exportAll, importAll, type ExportBundle } from '@/lib/storage'
import { useSettings, type Units } from '@/store/settings'
import { useVenues } from '@/store/venues'
import { useEntries } from '@/store/entries'
import { useSession } from '@/store/session'

export function Settings() {
  const { handicap, units, setHandicap, setUnits } = useSettings()
  const venues = useVenues((s) => s.venues)

  return (
    <div className="pb-10">
      <ScreenHeader back backLabel="Profile" title="Settings" />

      <div className="space-y-7 px-4 pt-4">
        {/* Handicap */}
        <Section title="Handicap" hint="Sets which benchmark band is highlighted.">
          <div className="flex items-center gap-3">
            <Stepper
              value={handicap}
              min={0}
              max={54}
              onChange={setHandicap}
            />
            <span className="text-sm text-ink-soft">
              Your band:{' '}
              <span className="font-semibold text-ink">
                {bandForHandicap(handicap)}
              </span>
            </span>
          </div>
        </Section>

        {/* Units */}
        <Section title="Units">
          <div className="flex gap-2">
            {(['yards', 'meters'] as Units[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnits(u)}
                className={
                  'min-h-11 flex-1 rounded-lg border text-sm font-medium capitalize ' +
                  (units === u
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-card text-ink-soft')
                }
              >
                {u}
              </button>
            ))}
          </div>
        </Section>

        {/* Venues */}
        <Section
          title="Venues"
          hint="The places you practise, and what each one lets you do."
        >
          <div className="space-y-3">
            {venues.map((v) => (
              <VenueEditor key={v.id} venue={v} />
            ))}
            <AddVenue />
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <p className="text-sm text-ink-soft">
            Follows your device's light or dark setting.
          </p>
        </Section>

        {/* Data */}
        <DataSection />
      </div>
    </div>
  )
}

// --- Building blocks ------------------------------------------------------

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {hint && <p className="mb-2 mt-0.5 text-xs text-ink-soft">{hint}</p>}
      <div className={hint ? '' : 'mt-2'}>{children}</div>
    </section>
  )
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n))
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-card">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="h-11 w-11 text-xl text-ink-soft active:bg-paper"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="tabular w-12 text-center text-lg font-semibold text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="h-11 w-11 text-xl text-ink-soft active:bg-paper"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

function Pill({
  on,
  label,
  onClick,
}: {
  on: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={
        'min-h-11 rounded-full border px-3 text-sm font-medium ' +
        (on
          ? 'border-accent bg-accent-soft text-accent'
          : 'border-line bg-card text-ink-soft')
      }
    >
      {label}
    </button>
  )
}

function CapabilityToggles({
  selected,
  onToggle,
}: {
  selected: Capability[]
  onToggle: (cap: Capability) => void
}) {
  return (
    <div className="space-y-3">
      {CAPABILITY_GROUPS.map((g) => (
        <div key={g.group}>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            {g.label}
          </div>
          <div className="flex flex-wrap gap-2">
            {g.capabilities.map((cap) => (
              <Pill
                key={cap}
                on={selected.includes(cap)}
                label={CAPABILITY_META[cap].label}
                onClick={() => onToggle(cap)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EquipmentToggles({
  selected,
  onToggle,
}: {
  selected: Equipment[]
  onToggle: (e: Equipment) => void
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        Kit you have here
      </div>
      <div className="flex flex-wrap gap-2">
        {EQUIPMENT_ORDER.map((e) => (
          <Pill
            key={e}
            on={selected.includes(e)}
            label={EQUIPMENT_LABELS[e]}
            onClick={() => onToggle(e)}
          />
        ))}
      </div>
    </div>
  )
}

function VenueEditor({ venue }: { venue: Venue }) {
  const { updateVenue, removeVenue } = useVenues()
  const toggleCap = (cap: Capability) => {
    const has = venue.capabilities.includes(cap)
    updateVenue(venue.id, {
      capabilities: has
        ? venue.capabilities.filter((c) => c !== cap)
        : [...venue.capabilities, cap],
    })
  }
  const toggleEquip = (e: Equipment) => {
    const has = venue.equipment.includes(e)
    updateVenue(venue.id, {
      equipment: has
        ? venue.equipment.filter((x) => x !== e)
        : [...venue.equipment, e],
    })
  }
  return (
    <div className="space-y-3 rounded-lg border border-line bg-card p-3">
      <div className="flex items-center gap-2">
        <input
          value={venue.name}
          onChange={(e) => updateVenue(venue.id, { name: e.target.value })}
          className="min-w-0 flex-1 rounded-md border border-line bg-paper px-2 py-1.5 font-medium text-ink"
          aria-label="Venue name"
        />
        <button
          type="button"
          onClick={() => removeVenue(venue.id)}
          className="min-h-11 px-2 text-sm font-medium text-[var(--color-accent)]"
        >
          Delete
        </button>
      </div>
      <CapabilityToggles selected={venue.capabilities} onToggle={toggleCap} />
      <EquipmentToggles selected={venue.equipment} onToggle={toggleEquip} />
    </div>
  )
}

function AddVenue() {
  const addVenue = useVenues((s) => s.addVenue)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [caps, setCaps] = useState<Capability[]>([])
  const [equip, setEquip] = useState<Equipment[]>([])

  const toggleCap = (cap: Capability) =>
    setCaps((c) => (c.includes(cap) ? c.filter((x) => x !== cap) : [...c, cap]))
  const toggleEquip = (e: Equipment) =>
    setEquip((c) => (c.includes(e) ? c.filter((x) => x !== e) : [...c, e]))

  const reset = () => {
    setName('')
    setCaps([])
    setEquip([])
    setOpen(false)
  }
  const save = () => {
    if (!name.trim() || caps.length === 0) return
    addVenue(name.trim(), caps, equip)
    reset()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 w-full rounded-lg border border-dashed border-line bg-card text-sm font-medium text-ink-soft active:bg-paper"
      >
        + Add a venue
      </button>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-line bg-card p-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (e.g. Range down the road)"
        className="w-full rounded-md border border-line bg-paper px-2 py-1.5 text-ink"
        aria-label="New venue name"
      />
      <CapabilityToggles selected={caps} onToggle={toggleCap} />
      <EquipmentToggles selected={equip} onToggle={toggleEquip} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="h-11 flex-1 rounded-lg border border-line bg-card text-sm font-medium text-ink-soft active:bg-paper"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!name.trim() || caps.length === 0}
          className="h-11 flex-1 rounded-lg bg-accent text-sm font-semibold text-on-accent disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | undefined>()

  const onExport = async () => {
    const bundle = await exportAll()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `senda-${bundle.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Exported your data as JSON.')
  }

  const onImportFile = async (file: File) => {
    try {
      const bundle = JSON.parse(await file.text()) as ExportBundle
      await importAll(bundle)
      // Reload every store from the freshly-imported storage.
      await Promise.all([
        useSettings.getState().hydrate(),
        useVenues.getState().hydrate(),
        useEntries.getState().hydrate(),
        useSession.getState().hydrate(),
      ])
      setMessage('Imported and reloaded your data.')
    } catch {
      setMessage('That file was not a valid Senda export.')
    }
  }

  return (
    <Section title="Your data" hint="Everything is stored on this device.">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onExport}
          className="min-h-11 flex-1 rounded-lg border border-line bg-card text-sm font-medium text-ink active:bg-paper"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="min-h-11 flex-1 rounded-lg border border-line bg-card text-sm font-medium text-ink active:bg-paper"
        >
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onImportFile(f)
            e.target.value = ''
          }}
        />
      </div>
      {message && <p className="mt-2 text-xs text-ink-soft">{message}</p>}
    </Section>
  )
}
