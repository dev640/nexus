import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  return (
    <div className="flex h-screen w-full flex-col bg-paper lg:flex-row">
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <img src="/logo-wordmark.png" alt="Nexus" className="h-7 w-auto" />
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          className="rounded-md border border-line p-2 text-ink hover:bg-paper"
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>
      </header>

      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <main key={location.pathname} className="animate-page-in flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
