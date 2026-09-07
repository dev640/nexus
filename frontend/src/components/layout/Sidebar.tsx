import { NavLink, useNavigate } from 'react-router-dom'
import {
  X,
  Home,
  ListChecks,
  Inbox,
  FolderKanban,
  Rocket,
  Kanban,
  ListTodo,
  Calendar,
  BookOpen,
  PenTool,
  BarChart3,
  Sparkles,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { primaryNav, secondaryNav } from '../../lib/nav'
import type { NavItem } from '../../lib/nav'
import { useAppStore } from '../../store/useAppStore'

const iconByPath: Record<string, LucideIcon> = {
  '/': Home,
  '/my-work': ListChecks,
  '/inbox': Inbox,
  '/projects': FolderKanban,
  '/sprints': Rocket,
  '/board': Kanban,
  '/backlog': ListTodo,
  '/calendar': Calendar,
  '/wiki': BookOpen,
  '/whiteboard': PenTool,
  '/analytics': BarChart3,
  '/ai': Sparkles,
  '/team': Users,
  '/settings': Settings,
  '/help': HelpCircle,
}

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = iconByPath[item.path]
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-ink text-white'
            : 'text-ink/70 hover:bg-line/60 hover:text-ink'
        }`
      }
    >
      {Icon && <Icon size={16} strokeWidth={1.5} className="shrink-0" />}
      {item.label}
    </NavLink>
  )
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const userRole = useAppStore((s) => s.userRole)
  const logout = useAppStore((s) => s.logout)

  function handleLogout() {
    logout()
    onClose()
    navigate('/login')
  }

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col justify-between border-r border-line bg-white px-3 py-4 transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="mb-6 flex items-center justify-between px-3">
            <img src="/logo-wordmark.png" alt="Nexus" className="h-7 w-auto" />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-md p-1 text-mute hover:text-ink lg:hidden"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <NavRow key={item.path} item={item} onNavigate={onClose} />
            ))}
          </nav>
        </div>
        <nav className="flex flex-col gap-1 border-t border-line pt-3">
          {secondaryNav.map((item) => (
            <NavRow key={item.path} item={item} onNavigate={onClose} />
          ))}
          {userRole === 'ADMIN' && (
            <div className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink/70">
              <ShieldCheck size={16} strokeWidth={1.5} className="shrink-0" />
              Admin
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink/70 transition-colors hover:bg-line/60 hover:text-ink"
          >
            <LogOut size={16} strokeWidth={1.5} className="shrink-0" />
            Log out
          </button>
        </nav>
      </aside>
    </>
  )
}
