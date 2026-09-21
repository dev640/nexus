import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { aiBrief } from '../lib/mockData'

interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  text: string
}

const suggestedPrompts = [
  'What is blocking the sprint?',
  'Summarize urgent tasks',
  'How is Sprint 8 tracking?',
  'Who is overloaded right now?',
]

export function AICopilot() {
  const tasks = useAppStore((s) => s.tasks)
  const sprints = useAppStore((s) => s.sprints)
  const members = useAppStore((s) => s.members)
  const projects = useAppStore((s) => s.projects)

  const blockedTasks = tasks.filter((t) => t.blocked)
  const urgentTasks = tasks.filter((t) => t.priority === 'URGENT')
  const aiGeneratedTasks = tasks.filter((t) => t.aiGenerated)
  const activeSprint = sprints.find((s) => s.status === 'ACTIVE') ?? sprints[sprints.length - 1]
  const overloaded = members.filter((m) => m.utilization > 85)

  function generateReply(question: string): string {
    const q = question.toLowerCase()

    if (q.includes('block')) {
      if (blockedTasks.length === 0) return 'Nothing is currently blocked. Clear runway ahead.'
      return `${blockedTasks.length} task${blockedTasks.length > 1 ? 's are' : ' is'} blocked: ${blockedTasks
        .map((t) => `${t.id} (${t.title})`)
        .join(', ')}.`
    }

    if (q.includes('urgent') || q.includes('priority')) {
      if (urgentTasks.length === 0) return 'No urgent-priority tasks right now.'
      return `${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''}: ${urgentTasks
        .map((t) => t.title)
        .join(', ')}.`
    }

    if (q.includes('sprint')) {
      if (!activeSprint) return 'No active sprint yet — create one from the Sprints page.'
      const project = projects.find((p) => p.id === activeSprint.projectId)
      const completed = tasks
        .filter((t) => t.sprintId === activeSprint.id && t.status === 'DONE')
        .reduce((sum, t) => sum + t.storyPoints, 0)
      const pct = activeSprint.committedPoints > 0 ? Math.round((completed / activeSprint.committedPoints) * 100) : 0
      return `${project?.name ?? 'Project'} Sprint ${activeSprint.number} is ${pct}% complete (${completed}/${activeSprint.committedPoints} points). Goal: ${activeSprint.goal}`
    }

    if (q.includes('overload') || q.includes('capacity') || q.includes('workload')) {
      if (overloaded.length === 0) return 'No one is over 85% utilization — workload looks balanced.'
      return `${overloaded.map((m) => `${m.name} (${m.utilization}%)`).join(', ')} ${
        overloaded.length > 1 ? 'are' : 'is'
      } running hot. Consider redistributing tasks.`
    }

    return aiBrief
  }

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: aiBrief },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const baseId = send.key
    send.key = baseId + 1
    const userMsg: ChatMessage = { id: baseId, role: 'user', text: trimmed }
    const aiMsg: ChatMessage = { id: baseId + 1, role: 'ai', text: generateReply(trimmed) }
    setMessages((prev) => [...prev, userMsg, aiMsg])
    setInput('')
  }
  send.key = 1

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-12">
      <div className="mb-2 text-xs font-medium uppercase tracking-widest text-mute">Intelligence</div>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
        AI Copilot
      </h1>

      <div className="mt-10 flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col border border-line bg-white">
          <div ref={scrollRef} className="flex h-[440px] flex-col gap-3 overflow-y-auto p-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-ink text-white'
                    : 'mr-auto border border-accent/40 bg-accent/10 text-ink'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="border-t border-line p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-mute hover:bg-paper"
                >
                  {p}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sprints, blockers, workload..."
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
          <div className="border border-line bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-mute">
              Blocked
            </h2>
            {blockedTasks.length === 0 ? (
              <p className="text-sm text-mute">Nothing blocked.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {blockedTasks.map((t) => (
                  <div key={t.id} className="text-sm">
                    <span className="mr-2 font-mono text-xs text-mute">{t.id}</span>
                    {t.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-line bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-mute">
              AI-Generated Tasks
            </h2>
            {aiGeneratedTasks.length === 0 ? (
              <p className="text-sm text-mute">None yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {aiGeneratedTasks.map((t) => (
                  <div key={t.id} className="text-sm">
                    <span className="mr-2 font-mono text-xs text-mute">{t.id}</span>
                    {t.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-line bg-white p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-mute">
              Team Capacity
            </h2>
            <div className="flex flex-col gap-2">
              {members.map((m) => (
                <div key={m.id} className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className={m.utilization > 85 ? 'font-medium text-danger' : 'text-mute'}>
                    {m.utilization}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
