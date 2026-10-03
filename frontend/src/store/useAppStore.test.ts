import { describe, expect, it } from 'vitest'
import { useAppStore } from './useAppStore'

/**
 * The store was split into slices; this pins the wiring.
 *
 * ActionKeys is derived from the store's own type, so adding or removing an
 * action in AppState without updating `actions` below is a compile error, and
 * a slice that silently fails to make it into the composed store is a test
 * failure. Together they catch the mistake a slice split invites: forgetting
 * to spread one creator.
 */
type State = ReturnType<typeof useAppStore.getState>
type ActionKeys = {
  [K in keyof State]-?: State[K] extends (...args: never[]) => unknown ? K : never
}[keyof State]

const actions: Record<ActionKeys, true> = {
  // auth / sync
  login: true,
  logout: true,
  bootstrapFromStoredToken: true,
  applyCurrentUser: true,
  loadWorkspace: true,
  // tasks
  addTask: true,
  updateTaskStatus: true,
  updateTask: true,
  deleteTask: true,
  // projects
  addProject: true,
  updateProject: true,
  deleteProject: true,
  // sprints
  addSprint: true,
  setSprintStatus: true,
  updateSprint: true,
  deleteSprint: true,
  // members
  removeMember: true,
  // whiteboard
  loadStickyNotes: true,
  connectWhiteboard: true,
  disconnectWhiteboard: true,
  addStickyNote: true,
  updateStickyNoteText: true,
  saveStickyNoteText: true,
  moveStickyNote: true,
  saveStickyNotePosition: true,
  deleteStickyNote: true,
  applyWhiteboardEvent: true,
  // teams
  addMember: true,
  addTeam: true,
  deleteTeam: true,
  addMemberToTeam: true,
  removeMemberFromTeam: true,
  assignProjectToTeam: true,
  unassignProjectFromTeam: true,
  // wiki
  loadWikiPages: true,
  addWikiPage: true,
  updateWikiPage: true,
  deleteWikiPage: true,
  // notifications
  loadNotifications: true,
  markNotificationRead: true,
  archiveNotification: true,
  markAllNotificationsRead: true,
  // settings / profile
  updateSettings: true,
  saveProfile: true,
  changeUserRole: true,
  toggleMutedCategory: true,
  resetWorkspace: true,
}

describe('useAppStore', () => {
  it('exposes every declared action', () => {
    const state = useAppStore.getState() as unknown as Record<string, unknown>
    for (const key of Object.keys(actions)) {
      expect(typeof state[key], `action "${key}" is missing`).toBe('function')
    }
  })

  it('starts with the seeded data and a signed-out session', () => {
    // Values each slice owns, so a slice losing its initial state (or never
    // being spread into the composed store) shows up here.
    const state = useAppStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isBootstrapped).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.syncError).toBeNull()
    expect(state.userRole).toBe('MEMBER')
    expect(state.whiteboardConnected).toBe(false)
    expect(state.projects).toEqual([])
    expect(state.tasks).toEqual([])
    expect(state.sprints).toEqual([])
    expect(state.members).toEqual([])
    expect(state.stickyNotes).toEqual([])
    expect(state.notifications).toEqual([])
    expect(state.wikiPages).toEqual([])
    expect(state.teams.map((t) => t.id)).toEqual(['core-engineering'])
    expect(state.settings).toEqual({
      displayName: '',
      role: '',
      defaultAssigneeId: '',
      mutedCategories: [],
    })
  })

  it('updates one settings field without clobbering the others', () => {
    useAppStore.setState({
      settings: {
        displayName: 'Devendra',
        role: 'ADMIN',
        defaultAssigneeId: '',
        mutedCategories: ['AI'],
      },
    })
    useAppStore.getState().updateSettings({ displayName: 'Devendra N' })
    const settings = useAppStore.getState().settings
    expect(settings.displayName).toBe('Devendra N')
    expect(settings.role).toBe('ADMIN')
    expect(settings.mutedCategories).toEqual(['AI'])
  })
})
