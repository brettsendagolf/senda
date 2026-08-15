import { NavLink } from 'react-router-dom'

interface Tab {
  to: string
  label: string
  icon: string // simple glyph for now; real icons come later
}

// The Brief specifies four tabs (Today · Practice · Progress · Learn) with
// settings behind an avatar. Settings still has a tab until that lands.
const TABS: Tab[] = [
  { to: '/', label: 'Today', icon: '⛳' },
  { to: '/drills', label: 'Practice', icon: '☰' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/learn', label: 'Learn', icon: '📖' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export function BottomNav() {
  return (
    <nav
      className="shrink-0 border-t border-line bg-card"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ' +
                (isActive ? 'text-accent' : 'text-ink-soft')
              }
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
