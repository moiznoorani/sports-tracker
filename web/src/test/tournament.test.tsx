import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { LeagueDetailPage } from '../pages/leagues/LeagueDetailPage'
import { CreateTournamentPage } from '../pages/leagues/CreateTournamentPage'
import { TournamentDetailPage } from '../pages/leagues/TournamentDetailPage'
import type { Session } from '@supabase/supabase-js'
import type { Team } from '../services/teamService'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const organizerUser = { id: 'user-org', email: 'org@example.com' } as Session['user']

function makeAuthContext(user = organizerUser) {
  return {
    session: { user } as Session,
    user,
    loading: false,
    signUp: vi.fn(), signIn: vi.fn(), signInWithGoogle: vi.fn(),
    signOut: vi.fn(), resetPassword: vi.fn(), updatePassword: vi.fn(),
  }
}

vi.mock('../services/leagueService', () => ({
  leagueService: {
    getLeague: vi.fn(),
    getMembers: vi.fn(),
    removeMember: vi.fn(),
  },
}))

vi.mock('../services/teamService', () => ({
  teamService: {
    getTeams: vi.fn(),
    createTeam: vi.fn(),
  },
}))

vi.mock('../services/tournamentService', () => ({
  tournamentService: {
    getTournaments: vi.fn(),
    getTournament: vi.fn(),
    createTournament: vi.fn(),
    updateTournament: vi.fn(),
    publishTournament: vi.fn(),
  },
}))

async function getLeagueMock() {
  const mod = await import('../services/leagueService')
  return mod.leagueService as {
    getLeague: ReturnType<typeof vi.fn>
    getMembers: ReturnType<typeof vi.fn>
    removeMember: ReturnType<typeof vi.fn>
  }
}

async function getTournamentMock() {
  const mod = await import('../services/tournamentService')
  return mod.tournamentService as {
    getTournaments: ReturnType<typeof vi.fn>
    getTournament: ReturnType<typeof vi.fn>
    createTournament: ReturnType<typeof vi.fn>
    updateTournament: ReturnType<typeof vi.fn>
    publishTournament: ReturnType<typeof vi.fn>
  }
}

async function getTeamMock() {
  const mod = await import('../services/teamService')
  return mod.teamService as {
    getTeams: ReturnType<typeof vi.fn>
    createTeam: ReturnType<typeof vi.fn>
  }
}

const fakeLeague = {
  id: 'lg-1', name: 'Tuesday Ultimate', sport: 'ultimate_frisbee' as const,
  visibility: 'private' as const, invite_token: 'tok-abc',
}

const fakeTournaments = [
  {
    id: 'tm-1', league_id: 'lg-1', name: 'Spring Open', format: 'round_robin' as const,
    sport: 'ultimate_frisbee' as const, start_date: '2026-04-01', end_date: '2026-04-02',
    status: 'draft' as const, created_by: 'user-org',
  },
]

const publishedTournament = {
  ...fakeTournaments[0],
  status: 'published' as const,
}

const fakeTeams: Team[] = [
  { id: 'team-1', tournament_id: 'tm-1', name: 'Alpha', created_by: 'user-org', created_at: '2026-04-01T00:00:00Z' },
  { id: 'team-2', tournament_id: 'tm-1', name: 'Beta',  created_by: 'user-org', created_at: '2026-04-01T00:01:00Z' },
]

function renderLeagueDetail(user = organizerUser) {
  return render(
    <AuthContext.Provider value={makeAuthContext(user)}>
      <MemoryRouter initialEntries={['/leagues/lg-1']}>
        <Routes>
          <Route path="/leagues/:id" element={<LeagueDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

function renderCreateTournament() {
  return render(
    <AuthContext.Provider value={makeAuthContext()}>
      <MemoryRouter initialEntries={['/leagues/lg-1/tournaments/new']}>
        <Routes>
          <Route path="/leagues/:id/tournaments/new" element={<CreateTournamentPage />} />
          <Route path="/leagues/:id" element={<div>League Detail</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

function renderTournamentDetail() {
  return render(
    <AuthContext.Provider value={makeAuthContext()}>
      <MemoryRouter initialEntries={['/leagues/lg-1/tournaments/tm-1']}>
        <Routes>
          <Route path="/leagues/:id/tournaments/:tournamentId" element={<TournamentDetailPage />} />
          <Route path="/leagues/:id" element={<div>League Detail</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LeagueDetailPage — tournaments section', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const lsvc = await getLeagueMock()
    lsvc.getLeague.mockResolvedValue(fakeLeague)
    lsvc.getMembers.mockResolvedValue([
      { user_id: 'user-org', role: 'organizer', display_name: 'Alice', avatar_url: null },
    ])
    const tsvc = await getTournamentMock()
    tsvc.getTournaments.mockResolvedValue([])
  })

  it('shows a tournaments section heading', async () => {
    renderLeagueDetail()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    expect(screen.getByRole('heading', { name: /tournaments/i })).toBeInTheDocument()
  })

  it('shows existing tournament names', async () => {
    const tsvc = await getTournamentMock()
    tsvc.getTournaments.mockResolvedValue(fakeTournaments)
    renderLeagueDetail()
    await waitFor(() => screen.getByText('Spring Open'))
  })

  it('shows format and sport tags on tournament rows', async () => {
    const tsvc = await getTournamentMock()
    tsvc.getTournaments.mockResolvedValue(fakeTournaments)
    renderLeagueDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByText('Round Robin')).toBeInTheDocument()
    expect(screen.getAllByText(/ultimate frisbee/i).length).toBeGreaterThan(0)
  })

  it('shows Draft status tag for unpublished tournaments', async () => {
    const tsvc = await getTournamentMock()
    tsvc.getTournaments.mockResolvedValue(fakeTournaments)
    renderLeagueDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('shows Create Tournament link for organizer', async () => {
    renderLeagueDetail()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    expect(screen.getByRole('link', { name: /create tournament/i })).toBeInTheDocument()
  })

  it('does not show Create Tournament link for non-organizer', async () => {
    const lsvc = await getLeagueMock()
    lsvc.getMembers.mockResolvedValue([
      { user_id: 'user-other', role: 'member', display_name: 'Bob', avatar_url: null },
    ])
    renderLeagueDetail()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    expect(screen.queryByRole('link', { name: /create tournament/i })).not.toBeInTheDocument()
  })
})

describe('CreateTournamentPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const tsvc = await getTournamentMock()
    tsvc.createTournament.mockResolvedValue({ ...fakeTournaments[0] })
  })

  it('renders name, format, sport, and date inputs', async () => {
    renderCreateTournament()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/format/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sport/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('calls createTournament with correct params on submit', async () => {
    const tsvc = await getTournamentMock()
    const user = userEvent.setup()
    renderCreateTournament()

    await user.type(screen.getByLabelText(/name/i), 'Summer Classic')
    await user.selectOptions(screen.getByLabelText(/format/i), 'round_robin')
    await user.selectOptions(screen.getByLabelText(/sport/i), 'ultimate_frisbee')
    await user.type(screen.getByLabelText(/start date/i), '2026-06-01')
    await user.type(screen.getByLabelText(/end date/i), '2026-06-02')
    await user.click(screen.getByRole('button', { name: /create tournament/i }))

    await waitFor(() => expect(tsvc.createTournament).toHaveBeenCalledWith({
      leagueId: 'lg-1',
      name: 'Summer Classic',
      format: 'round_robin',
      sport: 'ultimate_frisbee',
      startDate: '2026-06-01',
      endDate: '2026-06-02',
    }))
  })

  it('navigates back to league detail on success', async () => {
    const user = userEvent.setup()
    renderCreateTournament()

    await user.type(screen.getByLabelText(/name/i), 'Summer Classic')
    await user.selectOptions(screen.getByLabelText(/format/i), 'round_robin')
    await user.selectOptions(screen.getByLabelText(/sport/i), 'ultimate_frisbee')
    await user.type(screen.getByLabelText(/start date/i), '2026-06-01')
    await user.type(screen.getByLabelText(/end date/i), '2026-06-02')
    await user.click(screen.getByRole('button', { name: /create tournament/i }))

    await waitFor(() => screen.getByText('League Detail'))
  })

  it('shows error message on failure', async () => {
    const tsvc = await getTournamentMock()
    tsvc.createTournament.mockRejectedValue(new Error('Not an organizer'))
    const user = userEvent.setup()
    renderCreateTournament()

    await user.type(screen.getByLabelText(/name/i), 'Bad')
    await user.selectOptions(screen.getByLabelText(/format/i), 'round_robin')
    await user.selectOptions(screen.getByLabelText(/sport/i), 'ultimate_frisbee')
    await user.type(screen.getByLabelText(/start date/i), '2026-06-01')
    await user.type(screen.getByLabelText(/end date/i), '2026-06-02')
    await user.click(screen.getByRole('button', { name: /create tournament/i }))

    await waitFor(() => screen.getByRole('alert'))
    expect(screen.getByText(/not an organizer/i)).toBeInTheDocument()
  })
})

describe('TournamentDetailPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const tsvc = await getTournamentMock()
    tsvc.getTournament.mockResolvedValue(fakeTournaments[0])
    tsvc.publishTournament.mockResolvedValue({ ...fakeTournaments[0], status: 'published' })
    const lsvc = await getLeagueMock()
    lsvc.getMembers.mockResolvedValue([
      { user_id: 'user-org', role: 'organizer', display_name: 'Alice', avatar_url: null },
    ])
    const teamsvc = await getTeamMock()
    teamsvc.getTeams.mockResolvedValue([])
    teamsvc.createTeam.mockResolvedValue(fakeTeams[0])
  })

  it('shows tournament name, format, sport, and dates', async () => {
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByText('Round Robin')).toBeInTheDocument()
    expect(screen.getByText(/ultimate frisbee/i)).toBeInTheDocument()
    expect(screen.getByText(/2026-04-01/)).toBeInTheDocument()
    expect(screen.getByText(/2026-04-02/)).toBeInTheDocument()
  })

  it('shows Draft status tag', async () => {
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('shows edit link for tournament creator', async () => {
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
  })

  it('shows Publish button for creator of a draft tournament', async () => {
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByRole('button', { name: /publish tournament/i })).toBeInTheDocument()
  })

  it('does not show Publish button for non-creator', async () => {
    const nonCreator = { id: 'user-other', email: 'other@example.com' } as Session['user']
    render(
      <AuthContext.Provider value={makeAuthContext(nonCreator)}>
        <MemoryRouter initialEntries={['/leagues/lg-1/tournaments/tm-1']}>
          <Routes>
            <Route path="/leagues/:id/tournaments/:tournamentId" element={<TournamentDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.queryByRole('button', { name: /publish tournament/i })).not.toBeInTheDocument()
  })

  it('does not show Publish button when tournament is already published', async () => {
    const tsvc = await getTournamentMock()
    tsvc.getTournament.mockResolvedValue({ ...fakeTournaments[0], status: 'published' })
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.queryByRole('button', { name: /publish tournament/i })).not.toBeInTheDocument()
  })

  it('calls publishTournament with correct id on click', async () => {
    const tsvc = await getTournamentMock()
    const user = userEvent.setup()
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    await user.click(screen.getByRole('button', { name: /publish tournament/i }))
    await waitFor(() => expect(tsvc.publishTournament).toHaveBeenCalledWith('tm-1'))
  })

  it('updates status tag to Published after successful publish', async () => {
    const user = userEvent.setup()
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    await user.click(screen.getByRole('button', { name: /publish tournament/i }))
    await waitFor(() => expect(screen.getByText('Published')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /publish tournament/i })).not.toBeInTheDocument()
  })

  it('shows error alert when publish fails', async () => {
    const tsvc = await getTournamentMock()
    tsvc.publishTournament.mockRejectedValue(new Error('Not authorized'))
    const user = userEvent.setup()
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    await user.click(screen.getByRole('button', { name: /publish tournament/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument()
  })
})

// ── Teams section ──────────────────────────────────────────────────────────────

describe('TournamentDetailPage — teams section', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const lsvc = await getLeagueMock()
    lsvc.getMembers.mockResolvedValue([
      { user_id: 'user-org', role: 'organizer', display_name: 'Alice', avatar_url: null },
    ])
    const tsvc = await getTournamentMock()
    tsvc.getTournament.mockResolvedValue(publishedTournament)
    tsvc.publishTournament.mockResolvedValue(publishedTournament)
    const teamsvc = await getTeamMock()
    teamsvc.getTeams.mockResolvedValue([])
    teamsvc.createTeam.mockResolvedValue(fakeTeams[0])
  })

  // Slice 1: teams list loads and renders names
  it('shows teams heading', async () => {
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByRole('heading', { name: /teams/i })).toBeInTheDocument()
  })

  it('shows existing team names', async () => {
    const teamsvc = await getTeamMock()
    teamsvc.getTeams.mockResolvedValue(fakeTeams)
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Alpha'))
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  // Slice 2: create form visibility
  it('shows Add Team form for organizer of a published tournament', async () => {
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.getByPlaceholderText(/team name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add team/i })).toBeInTheDocument()
  })

  it('does not show Add Team form for a non-organizer', async () => {
    const lsvc = await getLeagueMock()
    lsvc.getMembers.mockResolvedValue([
      { user_id: 'user-other', role: 'member', display_name: 'Bob', avatar_url: null },
    ])
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.queryByPlaceholderText(/team name/i)).not.toBeInTheDocument()
  })

  it('does not show Add Team form for a draft tournament', async () => {
    const tsvc = await getTournamentMock()
    tsvc.getTournament.mockResolvedValue(fakeTournaments[0]) // draft
    renderTournamentDetail()
    await waitFor(() => screen.getByText('Spring Open'))
    expect(screen.queryByPlaceholderText(/team name/i)).not.toBeInTheDocument()
  })

  // Slice 3: submit creates team and reloads
  it('calls createTeam with correct params on submit', async () => {
    const teamsvc = await getTeamMock()
    const user = userEvent.setup()
    renderTournamentDetail()
    await waitFor(() => screen.getByPlaceholderText(/team name/i))
    await user.type(screen.getByPlaceholderText(/team name/i), 'Gamma')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    await waitFor(() => expect(teamsvc.createTeam).toHaveBeenCalledWith('tm-1', 'Gamma'))
  })

  it('clears input and reloads teams after successful create', async () => {
    const teamsvc = await getTeamMock()
    teamsvc.getTeams
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([fakeTeams[0]])
    const user = userEvent.setup()
    renderTournamentDetail()
    await waitFor(() => screen.getByPlaceholderText(/team name/i))
    await user.type(screen.getByPlaceholderText(/team name/i), 'Alpha')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    await waitFor(() => screen.getByText('Alpha'))
    expect((screen.getByPlaceholderText(/team name/i) as HTMLInputElement).value).toBe('')
  })

  // Slice 4: error handling
  it('shows error alert when createTeam fails', async () => {
    const teamsvc = await getTeamMock()
    teamsvc.createTeam.mockRejectedValue(new Error('Duplicate team name'))
    const user = userEvent.setup()
    renderTournamentDetail()
    await waitFor(() => screen.getByPlaceholderText(/team name/i))
    await user.type(screen.getByPlaceholderText(/team name/i), 'Alpha')
    await user.click(screen.getByRole('button', { name: /add team/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText(/duplicate team name/i)).toBeInTheDocument()
  })
})
