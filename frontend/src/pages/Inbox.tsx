import { useState } from 'react'
import { useAppStore, type NotificationCategory } from '../store/useAppStore'

type Category = NotificationCategory

const tabs: { key: 'ALL' | Category; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'MENTIONS', label: 'Mentions' },
  { key: 'TASKS', label: 'Tasks' },
  { key: 'PROJECTS', label: 'Projects' },
  { key: 'AI', label: 'AI' },
  { key: 'SYSTEM', label: 'System' },
]

const categoryColor: Record<Category, string> = {
  MENTIONS: 'text-info',
  TASKS: 'text-ink',
  PROJECTS: 'text-ink',
  AI: 'text-ink',
  SYSTEM: 'text-mute',
}

export function Inbox() {
  const notifications = useAppStore((s) => s.notifications)
  const markRead = useAppStore((s) => s.markNotificationRead)
  const archive = useAppStore((s) => s.archiveNotification)
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead)
  const mutedCategories = useAppStore((s) => s.settings.mutedCategories)
  const [tab, setTab] = useState<'ALL' | Category>('ALL')

  const unmuted = notifications.filter((n) => !mutedCategories.includes(n.category))
  const visible = unmuted.filter(
    (n) => !n.archived && (tab === 'ALL' || n.category === tab),
  )
  const unreadCount = unmuted.filter((n) => !n.read && !n.archived).length

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-mute">
        Notifications
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">Inbox</h1>
      <div className="mt-3 flex items-center gap-4">
        {unreadCount > 0 && <p className="text-sm text-mute">{unreadCount} unread</p>}
        {unreadCount > 0 && (
          <button
            onClick={() => void markAllRead()}
            className="text-xs font-medium text-ink underline-offset-2 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? 'border-b-2 border-ink text-ink'
                : 'text-mute hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 border border-line bg-white">
        {visible.length === 0 && (
          <div className="p-8 text-sm text-mute">Nothing here.</div>
        )}
        {visible.map((n) => (
          <div
            key={n.id}
            className="flex flex-col gap-3 border-b border-line px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-accent'}`}
              />
              <div>
                <span className={`mr-2 text-xs font-semibold uppercase tracking-wide ${categoryColor[n.category]}`}>
                  {n.category}
                </span>
                <span className={`text-sm ${n.read ? 'text-ink/70' : 'font-medium text-ink'}`}>
                  {n.text}
                </span>
                <div className="mt-0.5 text-xs text-mute">{n.time}</div>
              </div>
            </div>
            <div className="flex flex-wrap shrink-0 gap-2 text-xs">
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="rounded-md border border-line px-3 py-1.5 font-medium hover:bg-paper"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => archive(n.id)}
                className="rounded-md border border-line px-3 py-1.5 font-medium hover:bg-paper"
              >
                Archive
              </button>
              <button className="rounded-md bg-ink px-3 py-1.5 font-medium text-white hover:bg-black">
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
