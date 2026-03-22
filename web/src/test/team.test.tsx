import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { TeamDetailPage } from '../pages/leagues/TeamDetailPage'
import type { Session } from '@supabase/supabase-js'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const organizerUser = { id: 'user-org', email: 'org@example.com' } as Session['user']
const memberUser = { id: 'user-p1', email: 'p1@example.com' } as Session['user']

function makeAuthContext(user = organizerUser) {
  return {
    session: { user } as Session,
    user,
    loading: false,
    signUp: vi.fn(), signIn: vi.fn(), signInWithGoogle: vi.fn(),
    signOut: vi.fn(), resetPassword: vi.fn(), updatePassword: vi.fn(),
  }
}

vi.mock('../services/teamService', () => ({
  teamService: {
    getTeams: vi.fn(),
    getTeam: vi.fn(),
    createTeam: vi.fn(),
  },
}))

vi.mock('../services/rosterService', () => ({
  rosterService: {
    getRoster: vi.fn(),
    assignPlayer: vi.fn(),
    removePlayer: vi.fn(),
    setCaptain: vi.fn(),
  },
}))

vi.mock('../services/leagueService', () => ({
  leagueService: {
    getLeague: vi.fn(),
    getMembers: vi.fn(),
    removeMember: vi.fn(),
  },
}))

async function getTeamMock() {
  const mod = await import('../services/teamService')
  return mod.teamService as {
    getTeams: ReturnType<typeof vi.fn>
    getTeam: ReturnType<typeof vi.fn>
    createTeam: ReturnType<typeof vi.fn>
  }
}

async function getRosterMock() {
  const mod = await import('../services/rosterService')
  return mod.rosterService as {
    getRoster: ReturnType<typeof vi.fn>
    assignPlayer: ReturnType<typeof vi.fn>
    removePlayer: ReturnType<typeof vi.fn>
    setCaptain: ReturnType<typeof vi.fn>
  }
}

async function getLeagueMock() {
  const mod = await import('../services/leagueService')
  return mod.leagueService as {
    getLeague: ReturnType<typeof vi.fn>
    getMembers: ReturnType<typeof vi.fn>
    removeMember: ReturnType<typeof vi.fn>
  }
}

const fakeTeam = {
  id: 'team-1', tournament_id: 'tm-1', name: 'Alpha',
  captain_id: null as string | null, created_by: 'user-org', created_at: '2026-04-01T00:00:00Z',
}

const fakeRoster = [
  { id: 're-1', team_id: 'team-1', tournament_id: 'tm-1', player_id: 'user-p1', joined_at: '2026-04-01', display_name: 'Alice', avatar_url: null },
  { id: 're-2', team_id: 'team-1', tournament_id: 'tm-1', player_id: 'user-p2', joined_at: '2026-04-01', display_name: 'Bob',   avatar_url: null },
]

const leagueMembers = [
  { user_id: 'user-org', role: 'organizer', display_name: 'Organizer', avatar_url: null },
  { user_id: 'user-p1',  role: 'member',    display_name: 'Alice',     avatar_url: null },
  { user_id: 'user-p2',  role: 'member',    display_name: 'Bob',       avatar_url: null },
  { user_id: 'user-p3',  role: 'member',    display_name: 'Charlie',   avatar_url: null },
]

function renderTeamDetail(user = organizerUser) {
  return render(
    <AuthContext.Provider value={makeAuthContext(user)}>
      <MemoryRouter initialEntries={['/leagues/lg-1/tournaments/tm-1/teams/team-1']}>
        <Routes>
          <Route path="/leagues/:leagueId/tournaments/:tournamentId/teams/:teamId"
                 element={<TeamDetailPage />} />
          <Route path="/leagues/:leagueId/tournaments/:tournamentId"
                 element={<div>Tournament Detail</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TeamDetailPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const teamSvc = await getTeamMock()
    teamSvc.getTeam.mockResolvedValue(fakeTeam)
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster.mockResolvedValue([])
    rosterSvc.assignPlayer.mockResolvedValue(fakeRoster[0])
    rosterSvc.removePlayer.mockResolvedValue(undefined)
    rosterSvc.setCaptain.mockResolvedValue(undefined)
    const leagueSvc = await getLeagueMock()
    leagueSvc.getMembers.mockResolvedValue(leagueMembers)
  })

  // Slice 1: roster list renders
  it('shows team name heading', async () => {
    renderTeamDetail()
    await waitFor(() => screen.getByText('Alpha'))
    expect(screen.getByRole('heading', { name: /alpha/i })).toBeInTheDocument()
  })

  it('shows assigned players display names', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster.mockResolvedValue(fakeRoster)
    renderTeamDetail()
    await waitFor(() => screen.getByText('Alice'))
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  // Slice 2: assign player form visibility
  it('shows Add Player form for organizer', async () => {
    renderTeamDetail()
    await waitFor(() => screen.getByText('Alpha'))
    expect(screen.getByRole('combobox', { name: /add player/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add player/i })).toBeInTheDocument()
  })

  it('does not show Add Player form for non-organizer', async () => {
    renderTeamDetail(memberUser)
    await waitFor(() => screen.getByText('Alpha'))
    expect(screen.queryByRole('button', { name: /add player/i })).not.toBeInTheDocument()
  })

  it('lists only unassigned league members in the dropdown', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster.mockResolvedValue(fakeRoster) // Alice + Bob assigned
    renderTeamDetail()
    await waitFor(() => screen.getByText('Alpha'))
    // Charlie is unassigned, Alice and Bob are already on the team
    const select = screen.getByRole('combobox', { name: /add player/i }) as HTMLSelectElement
    const options = Array.from(select.options).map(o => o.text)
    expect(options).toContain('Charlie')
    expect(options).not.toContain('Alice')
    expect(options).not.toContain('Bob')
  })

  // Slice 3: assign player calls service and reloads
  it('calls assignPlayer with correct params on submit', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster.mockResolvedValue([]) // Charlie is unassigned
    const leagueSvc = await getLeagueMock()
    leagueSvc.getMembers.mockResolvedValue([
      { user_id: 'user-org', role: 'organizer', display_name: 'Organizer', avatar_url: null },
      { user_id: 'user-p3', role: 'member', display_name: 'Charlie', avatar_url: null },
    ])
    const user = userEvent.setup()
    renderTeamDetail()
    await waitFor(() => screen.getByRole('combobox', { name: /add player/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /add player/i }), 'user-p3')
    await user.click(screen.getByRole('button', { name: /add player/i }))
    await waitFor(() =>
      expect(rosterSvc.assignPlayer).toHaveBeenCalledWith('team-1', 'tm-1', 'user-p3')
    )
  })

  it('reloads roster after successful assign', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([fakeRoster[0]])
    const leagueSvc = await getLeagueMock()
    leagueSvc.getMembers.mockResolvedValue([
      { user_id: 'user-org', role: 'organizer', display_name: 'Organizer', avatar_url: null },
      { user_id: 'user-p1', role: 'member', display_name: 'Alice', avatar_url: null },
    ])
    const user = userEvent.setup()
    renderTeamDetail()
    await waitFor(() => screen.getByRole('combobox', { name: /add player/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /add player/i }), 'user-p1')
    await user.click(screen.getByRole('button', { name: /add player/i }))
    await waitFor(() => screen.getByText('Alice'))
  })

  // Slice 4: duplicate assignment error
  it('shows error alert when assignPlayer fails', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.assignPlayer.mockRejectedValue(new Error('Player already on a team'))
    const leagueSvc = await getLeagueMock()
    leagueSvc.getMembers.mockResolvedValue([
      { user_id: 'user-org', role: 'organizer', display_name: 'Organizer', avatar_url: null },
      { user_id: 'user-p3', role: 'member', display_name: 'Charlie', avatar_url: null },
    ])
    const user = userEvent.setup()
    renderTeamDetail()
    await waitFor(() => screen.getByRole('combobox', { name: /add player/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /add player/i }), 'user-p3')
    await user.click(screen.getByRole('button', { name: /add player/i }))
    await waitFor(() => screen.getByRole('alert'))
    expect(screen.getByText(/player already on a team/i)).toBeInTheDocument()
  })

  // Slice 5: set captain
  it('shows Set Captain button per player for organizer', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster.mockResolvedValue(fakeRoster)
    renderTeamDetail()
    await waitFor(() => screen.getByText('Alice'))
    expect(screen.getAllByRole('button', { name: /set captain/i }).length).toBeGreaterThan(0)
  })

  it('calls setCaptain with correct params', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster.mockResolvedValue(fakeRoster)
    const user = userEvent.setup()
    renderTeamDetail()
    await waitFor(() => screen.getAllByRole('button', { name: /set captain/i }))
    await user.click(screen.getAllByRole('button', { name: /set captain/i })[0])
    await waitFor(() =>
      expect(rosterSvc.setCaptain).toHaveBeenCalledWith('team-1', 'user-p1')
    )
  })

  it('shows Captain badge after setCaptain succeeds', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster.mockResolvedValue(fakeRoster)
    const user = userEvent.setup()
    renderTeamDetail()
    await waitFor(() => screen.getAllByRole('button', { name: /set captain/i }))
    await user.click(screen.getAllByRole('button', { name: /set captain/i })[0])
    await waitFor(() => screen.getByText('Captain'))
  })

  // Remove player
  it('calls removePlayer and reloads roster', async () => {
    const rosterSvc = await getRosterMock()
    rosterSvc.getRoster
      .mockResolvedValueOnce(fakeRoster)
      .mockResolvedValueOnce([fakeRoster[1]])
    const user = userEvent.setup()
    renderTeamDetail()
    await waitFor(() => screen.getAllByRole('button', { name: /remove/i }))
    await user.click(screen.getAllByRole('button', { name: /remove/i })[0])
    await waitFor(() => expect(rosterSvc.removePlayer).toHaveBeenCalledWith('re-1'))
  })
})
