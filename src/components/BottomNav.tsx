import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * Three tabs. The Brief warns that five is where golf apps go to die — and the
 * fifth is always a "More" bin. Progress, Learn and settings live behind
 * Profile, which keeps the bar to the three things you actually do.
 */
interface Tab {
  to: string
  label: string
  icon: ReactNode
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const TABS: Tab[] = [
  {
    to: '/',
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M6 21V4l12 4-12 4" />
      </svg>
    ),
  },
  {
    to: '/practice',
    label: 'Practice',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="8" r="3.8" />
        <path d="M4.5 20a7.5 7.5 0 0115 0" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav
      className="shrink-0 border-t border-line bg-card"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="grid grid-cols-3">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                'flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] ' +
                (isActive ? 'font-bold text-accent' : 'font-medium text-ink-mute')
              }
            >
              <span className="h-6 w-6">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
