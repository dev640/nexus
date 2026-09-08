import { useAppStore } from '../store/useAppStore'
import type { TaskStatus, TaskPriority } from '../lib/mockData'

const statusOrder: { key: TaskStatus; label: string }[] = [
  { key: 'BACKLOG', label: 'Backlog' },
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'TESTING', label: 'Testing' },
  { key: 'DONE', label: 'Done' },
]

const priorityOrder: { key: TaskPriority; label: string; barColor: string; textColor: string }[] = [
  { key: 'LOW', label: 'Low', barColor: 'bg-mute', textColor: 'text-mute' },
  { key: 'MEDIUM', label: 'Medium', barColor: 'bg-info', textColor: 'text-info' },
  { key: 'HIGH', label: 'High', barColor: 'bg-warning', textColor: 'text-warning' },
  { key: 'URGENT', label: 'Urgent', barColor: 'bg-danger', textColor: 'text-danger' },
]

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-line bg-white p-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-mute">{label}</div>
      <div className="text-3xl font-semibold tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-mute">{sub}</div>}
    </div>
  )
}

function BarRow({
  label,
  value,
  max,
  color,
  valueLabel,
}: {
  label: string
  value: number
  max: number
  color: string
  valueLabel: string
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-28 shrink-0 text-mute">{label}</div>
      <div className="h-2.5 flex-1 rounded-full bg-paper">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-10 shrink-0 text-right font-medium text-ink">{valueLabel}</div>
    </div>
  )
}

export function Analytics() {
  const projects = useAppStore((s) => s.projects)
  const tasks = useAppStore((s) => s.tasks)
  const sprints = useAppStore((s) => s.sprints)
  const members = useAppStore((s) => s.members)

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE').length
  const blockedTasks = tasks.filter((t) => t.blocked).length

  const statusCounts = statusOrder.map((s) => ({
    ...s,
    count: tasks.filter((t) => t.status === s.key).length,
  }))
  const maxStatusCount = Math.max(...statusCounts.map((s) => s.count), 1)

  const priorityCounts = priorityOrder.map((p) => ({
    ...p,
    count: tasks.filter((t) => t.priority === p.key).length,
  }))
  const maxPriorityCount = Math.max(...priorityCounts.map((p) => p.count), 1)

  const sprintRows = sprints
    .map((sprint) => {
      const project = projects.find((p) => p.id === sprint.projectId)
      const completedPoints = tasks
        .filter((t) => t.sprintId === sprint.id && t.status === 'DONE')
        .reduce((sum, t) => sum + t.storyPoints, 0)
      return {
        id: sprint.id,
        label: `${project?.name ?? 'Unknown'} · Sprint ${sprint.number}`,
        committed: sprint.committedPoints,
        completed: completedPoints,
      }
    })
    .sort((a, b) => b.committed - a.committed)
  const maxSprintPoints = Math.max(...sprintRows.map((s) => Math.max(s.committed, s.completed)), 1)

  const maxUtilization = Math.max(...members.map((m) => m.utilization), 1)

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-mute">Insights</div>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">Analytics</h1>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <StatTile label="Total Tasks" value={String(totalTasks)} />
        <StatTile
          label="Completion Rate"
          value={`${completionRate}%`}
          sub={`${doneTasks} of ${totalTasks} done`}
        />
        <StatTile label="Active Sprints" value={String(activeSprints)} sub={`${sprints.length} total`} />
        <StatTile label="Blocked Tasks" value={String(blockedTasks)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="border border-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-mute">
              Sprint Velocity
            </h2>
            <div className="flex items-center gap-4 text-xs text-mute">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ink" /> Committed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-info" /> Completed
              </span>
            </div>
          </div>
          {sprintRows.length === 0 ? (
            <div className="py-6 text-sm text-mute">No sprints yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {sprintRows.map((row) => (
                <div key={row.id}>
                  <div className="mb-1.5 truncate text-sm font-medium text-ink" title={row.label}>
                    {row.label}
                  </div>
                  <div className="flex flex-col gap-1">
                    <BarRow
                      label="Committed"
                      value={row.committed}
                      max={maxSprintPoints}
                      color="bg-ink"
                      valueLabel={String(row.committed)}
                    />
                    <BarRow
                      label="Completed"
                      value={row.completed}
                      max={maxSprintPoints}
                      color="bg-info"
                      valueLabel={String(row.completed)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-mute">
            Tasks by Status
          </h2>
          <div className="flex flex-col gap-3">
            {statusCounts.map((s) => (
              <BarRow
                key={s.key}
                label={s.label}
                value={s.count}
                max={maxStatusCount}
                color="bg-ink"
                valueLabel={String(s.count)}
              />
            ))}
          </div>
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-mute">
            Tasks by Priority
          </h2>
          <div className="flex flex-col gap-3">
            {priorityCounts.map((p) => (
              <BarRow
                key={p.key}
                label={p.label}
                value={p.count}
                max={maxPriorityCount}
                color={p.barColor}
                valueLabel={String(p.count)}
              />
            ))}
          </div>
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-mute">
            Team Workload
          </h2>
          <div className="flex flex-col gap-3">
            {members.map((m) => (
              <BarRow
                key={m.id}
                label={m.name}
                value={m.utilization}
                max={maxUtilization}
                color={m.utilization > 85 ? 'bg-danger' : 'bg-ink'}
                valueLabel={`${m.utilization}%`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
