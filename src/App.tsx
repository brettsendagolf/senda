import { Outlet, Route, Routes } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { useHydrate } from '@/store/useHydrate'
import { Today } from '@/screens/Today'
import { SessionRunner } from '@/screens/SessionRunner'
import { WarmupRunner } from '@/screens/WarmupRunner'
import { Drills } from '@/screens/Drills'
import { DrillDetailScreen } from '@/screens/DrillDetailScreen'
import { Progress } from '@/screens/Progress'
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
  if (!ready) return <div className="h-full bg-paper" />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Today />} />
        <Route path="drills" element={<Drills />} />
        <Route path="drills/:id" element={<DrillDetailScreen />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      {/* Runners are full-screen and distraction-free — no bottom tabs. */}
      <Route path="run" element={<SessionRunner />} />
      <Route path="warmup" element={<WarmupRunner />} />
    </Routes>
  )
}

export default App
