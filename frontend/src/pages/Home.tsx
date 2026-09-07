import { activity, aiBrief, velocity } from '../lib/mockData'
import { useAppStore } from '../store/useAppStore'

function greetingForHour(hour: number) {
  if (hour < 5) return 'GOOD NIGHT'
  if (hour < 12) return 'GOOD MORNING'
  if (hour < 17) return 'GOOD AFTERNOON'
  if (hour < 21) return 'GOOD EVENING'
  return 'GOOD NIGHT'
}

export function Home() {
  const tasks = useAppStore((s) => s.tasks)
  const sprints = useAppStore((s) => s.sprints)
  const members = useAppStore((s) => s.members)
  const displayName = useAppStore((s) => s.settings.displayName)
  const greeting = greetingForHour(new Date().getHours())
  const dueToday = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW')
  const blocked = tasks.filter((t) => t.blocked)
  const highPriority = tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH')

  const activeSprint =
    sprints.find((s) => s.status === 'ACTIVE') ?? sprints[sprints.length - 1]
  const sprintCompletedPoints = activeSprint
    ? tasks
        .filter((t) => t.sprintId === activeSprint.id && t.status === 'DONE')
        .reduce((sum, t) => sum + t.storyPoints, 0)
    : 0
  const sprintRemainingPoints = activeSprint
    ? Math.max(activeSprint.committedPoints - sprintCompletedPoints, 0)
    : 0
  const sprintPct =
    activeSprint && activeSprint.committedPoints > 0
      ? Math.round((sprintCompletedPoints / activeSprint.committedPoints) * 100)
      : 0

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-mute">
        Overview
      </div>
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
        {greeting},
        <br />
        {displayName.toUpperCase()}.
      </h1>
      <p className="mt-3 text-base text-mute">Here's what needs your attention.</p>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <section className="col-span-2 border border-line bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-mute">
            Today's Focus
          </h2>
          <div className="flex flex-col gap-2">
            {dueToday.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <div>
                  <span className="mr-2 font-mono text-xs text-mute">{t.id}</span>
                  <span className="text-sm">{t.title}</span>
                </div>
                <span className="text-xs text-mute">{t.status.replace('_', ' ')}</span>
              </div>
            ))}
            {blocked.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <div>
                  <span className="mr-2 font-mono text-xs text-mute">{t.id}</span>
                  <span className="text-sm">{t.title}</span>
                </div>
                <span className="text-xs font-medium text-danger">Blocked</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-line bg-ink p-6 text-white">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/50">
            Sprint Health
          </h2>
          {activeSprint ? (
            <>
              <div className="text-3xl font-semibold tracking-tight">SPRINT {activeSprint.number}</div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/15">
                <div className="h-1.5 rounded-full bg-accent" style={{ width: `${sprintPct}%` }} />
              </div>
              <div className="mt-2 text-sm text-white/70">{sprintPct}% complete</div>
              <div className="mt-6 grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-white/50">Completed</div>
                <div className="text-right">{sprintCompletedPoints}</div>
                <div className="text-white/50">Remaining</div>
                <div className="text-right">{sprintRemainingPoints}</div>
                <div className="text-white/50">Velocity</div>
                <div className="text-right">{velocity}</div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-white/70">No sprint yet. Create one from the Sprints page.</p>
          )}
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <section className="col-span-2 border border-accent/40 bg-accent/10 p-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink/60">
            AI Brief
          </h2>
          <p className="text-lg leading-snug text-ink">{aiBrief}</p>
          <button className="mt-4 text-sm font-medium underline underline-offset-4">
            View analysis →
          </button>
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-mute">
            Team Load
          </h2>
          <div className="flex flex-col gap-3">
            {members.map((m) => (
              <div key={m.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="text-mute">{m.utilization}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-line">
                  <div
                    className={`h-1.5 rounded-full ${m.utilization > 85 ? 'bg-danger' : 'bg-ink'}`}
                    style={{ width: `${m.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <section className="col-span-2 border border-line bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-mute">
            Recent Activity
          </h2>
          <div className="flex flex-col gap-2">
            {activity.map((a) => (
              <div key={a.id} className="flex justify-between border-b border-line py-2 text-sm last:border-0">
                <span>{a.text}</span>
                <span className="text-mute">{a.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-mute">
            High Priority
          </h2>
          <div className="flex flex-col gap-2">
            {highPriority.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0">
                <span>{t.title}</span>
                <span className="text-xs font-medium text-danger">{t.priority}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// auto-deploy test: 2026-09-07T18:09:11Z
