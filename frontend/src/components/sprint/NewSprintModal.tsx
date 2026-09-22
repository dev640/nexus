import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useAppStore } from '../../store/useAppStore'

export function NewSprintModal({
  open,
  onClose,
  defaultProjectId,
}: {
  open: boolean
  onClose: () => void
  defaultProjectId?: string
}) {
  const projects = useAppStore((s) => s.projects)
  const addSprint = useAppStore((s) => s.addSprint)

  const effectiveProjectId = defaultProjectId ?? projects[0]?.id ?? ''
  const [projectId, setProjectId] = useState(effectiveProjectId)
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [committedPoints, setCommittedPoints] = useState(20)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal.trim() || !projectId || !startDate || !endDate) return
    setError('')
    const created = await addSprint({ projectId, goal: goal.trim(), startDate, endDate, committedPoints })
    if (!created) {
      setError('Could not create the sprint. Check the dates and try again.')
      return
    }
    setGoal('')
    setStartDate('')
    setEndDate('')
    setCommittedPoints(20)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New Sprint">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-mute">
            Project
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-mute">
            Goal
          </label>
          <input
            autoFocus
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            placeholder="Launch the billing foundation."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-mute">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-mute">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-mute">
            Committed Points
          </label>
          <input
            type="number"
            min={0}
            value={committedPoints}
            onChange={(e) => setCommittedPoints(Number(e.target.value))}
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          {error && <p className="mr-auto text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-paper"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Create Sprint
          </button>
        </div>
      </form>
    </Modal>
  )
}
