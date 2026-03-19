import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ProfilePage } from '../pages/profile/ProfilePage'
import * as profileServiceModule from '../services/profileService'
import type { Session } from '@supabase/supabase-js'

vi.mock('../services/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}))

const mockProfileService = profileServiceModule.profileService as {
  getProfile: ReturnType<typeof vi.fn>
  updateProfile: ReturnType<typeof vi.fn>
  uploadAvatar: ReturnType<typeof vi.fn>
}

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

function renderProfile(ctx = makeAuthContext()) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockProfileService.getProfile.mockResolvedValue({
    id: 'user-123',
    display_name: 'Moiz',
    avatar_url: null,
    privacy_setting: 'private',
  })
  mockProfileService.updateProfile.mockResolvedValue(undefined)
  mockProfileService.uploadAvatar.mockResolvedValue('https://example.com/avatar.png')
})

describe('ProfilePage', () => {
  it('loads and displays existing display name', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Moiz')).toBeInTheDocument()
    })
  })

  it('loads and displays existing privacy setting', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Private')).toBeInTheDocument()
    })
  })

  it('calls updateProfile with new display name on save', async () => {
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Moiz'))

    await userEvent.clear(screen.getByLabelText(/display name/i))
    await userEvent.type(screen.getByLabelText(/display name/i), 'New Name')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user-123', {
        display_name: 'New Name',
        privacy_setting: 'private',
      })
    })
  })

  it('calls updateProfile with toggled privacy setting', async () => {
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Private'))

    await userEvent.selectOptions(screen.getByLabelText(/visibility/i), 'public')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user-123', {
        display_name: 'Moiz',
        privacy_setting: 'public',
      })
    })
  })

  it('shows saved confirmation after successful save', async () => {
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Moiz'))

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Saved')
    })
  })

  it('shows error message when save fails', async () => {
    mockProfileService.updateProfile.mockRejectedValue(new Error('Network error'))
    renderProfile()
    await waitFor(() => screen.getByDisplayValue('Moiz'))

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    })
  })

  it('shows upload photo button', async () => {
    renderProfile()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument()
    })
  })

  it('calls uploadAvatar when a file is selected', async () => {
    renderProfile()
    await waitFor(() => screen.getByLabelText(/upload profile photo/i))

    const file = new File(['img'], 'avatar.png', { type: 'image/png' })
    const input = screen.getByLabelText(/upload profile photo/i)
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockProfileService.uploadAvatar).toHaveBeenCalledWith('user-123', file)
    })
  })

  it('shows avatar image when avatar_url is set', async () => {
    mockProfileService.getProfile.mockResolvedValue({
      id: 'user-123',
      display_name: 'Moiz',
      avatar_url: 'https://example.com/avatar.png',
      privacy_setting: 'private',
    })
    renderProfile()
    await waitFor(() => {
      expect(screen.getByRole('img', { name: /profile photo/i })).toBeInTheDocument()
    })
  })

  it('privacy defaults to private for new profiles', async () => {
    mockProfileService.getProfile.mockResolvedValue({
      id: 'user-123',
      display_name: null,
      avatar_url: null,
      privacy_setting: 'private',
    })
    renderProfile()
    await waitFor(() => {
      expect(screen.getByDisplayValue('Private')).toBeInTheDocument()
    })
  })
})
