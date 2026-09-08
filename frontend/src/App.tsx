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
import { ApiVaultPage as ApiVault } from './pages/ApiVault'
import { CategoryPage } from './pages/CategoryPages'
import { ApiPlayground } from './pages/ApiPlayground'
import { Integrations } from './pages/Integrations'

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

  // The API Vault pages are dark-themed; they get their own surface so they
  // read correctly inside the light app shell.
  function VaultSurface({ children }: { children: React.ReactNode }) {
    return <div className="vault-surface min-h-full p-4 sm:p-6 lg:p-8">{children}</div>
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
              <Route
                path="/api-vault"
                element={
                  <VaultSurface>
                    <ApiVault />
                  </VaultSurface>
                }
              />
              <Route
                path="/api-vault/:category"
                element={
                  <VaultSurface>
                    <CategoryPage />
                  </VaultSurface>
                }
              />
              <Route
                path="/api-playground"
                element={
                  <VaultSurface>
                    <ApiPlayground />
                  </VaultSurface>
                }
              />
              <Route
                path="/integrations"
                element={
                  <VaultSurface>
                    <Integrations />
                  </VaultSurface>
                }
              />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  )
}

export default App
