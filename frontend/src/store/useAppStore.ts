import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Member, Project, Sprint, SprintStatus, Task, TaskPriority, TaskStatus } from '../lib/mockData'

const seedMembers: Member[] = [
  { id: 'devendra', name: 'Devendra', initials: 'DF', role: 'Project Manager', utilization: 92 },
  { id: 'achal', name: 'Achal', initials: 'AC', role: 'Backend Engineer', utilization: 64 },
  { id: 'vidhi', name: 'Vidhi', initials: 'VD', role: 'Frontend Engineer', utilization: 81 },
  { id: 'palak', name: 'Palak', initials: 'PL', role: 'QA Engineer', utilization: 43 },
]

const seedProjects: Project[] = [
  {
    id: 'ai-commerce',
    name: 'AI Commerce Platform',
    description: 'Building an intelligent commerce platform for independent retailers.',
    status: 'ACTIVE',
    health: 'ON_TRACK',
    progress: 68,
    sprintNumber: 8,
    memberCount: 12,
  },
]

const seedTasks: Task[] = [
  { id: 'TASK-184', projectId: 'ai-commerce', sprintId: 'ai-commerce-sprint-8', title: 'Design authentication flow', status: 'DONE', priority: 'HIGH', storyPoints: 5, assigneeId: 'vidhi', labels: ['design', 'auth'] },
  { id: 'TASK-185', projectId: 'ai-commerce', sprintId: 'ai-commerce-sprint-8', title: 'Create PostgreSQL schema', status: 'DONE', priority: 'HIGH', storyPoints: 3, assigneeId: 'achal', labels: ['backend', 'database'] },
  { id: 'TASK-186', projectId: 'ai-commerce', sprintId: 'ai-commerce-sprint-8', title: 'Implement JWT authentication', status: 'IN_PROGRESS', priority: 'URGENT', storyPoints: 8, assigneeId: 'achal', labels: ['backend', 'security'] },
  { id: 'TASK-187', projectId: 'ai-commerce', sprintId: 'ai-commerce-sprint-8', title: 'Build project dashboard', status: 'IN_REVIEW', priority: 'MEDIUM', storyPoints: 8, assigneeId: 'vidhi', labels: ['frontend'] },
  { id: 'TASK-188', projectId: 'ai-commerce', sprintId: 'ai-commerce-sprint-8', title: 'Integrate payment API', status: 'TODO', priority: 'URGENT', storyPoints: 13, assigneeId: 'achal', labels: ['backend', 'payments'], blocked: true },
  { id: 'TASK-189', projectId: 'ai-commerce', title: 'Write API documentation', status: 'TODO', priority: 'LOW', storyPoints: 3, assigneeId: 'devendra', labels: ['docs'], aiGenerated: true },
  { id: 'TASK-190', projectId: 'ai-commerce', sprintId: 'ai-commerce-sprint-8', title: 'Create QA test suite', status: 'TESTING', priority: 'HIGH', storyPoints: 5, assigneeId: 'palak', labels: ['qa'] },
]

const seedSprints: Sprint[] = [
  {
    id: 'ai-commerce-sprint-8',
    projectId: 'ai-commerce',
    number: 8,
    goal: 'Launch the billing foundation.',
    startDate: '2026-08-18',
    endDate: '2026-08-29',
    committedPoints: 42,
    status: 'ACTIVE',
  },
]

export interface Team {
  id: string
  name: string
  memberIds: string[]
  projectIds: string[]
}

const seedTeams: Team[] = [
  {
    id: 'core-engineering',
    name: 'Core Engineering',
    memberIds: ['devendra', 'achal', 'vidhi', 'palak'],
    projectIds: ['ai-commerce'],
  },
]

export interface WikiPage {
  id: string
  title: string
  content: string
  projectId?: string
  author: string
  updatedAt: string
}

const seedWikiPages: WikiPage[] = [
  {
    id: 'onboarding',
    title: 'Engineering Onboarding',
    content:
      'Welcome to the team.\n\n1. Clone the repo and run `npm install` in frontend/.\n2. Copy .env.example to .env and fill in local Postgres/Redis creds.\n3. Run `npm run dev` and check http://localhost:5173.\n4. Read the API auth doc before touching the backend.',
    author: 'Devendra',
    updatedAt: '2026-08-10T09:00:00.000Z',
  },
  {
    id: 'api-auth',
    title: 'API Authentication',
    content:
      'JWT tokens are issued on login and expire after 24h. Attach as `Authorization: Bearer <token>`. Refresh tokens are not implemented yet — re-login on expiry.',
    projectId: 'ai-commerce',
    author: 'Achal',
    updatedAt: '2026-08-15T14:30:00.000Z',
  },
]

export const noteColors = ['#fff2a8', '#ffd6d6', '#d6ffe0', '#d6e8ff', '#ecd6ff'] as const
export type NoteColor = (typeof noteColors)[number]

export interface StickyNote {
  id: string
  text: string
  color: NoteColor
  x: number
  y: number
  author: string
}

const seedStickyNotes: StickyNote[] = [
  { id: 'note-1', text: 'Retro: celebrate the auth flow ship 🎉', color: '#fff2a8', x: 40, y: 40, author: 'Devendra' },
  { id: 'note-2', text: 'Payments API still blocked on vendor sandbox access', color: '#ffd6d6', x: 320, y: 100, author: 'Achal' },
  { id: 'note-3', text: 'Sketch new dashboard layout before Sprint 9', color: '#d6e8ff', x: 90, y: 260, author: 'Vidhi' },
]

export type NotificationCategory = 'MENTIONS' | 'TASKS' | 'PROJECTS' | 'AI' | 'SYSTEM'

export interface Notification {
  id: number
  category: NotificationCategory
  text: string
  time: string
  read: boolean
  archived: boolean
}

const seedNotifications: Notification[] = [
  { id: 1, category: 'MENTIONS', text: 'Vidhi mentioned you in TASK-182', time: '12m ago', read: false, archived: false },
  { id: 2, category: 'AI', text: 'AI detected a sprint risk', time: '1h ago', read: false, archived: false },
  { id: 3, category: 'SYSTEM', text: 'Sprint 08 ends in 3 days', time: '3h ago', read: false, archived: false },
  { id: 4, category: 'TASKS', text: 'Palak completed TASK-193', time: '5h ago', read: true, archived: false },
  { id: 5, category: 'PROJECTS', text: 'You were added to AI Commerce Platform', time: '1d ago', read: true, archived: false },
  { id: 6, category: 'AI', text: 'AI generated sprint documentation for Sprint 08', time: '1d ago', read: true, archived: false },
  { id: 7, category: 'MENTIONS', text: 'Achal mentioned you in a comment on TASK-186', time: '2d ago', read: true, archived: false },
]

interface NewProjectInput {
  name: string
  description: string
}

interface NewTaskInput {
  title: string
  projectId: string
  sprintId?: string
  status: TaskStatus
  priority: TaskPriority
  storyPoints: number
  assigneeId: string
}

interface NewSprintInput {
  projectId: string
  goal: string
  startDate: string
  endDate: string
  committedPoints: number
}

interface NewMemberInput {
  name: string
  role: string
}

interface NewWikiPageInput {
  title: string
  content: string
  projectId?: string
}

export interface Settings {
  displayName: string
  role: string
  defaultAssigneeId: string
  mutedCategories: NotificationCategory[]
}

const defaultSettings: Settings = {
  displayName: 'Devendra',
  role: 'Project Manager',
  defaultAssigneeId: 'devendra',
  mutedCategories: [],
}

export type UserRole = 'ADMIN' | 'MEMBER'

interface AppState {
  projects: Project[]
  tasks: Task[]
  teams: Team[]
  sprints: Sprint[]
  notifications: Notification[]
  members: Member[]
  wikiPages: WikiPage[]
  stickyNotes: StickyNote[]
  settings: Settings
  taskCounter: number
  isAuthenticated: boolean
  userRole: UserRole
  login: (role: UserRole) => void
  logout: () => void
  addStickyNote: (color: NoteColor) => StickyNote
  updateStickyNoteText: (id: string, text: string) => void
  moveStickyNote: (id: string, x: number, y: number) => void
  deleteStickyNote: (id: string) => void
  addMember: (input: NewMemberInput) => Member
  addWikiPage: (input: NewWikiPageInput) => WikiPage
  updateWikiPage: (id: string, input: { title: string; content: string }) => void
  deleteWikiPage: (id: string) => void
  addProject: (input: NewProjectInput) => Project
  addTask: (input: NewTaskInput) => Task
  updateTaskStatus: (id: string, status: TaskStatus) => void
  addTeam: (name: string) => Team
  deleteTeam: (teamId: string) => void
  addMemberToTeam: (teamId: string, memberId: string) => void
  removeMemberFromTeam: (teamId: string, memberId: string) => void
  assignProjectToTeam: (teamId: string, projectId: string) => void
  unassignProjectFromTeam: (teamId: string, projectId: string) => void
  markNotificationRead: (id: number) => void
  archiveNotification: (id: number) => void
  addSprint: (input: NewSprintInput) => Sprint
  setSprintStatus: (sprintId: string, status: SprintStatus) => void
  updateSettings: (input: Partial<Pick<Settings, 'displayName' | 'role' | 'defaultAssigneeId'>>) => void
  toggleMutedCategory: (category: NotificationCategory) => void
  resetWorkspace: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  projects: seedProjects,
  tasks: seedTasks,
  teams: seedTeams,
  sprints: seedSprints,
  notifications: seedNotifications,
  members: seedMembers,
  wikiPages: seedWikiPages,
  stickyNotes: seedStickyNotes,
  settings: defaultSettings,
  taskCounter: 191,
  isAuthenticated: false,
  userRole: 'MEMBER',

  login: (role) => {
    set({ isAuthenticated: true, userRole: role })
  },

  logout: () => {
    set({ isAuthenticated: false, userRole: 'MEMBER' })
  },

  addStickyNote: (color) => {
    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      text: '',
      color,
      x: 40 + Math.round(Math.random() * 120),
      y: 40 + Math.round(Math.random() * 80),
      author: get().settings.displayName,
    }
    set((state) => ({ stickyNotes: [...state.stickyNotes, newNote] }))
    return newNote
  },

  updateStickyNoteText: (id, text) => {
    set((state) => ({
      stickyNotes: state.stickyNotes.map((n) => (n.id === id ? { ...n, text } : n)),
    }))
  },

  moveStickyNote: (id, x, y) => {
    set((state) => ({
      stickyNotes: state.stickyNotes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    }))
  },

  deleteStickyNote: (id) => {
    set((state) => ({ stickyNotes: state.stickyNotes.filter((n) => n.id !== id) }))
  },

  addWikiPage: (input) => {
    const id = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `page-${Date.now()}`
    const newPage: WikiPage = {
      id,
      title: input.title,
      content: input.content,
      projectId: input.projectId,
      author: get().settings.displayName,
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({ wikiPages: [...state.wikiPages, newPage] }))
    return newPage
  },

  updateWikiPage: (id, input) => {
    set((state) => ({
      wikiPages: state.wikiPages.map((p) =>
        p.id === id
          ? { ...p, title: input.title, content: input.content, updatedAt: new Date().toISOString() }
          : p,
      ),
    }))
  },

  deleteWikiPage: (id) => {
    set((state) => ({ wikiPages: state.wikiPages.filter((p) => p.id !== id) }))
  },

  addMember: (input) => {
    const id = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `member-${Date.now()}`
    const initials = input.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    const newMember: Member = { id, name: input.name, initials, role: input.role, utilization: 0 }
    set((state) => ({ members: [...state.members, newMember] }))
    return newMember
  },

  addProject: (input) => {
    const newProject: Project = {
      id: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `project-${Date.now()}`,
      name: input.name,
      description: input.description,
      status: 'PLANNING',
      health: 'ON_TRACK',
      progress: 0,
      sprintNumber: 0,
      memberCount: 1,
    }
    set((state) => ({ projects: [...state.projects, newProject] }))
    return newProject
  },

  addTask: (input) => {
    const id = `TASK-${get().taskCounter}`
    const newTask: Task = {
      id,
      projectId: input.projectId,
      sprintId: input.sprintId,
      title: input.title,
      status: input.status,
      priority: input.priority,
      storyPoints: input.storyPoints,
      assigneeId: input.assigneeId,
      labels: [],
    }
    set((state) => ({
      tasks: [...state.tasks, newTask],
      taskCounter: state.taskCounter + 1,
    }))
    return newTask
  },

  updateTaskStatus: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }))
  },

  addTeam: (name) => {
    const newTeam: Team = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `team-${Date.now()}`,
      name,
      memberIds: [],
      projectIds: [],
    }
    set((state) => ({ teams: [...state.teams, newTeam] }))
    return newTeam
  },

  deleteTeam: (teamId) => {
    set((state) => ({ teams: state.teams.filter((t) => t.id !== teamId) }))
  },

  addMemberToTeam: (teamId, memberId) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId && !t.memberIds.includes(memberId)
          ? { ...t, memberIds: [...t.memberIds, memberId] }
          : t,
      ),
    }))
  },

  removeMemberFromTeam: (teamId, memberId) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, memberIds: t.memberIds.filter((id) => id !== memberId) } : t,
      ),
    }))
  },

  assignProjectToTeam: (teamId, projectId) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId && !t.projectIds.includes(projectId)
          ? { ...t, projectIds: [...t.projectIds, projectId] }
          : t,
      ),
    }))
  },

  unassignProjectFromTeam: (teamId, projectId) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, projectIds: t.projectIds.filter((id) => id !== projectId) } : t,
      ),
    }))
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  },

  archiveNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, archived: true } : n)),
    }))
  },

  addSprint: (input) => {
    const existingForProject = get().sprints.filter((s) => s.projectId === input.projectId)
    const number = existingForProject.length + 1
    const newSprint: Sprint = {
      id: `${input.projectId}-sprint-${number}`,
      projectId: input.projectId,
      number,
      goal: input.goal,
      startDate: input.startDate,
      endDate: input.endDate,
      committedPoints: input.committedPoints,
      status: 'PLANNED',
    }
    set((state) => ({
      sprints: [...state.sprints, newSprint],
      projects: state.projects.map((p) =>
        p.id === input.projectId ? { ...p, sprintNumber: number } : p,
      ),
    }))
    return newSprint
  },

  setSprintStatus: (sprintId, status) => {
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprintId ? { ...s, status } : s)),
    }))
  },

  updateSettings: (input) => {
    set((state) => ({ settings: { ...state.settings, ...input } }))
  },

  toggleMutedCategory: (category) => {
    set((state) => ({
      settings: {
        ...state.settings,
        mutedCategories: state.settings.mutedCategories.includes(category)
          ? state.settings.mutedCategories.filter((c) => c !== category)
          : [...state.settings.mutedCategories, category],
      },
    }))
  },

  resetWorkspace: () => {
    set({
      projects: seedProjects,
      tasks: seedTasks,
      teams: seedTeams,
      sprints: seedSprints,
      notifications: seedNotifications,
      members: seedMembers,
      wikiPages: seedWikiPages,
      stickyNotes: seedStickyNotes,
      settings: defaultSettings,
      taskCounter: 191,
    })
  },
    }),
    { name: 'nexus-storage' },
  ),
)
