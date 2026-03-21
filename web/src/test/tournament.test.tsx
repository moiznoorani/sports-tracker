import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { LeagueDetailPage } from '../pages/leagues/LeagueDetailPage'
import { CreateTournamentPage } from '../pages/leagues/CreateTournamentPage'
import { TournamentDetailPage } from '../pages/leagues/TournamentDetailPage'
import type { Session } from '@supabase/supabase-js'

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

vi.mock('../services/tournamentService', () => ({
  tournamentService: {
    getTournaments: vi.fn(),
    getTournament: vi.fn(),
    createTournament: vi.fn(),
    updateTournament: vi.fn(),
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
})
