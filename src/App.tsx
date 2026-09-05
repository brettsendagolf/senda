import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { useHydrate } from '@/store/useHydrate'
import { useProfile } from '@/store/profile'
import { Onboarding } from '@/screens/Onboarding'
import { Today } from '@/screens/Today'
import { SessionRunner } from '@/screens/SessionRunner'
import { WarmupRunner } from '@/screens/WarmupRunner'
import { Drills } from '@/screens/Drills'
import { DrillDetailScreen } from '@/screens/DrillDetailScreen'
import { Progress } from '@/screens/Progress'
import { Learn, LearnArticleScreen } from '@/screens/Learn'
import { Profile } from '@/screens/Profile'
import { LogRound } from '@/screens/LogRound'
import { Settings } from '@/screens/Settings'

/** Tabbed shell: one scroll container (`main`), fixed nav below it. */
function AppLayout() {
  return (
    <div className="flex h-full flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  const ready = useHydrate()
  const onboarding = useProfile((s) => s.onboarding)
  if (!ready) return <div className="h-full bg-paper" />

  return (
    <Routes>
      {/* First run: straight into onboarding until it has been completed. */}
      <Route path="onboarding" element={<Onboarding />} />

      <Route element={<AppLayout />}>
        <Route
          index
          element={onboarding ? <Today /> : <Navigate to="/onboarding" replace />}
        />
        <Route path="practice" element={<Drills />} />
        {/* Older links kept working. */}
        <Route path="drills" element={<Navigate to="/practice" replace />} />
        <Route path="drills/:id" element={<DrillDetailScreen />} />

        <Route path="profile" element={<Profile />} />
        {/* Reached from Profile, not from a tab. */}
        <Route path="progress" element={<Progress />} />
        <Route path="log-round" element={<LogRound />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/:id" element={<LearnArticleScreen />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Runners are full-screen and distraction-free — no bottom tabs. */}
      <Route path="run" element={<SessionRunner />} />
      <Route path="warmup" element={<WarmupRunner />} />
    </Routes>
  )
}

export default App
