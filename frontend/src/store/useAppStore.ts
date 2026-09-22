import { create } from 'zustand'
import {
  api,
  apiCreateProject,
  apiCreateSprint,
  apiCreateTask,
  apiErrorMessage,
  apiListProjects,
  apiListSprints,
  apiListTasks,
  apiListUsers,
  apiLogin,
  apiRegister,
  apiUpdateSprintStatus,
  apiUpdateTaskStatus,
  getStoredToken,
  storeToken,
  type ApiUser,
} from '../lib/api'
import type {
  Member,
  Project,
  Sprint,
  SprintStatus,
  Task,
  TaskPriority,
  TaskStatus,
} from '../lib/mockData'

// ---------------------------------------------------------------------------
// ID mapping — the backend uses numeric IDs, the frontend historically used
// string IDs. Prefixed strings keep them visually distinct and traceable.
// ---------------------------------------------------------------------------

const toProjectId = (n: number) => `p-${n}`
const toSprintId = (n: number) => `s-${n}`
const toTaskId = (n: number) => `t-${n}`
const toUserId = (n: number) => `u-${n}`

function parseId(value: string): number {
  const n = Number(String(value).replace(/^[a-z]+-/, ''))
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid entity id: ${value}`)
  }
  return n
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function mapUser(u: ApiUser): Member {
  return { id: toUserId(u.id), name: u.name, initials: initialsOf(u.name), role: u.role, utilization: 0 }
}

// ---------------------------------------------------------------------------
// Local-only models (replaced by backend domains in later phases)
// ---------------------------------------------------------------------------

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
    memberIds: ['u-1', 'u-2', 'u-3', 'u-4'],
    projectIds: ['p-1'],
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
    projectId: 'p-1',
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

export interface Settings {
  displayName: string
  role: string
  defaultAssigneeId: string
  mutedCategories: NotificationCategory[]
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type UserRole = 'ADMIN' | 'MEMBER'

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

export interface AuthResult {
  ok: boolean
  error?: string
}

interface AppState {
  // API-backed data
  projects: Project[]
  tasks: Task[]
  sprints: Sprint[]
  members: Member[]
  // Local-only data (later phases move these to the backend)
  teams: Team[]
  wikiPages: WikiPage[]
  stickyNotes: StickyNote[]
  notifications: Notification[]
  settings: Settings

  // Auth / sync state
  isAuthenticated: boolean
  isBootstrapped: boolean
  isLoading: boolean
  syncError: string | null
  currentUser: ApiUser | null
  userRole: UserRole

  // Auth
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => void
  bootstrapFromStoredToken: () => Promise<void>

  // Sync
  loadWorkspace: () => Promise<void>

  // Tasks
  addTask: (input: NewTaskInput) => Promise<Task | null>
  updateTaskStatus: (id: string, status: TaskStatus) => void

  // Projects
  addProject: (input: NewProjectInput) => Promise<Project | null>

  // Sprints
  addSprint: (input: NewSprintInput) => Promise<Sprint | null>
  setSprintStatus: (sprintId: string, status: SprintStatus) => void

  // Sticky notes (local until Phase 6)
  addStickyNote: (color: NoteColor) => StickyNote
  updateStickyNoteText: (id: string, text: string) => void
  moveStickyNote: (id: string, x: number, y: number) => void
  deleteStickyNote: (id: string) => void

  // Members / teams (local until Phase 2/6)
  addMember: (input: NewMemberInput) => Member
  addTeam: (name: string) => Team
  deleteTeam: (teamId: string) => void
  addMemberToTeam: (teamId: string, memberId: string) => void
  removeMemberFromTeam: (teamId: string, memberId: string) => void
  assignProjectToTeam: (teamId: string, projectId: string) => void
  unassignProjectFromTeam: (teamId: string, projectId: string) => void

  // Wiki (local until Phase 3)
  addWikiPage: (input: NewWikiPageInput) => WikiPage
  updateWikiPage: (id: string, input: { title: string; content: string }) => void
  deleteWikiPage: (id: string) => void

  // Notifications (local until Phase 4)
  markNotificationRead: (id: number) => void
  archiveNotification: (id: number) => void

  // Settings (local until Phase 2)
  updateSettings: (input: Partial<Pick<Settings, 'displayName' | 'role' | 'defaultAssigneeId'>>) => void
  toggleMutedCategory: (category: NotificationCategory) => void
  resetWorkspace: () => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  projects: [],
  tasks: [],
  sprints: [],
  members: [],
  teams: seedTeams,
  wikiPages: seedWikiPages,
  stickyNotes: seedStickyNotes,
  notifications: seedNotifications,
  settings: {
    displayName: '',
    role: '',
    defaultAssigneeId: '',
    mutedCategories: [],
  },

  isAuthenticated: Boolean(getStoredToken()),
  isBootstrapped: false,
  isLoading: false,
  syncError: null,
  currentUser: null,
  userRole: 'MEMBER',

  // ---------------- Auth ----------------

  login: async (email, password) => {
    try {
      const auth = await apiLogin(email, password)
      storeToken(auth.token)
      set({
        isAuthenticated: true,
        currentUser: auth.user,
        userRole: auth.user.role,
        settings: { ...get().settings, displayName: auth.user.name, role: auth.user.role },
      })
      await get().loadWorkspace()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err, 'Login failed') }
    }
  },

  register: async (name, email, password) => {
    try {
      const auth = await apiRegister(name, email, password)
      storeToken(auth.token)
      set({
        isAuthenticated: true,
        currentUser: auth.user,
        userRole: auth.user.role,
        settings: { ...get().settings, displayName: auth.user.name, role: auth.user.role },
      })
      await get().loadWorkspace()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err, 'Registration failed') }
    }
  },

  logout: () => {
    storeToken(null)
    api.defaults.headers.common['Authorization'] = undefined
    set({
      isAuthenticated: false,
      currentUser: null,
      userRole: 'MEMBER',
      isBootstrapped: false,
      projects: [],
      tasks: [],
      sprints: [],
      members: [],
      syncError: null,
    })
  },

  bootstrapFromStoredToken: async () => {
    if (!getStoredToken() || get().isBootstrapped) return
    await get().loadWorkspace()
  },

  // ---------------- Sync ----------------

  loadWorkspace: async () => {
    set({ isLoading: true, syncError: null })
    try {
      const [users, projects, sprints, tasks] = await Promise.all([
        apiListUsers(),
        apiListProjects(),
        apiListSprints(),
        apiListTasks(),
      ])

      const members = users.map(mapUser)
      const displayName = get().settings.displayName || members[0]?.name || ''

      set({
        members,
        projects: projects.map((p) => ({
          id: toProjectId(p.id),
          name: p.name,
          description: p.description ?? '',
          status: p.status,
          health: p.health,
          progress: p.progress,
          sprintNumber: p.sprintNumber,
          memberCount: p.memberCount,
        })),
        sprints: sprints.map((s) => ({
          id: toSprintId(s.id),
          projectId: toProjectId(s.projectId),
          number: s.number,
          goal: s.goal,
          startDate: s.startDate,
          endDate: s.endDate,
          committedPoints: s.committedPoints,
          status: s.status,
        })),
        tasks: tasks.map((t) => ({
          id: toTaskId(t.id),
          projectId: toProjectId(t.projectId),
          sprintId: t.sprintId != null ? toSprintId(t.sprintId) : undefined,
          title: t.title,
          status: t.status,
          priority: t.priority,
          storyPoints: t.storyPoints ?? 0,
          assigneeId: t.assignee ? toUserId(t.assignee.id) : '',
          labels: t.labels ?? [],
        })),
        settings: { ...get().settings, displayName },
        isBootstrapped: true,
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false, isBootstrapped: true, syncError: apiErrorMessage(err, 'Failed to load workspace') })
    }
  },

  // ---------------- Tasks ----------------

  addTask: async (input) => {
    try {
      const created = await apiCreateTask({
        title: input.title,
        projectId: parseId(input.projectId),
        sprintId: input.sprintId ? parseId(input.sprintId) : null,
        status: input.status,
        priority: input.priority,
        storyPoints: input.storyPoints,
        assigneeId: input.assigneeId ? parseId(input.assigneeId) : null,
        labels: [],
      })
      const task: Task = {
        id: toTaskId(created.id),
        projectId: toProjectId(created.projectId),
        sprintId: created.sprintId != null ? toSprintId(created.sprintId) : undefined,
        title: created.title,
        status: created.status,
        priority: created.priority,
        storyPoints: created.storyPoints ?? 0,
        assigneeId: created.assignee ? toUserId(created.assignee.id) : '',
        labels: created.labels ?? [],
      }
      set((state) => ({ tasks: [...state.tasks, task] }))
      return task
    } catch (err) {
      set({ syncError: apiErrorMessage(err, 'Failed to create task') })
      return null
    }
  },

  updateTaskStatus: (id, status) => {
    // Optimistic update with rollback on failure.
    const previous = get().tasks
    set({
      tasks: previous.map((t) => (t.id === id ? { ...t, status } : t)),
      syncError: null,
    })
    apiUpdateTaskStatus(parseId(id), status).catch((err) => {
      set({ tasks: previous, syncError: apiErrorMessage(err, 'Failed to update task') })
    })
  },

  // ---------------- Projects ----------------

  addProject: async (input) => {
    try {
      const created = await apiCreateProject({ name: input.name, description: input.description })
      const project: Project = {
        id: toProjectId(created.id),
        name: created.name,
        description: created.description ?? '',
        status: created.status,
        health: created.health,
        progress: created.progress,
        sprintNumber: created.sprintNumber,
        memberCount: created.memberCount,
      }
      set((state) => ({ projects: [...state.projects, project] }))
      return project
    } catch (err) {
      set({ syncError: apiErrorMessage(err, 'Failed to create project') })
      return null
    }
  },

  // ---------------- Sprints ----------------

  addSprint: async (input) => {
    try {
      const created = await apiCreateSprint({
        projectId: parseId(input.projectId),
        goal: input.goal,
        startDate: input.startDate,
        endDate: input.endDate,
        committedPoints: input.committedPoints,
      })
      const sprint: Sprint = {
        id: toSprintId(created.id),
        projectId: toProjectId(created.projectId),
        number: created.number,
        goal: created.goal,
        startDate: created.startDate,
        endDate: created.endDate,
        committedPoints: created.committedPoints,
        status: created.status,
      }
      set((state) => ({
        sprints: [...state.sprints, sprint],
        projects: state.projects.map((p) =>
          p.id === sprint.projectId ? { ...p, sprintNumber: sprint.number } : p,
        ),
      }))
      return sprint
    } catch (err) {
      set({ syncError: apiErrorMessage(err, 'Failed to create sprint') })
      return null
    }
  },

  setSprintStatus: (sprintId, status) => {
    const previous = get().sprints
    set({
      sprints: previous.map((s) => (s.id === sprintId ? { ...s, status } : s)),
      syncError: null,
    })
    apiUpdateSprintStatus(parseId(sprintId), status).catch((err) => {
      set({ sprints: previous, syncError: apiErrorMessage(err, 'Failed to update sprint') })
    })
  },

  // ---------------- Sticky notes (local until Phase 6) ----------------

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

  // ---------------- Members / teams (local) ----------------

  addMember: (input) => {
    const id = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `member-${Date.now()}`
    const newMember: Member = { id, name: input.name, initials: initialsOf(input.name), role: input.role, utilization: 0 }
    set((state) => ({ members: [...state.members, newMember] }))
    return newMember
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

  // ---------------- Wiki (local until Phase 3) ----------------

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

  // ---------------- Notifications (local until Phase 4) ----------------

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

  // ---------------- Settings (local until Phase 2) ----------------

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
    void get().loadWorkspace()
  },
}))
