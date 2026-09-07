import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
import { Landing } from './pages/Landing'
import { useAppStore } from './store/useAppStore'
import { Home } from './pages/Home'
import { MyWork } from './pages/MyWork'
import { Inbox } from './pages/Inbox'
import { Projects } from './pages/Projects'
import { Sprints } from './pages/Sprints'
import { Board } from './pages/Board'
import { Backlog } from './pages/Backlog'
import { Calendar } from './pages/Calendar'
import { Wiki } from './pages/Wiki'
import { Whiteboard } from './pages/Whiteboard'
import { Analytics } from './pages/Analytics'
import { AICopilot } from './pages/AICopilot'
import { Team } from './pages/Team'
import { Settings } from './pages/Settings'
import { Help } from './pages/Help'

function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="/*"
        element={
          <AppShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-work" element={<MyWork />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/sprints" element={<Sprints />} />
              <Route path="/board" element={<Board />} />
              <Route path="/backlog" element={<Backlog />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/wiki" element={<Wiki />} />
              <Route path="/whiteboard" element={<Whiteboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/ai" element={<AICopilot />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  )
}

export default App
