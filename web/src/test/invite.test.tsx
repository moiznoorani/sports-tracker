import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { LeagueDetailPage } from '../pages/leagues/LeagueDetailPage'
import { JoinLeaguePage } from '../pages/leagues/JoinLeaguePage'
import { LeaguesPage } from '../pages/leagues/LeaguesPage'
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
    getLeague: vi.fn(),
    joinByToken: vi.fn(),
  },
}))

async function getMockService() {
  const mod = await import('../services/leagueService')
  return mod.leagueService as {
    getMyLeagues: ReturnType<typeof vi.fn>
    createLeague: ReturnType<typeof vi.fn>
    getLeague: ReturnType<typeof vi.fn>
    joinByToken: ReturnType<typeof vi.fn>
  }
}

const fakeLeague = {
  id: 'league-1',
  name: 'Tuesday Ultimate',
  sport: 'ultimate_frisbee' as const,
  visibility: 'private' as const,
  invite_token: 'abc-token-123',
}

function renderDetail(leagueId = 'league-1', ctx = makeAuthContext()) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[`/leagues/${leagueId}`]}>
        <Routes>
          <Route path="/leagues/:id" element={<LeagueDetailPage />} />
          <Route path="/leagues" element={<LeaguesPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

function renderJoin(token = 'abc-token-123', ctx = makeAuthContext()) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[`/leagues/join/${token}`]}>
        <Routes>
          <Route path="/leagues/join/:token" element={<JoinLeaguePage />} />
          <Route path="/leagues" element={<LeaguesPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// ── LeagueDetailPage ──────────────────────────────────────────────────────────

describe('LeagueDetailPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const mock = await getMockService()
    mock.getLeague.mockResolvedValue(fakeLeague)
    mock.getMyLeagues.mockResolvedValue([])
  })

  it('shows the league name', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('Tuesday Ultimate')).toBeInTheDocument()
    })
  })

  it('shows the invite link containing the token', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByDisplayValue(/abc-token-123/)).toBeInTheDocument()
    })
  })

  it('has a copy button for the invite link', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })
  })

  it('shows an error when loading fails', async () => {
    const mock = await getMockService()
    mock.getLeague.mockRejectedValue(new Error('Not found'))
    renderDetail()
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Not found')
    })
  })
})

// ── JoinLeaguePage ────────────────────────────────────────────────────────────

describe('JoinLeaguePage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const mock = await getMockService()
    mock.joinByToken.mockResolvedValue(undefined)
    mock.getMyLeagues.mockResolvedValue([])
  })

  it('shows a join button with the token from the URL', async () => {
    renderJoin('abc-token-123')
    expect(screen.getByRole('button', { name: /join league/i })).toBeInTheDocument()
  })

  it('calls joinByToken with the token from the URL on click', async () => {
    const mock = await getMockService()
    renderJoin('abc-token-123')
    await userEvent.click(screen.getByRole('button', { name: /join league/i }))
    await waitFor(() => {
      expect(mock.joinByToken).toHaveBeenCalledWith('abc-token-123')
    })
  })

  it('navigates to /leagues after successfully joining', async () => {
    const mock = await getMockService()
    mock.getMyLeagues.mockResolvedValue([
      { id: 'league-1', name: 'Tuesday Ultimate', sport: 'ultimate_frisbee', visibility: 'private' },
    ])
    renderJoin('abc-token-123')
    await userEvent.click(screen.getByRole('button', { name: /join league/i }))
    await waitFor(() => {
      expect(screen.getByText('Tuesday Ultimate')).toBeInTheDocument()
    })
  })

  it('shows an error for an invalid token', async () => {
    const mock = await getMockService()
    mock.joinByToken.mockRejectedValue(new Error('Invalid invite token'))
    renderJoin('bad-token')
    await userEvent.click(screen.getByRole('button', { name: /join league/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid invite token')
    })
  })

  it('shows an error when already a member', async () => {
    const mock = await getMockService()
    mock.joinByToken.mockRejectedValue(new Error('Already a member of this league'))
    renderJoin('abc-token-123')
    await userEvent.click(screen.getByRole('button', { name: /join league/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Already a member of this league')
    })
  })
})
