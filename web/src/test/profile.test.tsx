import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ProfilePage } from '../pages/profile/ProfilePage'
import type { Session } from '@supabase/supabase-js'

// ── Shared fixtures ───────────────────────────────────────────────────────────

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

// ── profileService mock setup ─────────────────────────────────────────────────

vi.mock('../services/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}))

async function getMockService() {
  const mod = await import('../services/profileService')
  return mod.profileService as {
    getProfile: ReturnType<typeof vi.fn>
    updateProfile: ReturnType<typeof vi.fn>
    uploadAvatar: ReturnType<typeof vi.fn>
  }
}

function renderProfile(ctx = makeAuthContext()) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// ── ProfilePage ───────────────────────────────────────────────────────────────

describe('ProfilePage', () => {
  beforeEach(() => vi.clearAllMocks())

  beforeEach(async () => {
    const mock = await getMockService()
    mock.getProfile.mockResolvedValue({
      id: 'user-123',
      display_name: 'Moiz',
      avatar_url: null,
      privacy_setting: 'private',
    })
    mock.updateProfile.mockResolvedValue(undefined)
    mock.uploadAvatar.mockResolvedValue('https://example.com/avatar.png')
  })

  // Slice 2: loads and shows display name
  it('shows the existing display name after loading', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Moiz')).toBeInTheDocument()
    })
  })

  // Slice 3: save calls updateProfile with new display name
  it('calls updateProfile with the new display name on save', async () => {
    const mock = await getMockService()
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Moiz'))

    await userEvent.clear(screen.getByLabelText(/display name/i))
    await userEvent.type(screen.getByLabelText(/display name/i), 'New Name')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(mock.updateProfile).toHaveBeenCalledWith('user-123', expect.objectContaining({ display_name: 'New Name' }))
    })
  })

  // Slice 4: privacy defaults to private
  it('shows privacy as Private by default', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Private')).toBeInTheDocument()
    })
  })

  // Slice 5: user can toggle privacy to public
  it('calls updateProfile with public when privacy toggled', async () => {
    const mock = await getMockService()
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Private'))

    await userEvent.selectOptions(screen.getByLabelText(/visibility/i), 'public')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(mock.updateProfile).toHaveBeenCalledWith('user-123', expect.objectContaining({ privacy_setting: 'public' }))
    })
  })

  // Slice 6: saved confirmation
  it('shows Saved confirmation after successful save', async () => {
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Moiz'))
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Saved')
    })
  })

  // Slice 7: error on save failure
  it('shows error message when save fails', async () => {
    const mock = await getMockService()
    mock.updateProfile.mockRejectedValue(new Error('Network error'))
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Moiz'))
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })
  })

  // Slice 8: avatar upload
  it('calls uploadAvatar when a photo file is selected', async () => {
    const mock = await getMockService()
    renderProfile()
    await waitFor(() => screen.getByLabelText(/upload profile photo/i))

    const file = new File(['img'], 'avatar.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText(/upload profile photo/i), file)

    await waitFor(() => {
      expect(mock.uploadAvatar).toHaveBeenCalledWith('user-123', file)
    })
  })
})
