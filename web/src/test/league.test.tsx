import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { LeaguesPage } from '../pages/leagues/LeaguesPage'
import { CreateLeaguePage } from '../pages/leagues/CreateLeaguePage'
import type { Session } from '@supabase/supabase-js'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const fakeUser = { id: 'user-123', email: 'user@example.com' } as Session['user']

function makeAuthContext(overrides = {}) {
  return {
    session: { user: fakeUser } as Session,
    user: fakeUser,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    ...overrides,
  }
}

vi.mock('../services/leagueService', () => ({
  leagueService: {
    getMyLeagues: vi.fn(),
    createLeague: vi.fn(),
  },
}))

async function getMockService() {
  const mod = await import('../services/leagueService')
  return mod.leagueService as {
    getMyLeagues: ReturnType<typeof vi.fn>
    createLeague: ReturnType<typeof vi.fn>
  }
}

function renderLeagues(ctx = makeAuthContext()) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={['/leagues']}>
        <Routes>
          <Route path="/leagues" element={<LeaguesPage />} />
          <Route path="/leagues/new" element={<CreateLeaguePage />} />
          <Route path="/leagues/:id" element={<div>League Detail</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

function renderCreateLeague(ctx = makeAuthContext()) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={['/leagues/new']}>
        <Routes>
          <Route path="/leagues" element={<LeaguesPage />} />
          <Route path="/leagues/new" element={<CreateLeaguePage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// ── LeaguesPage ───────────────────────────────────────────────────────────────

describe('LeaguesPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows a loading state initially', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockResolvedValue([])
    renderLeagues()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when user has no leagues', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockResolvedValue([])
    renderLeagues()
    await waitFor(() => {
      expect(screen.getByText(/no leagues yet/i)).toBeInTheDocument()
    })
  })

  it('lists leagues the user is a member of', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockResolvedValue([
      { id: 'league-1', name: 'Tuesday Ultimate', sport: 'ultimate_frisbee', visibility: 'public' },
      { id: 'league-2', name: 'Weekend Hoops', sport: 'basketball', visibility: 'private' },
    ])
    renderLeagues()
    await waitFor(() => {
      expect(screen.getByText('Tuesday Ultimate')).toBeInTheDocument()
      expect(screen.getByText('Weekend Hoops')).toBeInTheDocument()
    })
  })

  it('shows an error message when loading fails', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockRejectedValue(new Error('Network error'))
    renderLeagues()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })
  })

  it('league names link to the detail page', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockResolvedValue([
      { id: 'league-1', name: 'Tuesday Ultimate', sport: 'ultimate_frisbee', visibility: 'public' },
    ])
    renderLeagues()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Tuesday Ultimate' })).toHaveAttribute('href', '/leagues/league-1')
    })
  })

  it('has a link to create a new league', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockResolvedValue([])
    renderLeagues()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /create league/i })).toBeInTheDocument()
    })
  })
})

// ── CreateLeaguePage ──────────────────────────────────────────────────────────

describe('CreateLeaguePage', () => {
  beforeEach(() => vi.clearAllMocks())

  beforeEach(async () => {
    const mock = await getMockService()
    mock.createLeague.mockResolvedValue({ id: 'new-league' })
    mock.getMyLeagues.mockResolvedValue([])
  })

  it('renders name, sport, and visibility fields', () => {
    renderCreateLeague()
    expect(screen.getByLabelText(/league name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sport/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/visibility/i)).toBeInTheDocument()
  })

  it('calls createLeague with name, sport, and visibility on submit', async () => {
    const mock = await getMockService()
    renderCreateLeague()

    await userEvent.type(screen.getByLabelText(/league name/i), 'Friday Frisbee')
    await userEvent.selectOptions(screen.getByLabelText(/sport/i), 'ultimate_frisbee')
    await userEvent.selectOptions(screen.getByLabelText(/visibility/i), 'public')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mock.createLeague).toHaveBeenCalledWith({
        name: 'Friday Frisbee',
        sport: 'ultimate_frisbee',
        visibility: 'public',
      })
    })
  })

  it('defaults visibility to private', () => {
    renderCreateLeague()
    expect(screen.getByLabelText<HTMLSelectElement>(/visibility/i).value).toBe('private')
  })

  it('shows an error when createLeague fails', async () => {
    const mock = await getMockService()
    mock.createLeague.mockRejectedValue(new Error('Already exists'))
    renderCreateLeague()

    await userEvent.type(screen.getByLabelText(/league name/i), 'Bad League')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Already exists')
    })
  })

  it('navigates to /leagues after successful creation', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockResolvedValue([
      { id: 'new-league', name: 'Friday Frisbee', sport: 'ultimate_frisbee', visibility: 'public' },
    ])
    renderCreateLeague()

    await userEvent.type(screen.getByLabelText(/league name/i), 'Friday Frisbee')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(screen.getByText('Friday Frisbee')).toBeInTheDocument()
    })
  })
})
