import axios from 'axios'

const TOKEN_KEY = 'nexus-auth-token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------- API types (mirror backend DTOs) ----------

export type ApiTaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'TESTING' | 'DONE'
export type ApiTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type ApiSprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED'
export type ApiProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'
export type ApiProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK'
export type ApiUserRole = 'ADMIN' | 'MEMBER' | 'VIEWER' | 'DEVELOPER'

export interface ApiUser {
  id: number
  name: string
  email: string
  role: ApiUserRole
}

export interface ApiProject {
  id: number
  name: string
  description: string | null
  status: ApiProjectStatus
  health: ApiProjectHealth
  progress: number
  sprintNumber: number
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface ApiSprint {
  id: number
  projectId: number
  projectName: string
  number: number
  goal: string
  startDate: string
  endDate: string
  committedPoints: number
  status: ApiSprintStatus
  createdAt: string
  updatedAt: string
}

export interface ApiTask {
  id: number
  title: string
  description: string | null
  projectId: number
  projectName: string
  sprintId: number | null
  status: ApiTaskStatus
  priority: ApiTaskPriority
  storyPoints: number
  assignee: ApiUser | null
  labels: string[]
  createdAt: string
  updatedAt: string
}

export interface ApiAuthResponse {
  token: string
  refreshToken: string
  user: ApiUser
}

// ---------- Auth ----------

export async function apiLogin(email: string, password: string): Promise<ApiAuthResponse> {
  const { data } = await api.post<ApiAuthResponse>('/auth/login', { email, password })
  return data
}

export async function apiRegister(name: string, email: string, password: string): Promise<ApiAuthResponse> {
  const { data } = await api.post<ApiAuthResponse>('/auth/register', { name, email, password })
  return data
}

// ---------- Users ----------

export async function apiListUsers(): Promise<ApiUser[]> {
  const { data } = await api.get<ApiUser[]>('/users')
  return data
}

export async function apiUpdateMe(name: string): Promise<ApiUser> {
  const { data } = await api.patch<ApiUser>('/users/me', { name })
  return data
}

export async function apiUpdateUserRole(id: number, role: ApiUserRole): Promise<ApiUser> {
  const { data } = await api.patch<ApiUser>(`/users/${id}/role`, { role })
  return data
}

// ---------- Projects ----------

export async function apiListProjects(): Promise<ApiProject[]> {
  const { data } = await api.get<ApiProject[]>('/projects')
  return data
}

export interface ApiProjectInput {
  name: string
  description?: string | null
  status?: ApiProjectStatus
}

export async function apiCreateProject(input: ApiProjectInput): Promise<ApiProject> {
  const { data } = await api.post<ApiProject>('/projects', input)
  return data
}

// ---------- Sprints ----------

export async function apiListSprints(projectId?: number): Promise<ApiSprint[]> {
  const { data } = await api.get<ApiSprint[]>('/sprints', {
    params: projectId != null ? { projectId } : undefined,
  })
  return data
}

export interface ApiSprintInput {
  projectId: number
  goal: string
  startDate: string
  endDate: string
  committedPoints?: number
}

export async function apiCreateSprint(input: ApiSprintInput): Promise<ApiSprint> {
  const { data } = await api.post<ApiSprint>('/sprints', input)
  return data
}

export async function apiUpdateSprintStatus(id: number, status: ApiSprintStatus): Promise<ApiSprint> {
  const { data } = await api.patch<ApiSprint>(`/sprints/${id}/status`, { status })
  return data
}

// ---------- Tasks ----------

export async function apiListTasks(params?: { projectId?: number; sprintId?: number }): Promise<ApiTask[]> {
  const { data } = await api.get<ApiTask[]>('/tasks', { params })
  return data
}

export interface ApiTaskInput {
  title: string
  description?: string | null
  projectId: number
  sprintId?: number | null
  status: ApiTaskStatus
  priority: ApiTaskPriority
  storyPoints?: number
  assigneeId?: number | null
  labels?: string[]
}

export async function apiCreateTask(input: ApiTaskInput): Promise<ApiTask> {
  const { data } = await api.post<ApiTask>('/tasks', input)
  return data
}

export async function apiUpdateTaskStatus(id: number, status: ApiTaskStatus): Promise<ApiTask> {
  const { data } = await api.patch<ApiTask>(`/tasks/${id}/status`, { status })
  return data
}

// ---------- Wiki ----------

export interface ApiWikiPage {
  id: number
  title: string
  content: string
  author: string | null
  projectId: number | null
  projectName: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiWikiPageInput {
  title: string
  content: string
  projectId?: number | null
}

export async function apiListWikiPages(): Promise<ApiWikiPage[]> {
  const { data } = await api.get<ApiWikiPage[]>('/wiki')
  return data
}

export async function apiCreateWikiPage(input: ApiWikiPageInput): Promise<ApiWikiPage> {
  const { data } = await api.post<ApiWikiPage>('/wiki', input)
  return data
}

export async function apiUpdateWikiPage(id: number, input: ApiWikiPageInput): Promise<ApiWikiPage> {
  const { data } = await api.patch<ApiWikiPage>(`/wiki/${id}`, input)
  return data
}

export async function apiDeleteWikiPage(id: number): Promise<void> {
  await api.delete(`/wiki/${id}`)
}

/** Extract a human-readable message from an axios/network error. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    return data?.message || data?.error || err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}
