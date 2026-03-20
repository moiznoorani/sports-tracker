import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { BrowseLeaguesPage } from '../pages/leagues/BrowseLeaguesPage'
import type { Session } from '@supabase/supabase-js'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const currentUser = { id: 'user-1', email: 'me@example.com' } as Session['user']

function makeAuthContext(user = currentUser) {
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
    browseLeagues: vi.fn(),
    joinLeague: vi.fn(),
    getMyLeagues: vi.fn(),
  },
}))

async function getMockService() {
  const mod = await import('../services/leagueService')
  return mod.leagueService as {
    browseLeagues: ReturnType<typeof vi.fn>
    joinLeague: ReturnType<typeof vi.fn>
    getMyLeagues: ReturnType<typeof vi.fn>
  }
}

function renderPage(user = currentUser) {
  return render(
    <AuthContext.Provider value={makeAuthContext(user)}>
      <MemoryRouter>
        <BrowseLeaguesPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

const publicLeagues = [
  { id: 'lg-1', name: 'Tuesday Ultimate', sport: 'ultimate_frisbee' as const, visibility: 'public' as const, member_count: 12 },
  { id: 'lg-2', name: 'Sunday Hoops', sport: 'basketball' as const, visibility: 'public' as const, member_count: 8 },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BrowseLeaguesPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const svc = await getMockService()
    svc.browseLeagues.mockResolvedValue(publicLeagues)
    svc.getMyLeagues.mockResolvedValue([])
  })

  it('shows league names and sports', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Tuesday Ultimate')).toBeInTheDocument()
      expect(screen.getByText('Sunday Hoops')).toBeInTheDocument()
    })
    expect(screen.getByText('Ultimate Frisbee')).toBeInTheDocument()
    expect(screen.getByText('Basketball')).toBeInTheDocument()
  })

  it('shows member count for each league', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    expect(screen.getByText('12 members')).toBeInTheDocument()
    expect(screen.getByText('8 members')).toBeInTheDocument()
  })

  it('shows Join button for leagues the user has not joined', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    const joinButtons = screen.getAllByRole('button', { name: /join/i })
    expect(joinButtons).toHaveLength(2)
  })

  it('shows "Joined" badge and no Join button for leagues the user has already joined', async () => {
    const svc = await getMockService()
    svc.getMyLeagues.mockResolvedValue([
      { id: 'lg-1', name: 'Tuesday Ultimate', sport: 'ultimate_frisbee', visibility: 'public' },
    ])
    renderPage()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    expect(screen.getByText('Joined')).toBeInTheDocument()
    // Only Sunday Hoops should have a Join button
    const joinButtons = screen.getAllByRole('button', { name: /join/i })
    expect(joinButtons).toHaveLength(1)
  })

  it('calls joinLeague with correct id on click', async () => {
    const svc = await getMockService()
    svc.joinLeague.mockResolvedValue(undefined)
    renderPage()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    const user = userEvent.setup()
    const joinButtons = screen.getAllByRole('button', { name: /join/i })
    await user.click(joinButtons[0])
    expect(svc.joinLeague).toHaveBeenCalledWith('lg-1')
  })

  it('reloads my leagues after joining so badge updates', async () => {
    const svc = await getMockService()
    svc.joinLeague.mockResolvedValue(undefined)
    svc.getMyLeagues
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'lg-1', name: 'Tuesday Ultimate', sport: 'ultimate_frisbee', visibility: 'public' },
      ])
    renderPage()
    await waitFor(() => screen.getByText('Tuesday Ultimate'))
    const user = userEvent.setup()
    const joinButtons = screen.getAllByRole('button', { name: /join/i })
    await user.click(joinButtons[0])
    await waitFor(() => expect(screen.getByText('Joined')).toBeInTheDocument())
  })

  it('shows empty state when no public leagues exist', async () => {
    const svc = await getMockService()
    svc.browseLeagues.mockResolvedValue([])
    renderPage()
    await waitFor(() => screen.getByText(/no public leagues/i))
  })
})
