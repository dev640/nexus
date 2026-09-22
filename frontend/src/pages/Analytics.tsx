import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { apiErrorMessage, apiGetAnalyticsOverview, type ApiAnalyticsOverview } from '../lib/api'

const statusOrder: { key: string; label: string }[] = [
  { key: 'BACKLOG', label: 'Backlog' },
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'TESTING', label: 'Testing' },
  { key: 'DONE', label: 'Done' },
]

const priorityOrder: { key: string; label: string; barColor: string; textColor: string }[] = [
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
  const [data, setData] = useState<ApiAnalyticsOverview | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiGetAnalyticsOverview()
      .then((overview) => {
        if (!cancelled) setData(overview)
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, 'Failed to load analytics'))
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
        <div className="mb-1 text-xs font-medium uppercase tracking-widest text-mute">Insights</div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">Analytics</h1>
        <div className="mt-8 border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
        <div className="mb-1 text-xs font-medium uppercase tracking-widest text-mute">Insights</div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">Analytics</h1>
        <div className="mt-8 text-sm text-mute">Loading analytics…</div>
      </div>
    )
  }

  const totalTasks = data.summary.totalTasks
  const doneTasks = data.summary.doneTasks
  const completionRate = data.summary.completionRate

  const statusCounts = statusOrder.map((s) => ({
    ...s,
    count: data.statusBreakdown.find((x) => x.status === s.key)?.count ?? 0,
  }))
  const maxStatusCount = Math.max(...statusCounts.map((s) => s.count), 1)

  const priorityCounts = priorityOrder.map((p) => ({
    ...p,
    count: data.priorityBreakdown.find((x) => x.priority === p.key)?.count ?? 0,
  }))
  const maxPriorityCount = Math.max(...priorityCounts.map((p) => p.count), 1)

  const sprintRows = data.velocity.perSprint.map((s) => ({
    id: s.sprintId,
    label: `Sprint ${s.number} · ${s.goal}`,
    committed: s.committedPoints,
    completed: s.donePoints,
  }))
  const maxSprintPoints = Math.max(...sprintRows.map((s) => Math.max(s.committed, s.completed)), 1)

  const teamLoad = data.teamLoad
  const maxLoad = Math.max(...teamLoad.map((m) => m.openPoints), 1)

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
        <StatTile label="Open Risks" value={String(data.risks.length)} sub="detected by Copilot rules" />
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
          {data.summary.committedPointsActiveSprint > 0 && (
            <p className="mt-4 border-t border-line pt-3 text-xs text-mute">
              Active sprint: {data.summary.donePointsActiveSprint} of
              {' '}{data.summary.committedPointsActiveSprint} committed points done.
            </p>
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
            {teamLoad.length === 0 && <p className="text-sm text-mute">No assigned open tasks.</p>}
            {teamLoad.map((m) => (
              <BarRow
                key={m.userId}
                label={m.name}
                value={m.openPoints}
                max={maxLoad}
                color={m.openPoints > 13 ? 'bg-danger' : 'bg-ink'}
                valueLabel={`${m.openPoints} pts`}
              />
            ))}
          </div>
          {data.risks.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-mute">
                Top Risks
              </div>
              <div className="flex flex-col gap-1.5">
                {data.risks.slice(0, 4).map((r) => (
                  <div key={r.taskId} className="text-sm">
                    <span className="font-medium">{r.title}</span>
                    <span className="ml-2 text-xs text-mute">{r.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      {projects.length === 0 && null}
    </div>
  )
}
