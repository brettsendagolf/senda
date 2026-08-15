import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ScreenHeader } from '@/components/ScreenHeader'
import { getArticle, sectionsFor } from '@/data/learn'
import { isBeginner } from '@/lib/onboarding'
import { useProfile } from '@/store/profile'

/**
 * Learn — free forever, and tailored: a newcomer sees the range and first-round
 * content first; an experienced golfer isn't shown things they already know.
 */
export function Learn() {
  const navigate = useNavigate()
  const onboarding = useProfile((s) => s.onboarding)
  const experience = onboarding?.experience
  const sections = sectionsFor(experience)
  const beginner = experience ? isBeginner(experience) : false

  return (
    <div className="pb-8">
      <ScreenHeader back backLabel="Profile" title="Learn" subtitle="Free, forever" />

      <div className="space-y-6 px-4 pt-4">
        {beginner && (
          <div className="rounded-2xl bg-ink p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-paper/60">
              Start here
            </div>
            <p className="mt-1 text-xl font-bold text-paper">First Tee</p>
            <p className="mt-1 text-sm leading-relaxed text-paper/75">
              Everything nobody tells you. What to buy, where to stand, what it
              costs, and what to do when you feel out of place.
            </p>
          </div>
        )}

        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
              {section.eyebrow}
            </h2>
            <ul className="overflow-hidden rounded-2xl border border-line bg-card">
              {section.articles.map((a, i) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/learn/${a.id}`)}
                    className={
                      'flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-paper ' +
                      (i > 0 ? 'border-t border-line' : '')
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-ink">{a.title}</div>
                      <div className="mt-0.5 text-[13px] text-ink-mute">
                        {a.blurb}
                      </div>
                    </div>
                    <span className="tabular shrink-0 text-xs text-ink-mute">
                      {a.readMinutes} min
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {!onboarding && (
          <p className="rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink-soft">
            Tell us where you are in Settings and this list tailors itself to
            you.
          </p>
        )}
      </div>
    </div>
  )
}

export function LearnArticleScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const article = id ? getArticle(id) : undefined
  if (!article) return <Navigate to="/learn" replace />

  return (
    <div className="pb-12">
      <header
        className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 pb-3 backdrop-blur"
        style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="min-h-11 text-sm font-medium text-ink-soft"
        >
          ‹ Learn
        </button>
      </header>

      <article className="px-4 pt-3">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-ink">
          {article.title}
        </h1>
        <p className="mt-1.5 text-ink-soft">{article.blurb}</p>
        <p className="tabular mt-1 text-xs text-ink-mute">
          {article.readMinutes} min read
        </p>

        <div className="mt-5 space-y-3.5">
          {article.body.map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-ink">
              {para}
            </p>
          ))}
        </div>
      </article>
    </div>
  )
}
