import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { LeagueDetailPage } from '../pages/leagues/LeagueDetailPage'
import type { Session } from '@supabase/supabase-js'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const organizerUser = { id: 'user-organizer', email: 'org@example.com' } as Session['user']
const memberUser = { id: 'user-member', email: 'mem@example.com' } as Session['user']

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
  },
}))

async function getMockService() {
  const mod = await import('../services/leagueService')
  return mod.leagueService as {
    getLeague: ReturnType<typeof vi.fn>
    getMembers: ReturnType<typeof vi.fn>
    removeMember: ReturnType<typeof vi.fn>
  }
}

const defaultLeague = {
  id: 'league-1',
  name: 'Tuesday Ultimate',
  sport: 'ultimate_frisbee',
  visibility: 'private',
  invite_token: 'tok-abc',
}

const defaultMembers = [
  { user_id: 'user-organizer', role: 'organizer', display_name: 'Alice', avatar_url: null },
  { user_id: 'user-member', role: 'member', display_name: 'Bob', avatar_url: null },
]

function renderDetail(user = organizerUser) {
  return render(
    <AuthContext.Provider value={makeAuthContext(user)}>
      <MemoryRouter initialEntries={['/leagues/league-1']}>
        <Routes>
          <Route path="/leagues/:id" element={<LeagueDetailPage />} />
          <Route path="/leagues" element={<div>Leagues</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// ── Members list ──────────────────────────────────────────────────────────────

describe('LeagueDetailPage — Members', () => {
  beforeEach(() => vi.clearAllMocks())

  beforeEach(async () => {
    const mock = await getMockService()
    mock.getLeague.mockResolvedValue(defaultLeague)
    mock.getMembers.mockResolvedValue(defaultMembers)
    mock.removeMember.mockResolvedValue(undefined)
    const tmod = await import('../services/tournamentService')
    ;(tmod.tournamentService.getTournaments as ReturnType<typeof vi.fn>).mockResolvedValue([])
  })

  it('shows member display names', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  it('shows Organizer badge for the organizer', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('Organizer')).toBeInTheDocument()
    })
  })

  it('shows remove button for non-organizer members when current user is organizer', async () => {
    renderDetail(organizerUser)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove bob/i })).toBeInTheDocument()
    })
  })

  it('does not show a remove button for the organizer row itself', async () => {
    renderDetail(organizerUser)
    await waitFor(() => screen.getByText('Alice'))
    expect(screen.queryByRole('button', { name: /remove alice/i })).not.toBeInTheDocument()
  })

  it('does not show remove buttons when current user is a regular member', async () => {
    renderDetail(memberUser)
    await waitFor(() => screen.getByText('Bob'))
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('calls removeMember with league id and user id when remove is clicked', async () => {
    const mock = await getMockService()
    renderDetail(organizerUser)
    await waitFor(() => screen.getByRole('button', { name: /remove bob/i }))
    await userEvent.click(screen.getByRole('button', { name: /remove bob/i }))
    await waitFor(() => {
      expect(mock.removeMember).toHaveBeenCalledWith('league-1', 'user-member')
    })
  })

  it('reloads members after a successful removal', async () => {
    const mock = await getMockService()
    mock.getMembers.mockResolvedValueOnce(defaultMembers).mockResolvedValueOnce([
      { user_id: 'user-organizer', role: 'organizer', display_name: 'Alice', avatar_url: null },
    ])
    renderDetail(organizerUser)
    await waitFor(() => screen.getByRole('button', { name: /remove bob/i }))
    await userEvent.click(screen.getByRole('button', { name: /remove bob/i }))
    await waitFor(() => {
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })
  })
})
