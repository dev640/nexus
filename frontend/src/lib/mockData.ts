export type TaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'TESTING'
  | 'DONE'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Member {
  id: string
  name: string
  initials: string
  role: string
  utilization: number
}

export interface Task {
  id: string
  projectId: string
  sprintId?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  storyPoints: number
  assigneeId: string
  labels: string[]
  aiGenerated?: boolean
  blocked?: boolean
}

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED'

export interface Sprint {
  id: string
  projectId: string
  number: number
  goal: string
  startDate: string
  endDate: string
  committedPoints: number
  status: SprintStatus
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'
  health: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK'
  progress: number
  sprintNumber: number
  memberCount: number
}

export const velocity = 38

export const activity = [
  { id: 1, text: 'Palak completed TASK-193', time: '2h ago' },
  { id: 2, text: 'AI generated sprint documentation', time: '3h ago' },
  { id: 3, text: 'Vidhi commented on TASK-187', time: '5h ago' },
  { id: 4, text: 'Sprint 08 updated', time: '1d ago' },
  { id: 5, text: 'TASK-190 moved to Testing', time: '1d ago' },
]

export const aiBrief =
  'The sprint is on track, but API integration is becoming the primary delivery risk.'

export function memberById(members: Member[], id: string): Member | undefined {
  return members.find((m) => m.id === id)
}
