import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Category } from '@/types'
import { ScreenHeader } from '@/components/ScreenHeader'
import { Chip } from '@/components/Chip'
import { ModeBadge } from '@/components/ModeBadge'
import { DRILLS, GENERATABLE_DRILLS, COURSE_DRILLS } from '@/data/drills'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/data/labels'
import { useVenues } from '@/store/venues'

export function Drills() {
  const navigate = useNavigate()
  const venues = useVenues((s) => s.venues)
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [venueId, setVenueId] = useState<string | 'all'>('all')

  const venue = venues.find((v) => v.id === venueId)

  const filtered = useMemo(() => {
    return GENERATABLE_DRILLS.filter((d) => {
      if (category !== 'all' && d.category !== category) return false
      if (venue) {
        const capOk = d.requires.some((r) => venue.capabilities.includes(r))
        const kitOk = d.equipment.every((e) => venue.equipment.includes(e))
        if (!capOk || !kitOk) return false
      }
      return true
    })
  }, [category, venue])

  // Ghost Nine — standalone, not tied to a venue's facilities.
  const courseFiltered = useMemo(
    () => COURSE_DRILLS.filter((d) => category === 'all' || d.category === category),
    [category],
  )

  const categoriesPresent = CATEGORY_ORDER.filter((c) =>
    DRILLS.some((d) => d.category === c),
  )

  return (
    <div className="pb-8">
      <ScreenHeader title="Drills" subtitle={`${DRILLS.length} in your library`} />

      <div className="space-y-4 px-4 pt-4">
        {/* Venue filter */}
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            What can you do here?
          </h2>
          <div className="flex flex-wrap gap-2">
            <Chip selected={venueId === 'all'} onClick={() => setVenueId('all')}>
              Anywhere
            </Chip>
            {venues.map((v) => (
              <Chip
                key={v.id}
                selected={venueId === v.id}
                onClick={() => setVenueId(v.id)}
              >
                {v.name}
              </Chip>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-2">
            <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
              All
            </Chip>
            {categoriesPresent.map((c) => (
              <Chip
                key={c}
                selected={category === c}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c]}
              </Chip>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-line bg-card px-3 py-6 text-center text-sm text-ink-soft">
            No drills match that filter.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/drills/${d.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg border border-line bg-card px-3 py-3 text-left active:bg-paper"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">{d.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <ModeBadge mode={d.mode} />
                      <span className="text-xs text-ink-soft">
                        {CATEGORY_LABELS[d.category]}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-ink-soft">›</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* On the course — standalone Ghost Nine drills */}
        {courseFiltered.length > 0 && (
          <section className="pt-2">
            <h2 className="text-sm font-semibold text-ink">On the course</h2>
            <p className="mb-2 mt-0.5 text-xs text-ink-soft">
              Standalone — play these during a practice round, not in a built
              session.
            </p>
            <ul className="space-y-2">
              {courseFiltered.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/drills/${d.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg border border-line bg-card px-3 py-3 text-left active:bg-paper"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink">
                        {d.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <ModeBadge mode={d.mode} />
                        <span className="text-xs text-ink-soft">
                          {CATEGORY_LABELS[d.category]}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-ink-soft">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
