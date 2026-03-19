import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { SignUpPage } from '../pages/auth/SignUpPage'
import { SignInPage } from '../pages/auth/SignInPage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { UpdatePasswordPage } from '../pages/auth/UpdatePasswordPage'
import { ProtectedRoute } from '../routes/ProtectedRoute'
import type { Session, User } from '@supabase/supabase-js'

// Minimal mock context helpers
function makeAuthContext(overrides = {}) {
  return {
    session: null,
    user: null,
    loading: false,
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPassword: vi.fn().mockResolvedValue({ error: null }),
    updatePassword: vi.fn().mockResolvedValue({ error: null }),
    ...overrides,
  }
}

function renderWithAuth(ui: React.ReactNode, ctx = makeAuthContext(), initialPath = '/') {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[initialPath]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

// ── Sign Up ──────────────────────────────────────────────────────────────────

describe('SignUpPage', () => {
  it('calls signUp with email and password on submit', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(<SignUpPage />, ctx)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(ctx.signUp).toHaveBeenCalledWith('user@example.com', 'password123')
    })
  })

  it('shows confirmation message after successful sign up', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(<SignUpPage />, ctx)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('shows error message when signUp fails', async () => {
    const ctx = makeAuthContext({
      signUp: vi.fn().mockResolvedValue({ error: { message: 'Email already registered' } }),
    })
    renderWithAuth(<SignUpPage />, ctx)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already registered')
    })
  })
})

// ── Sign In ──────────────────────────────────────────────────────────────────

describe('SignInPage', () => {
  it('calls signIn with email and password on submit', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(
      <Routes>
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>,
      ctx,
      '/auth/sign-in'
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(ctx.signIn).toHaveBeenCalledWith('user@example.com', 'password123')
    })
  })

  it('shows error message when signIn fails', async () => {
    const ctx = makeAuthContext({
      signIn: vi.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } }),
    })
    renderWithAuth(
      <Routes>
        <Route path="/auth/sign-in" element={<SignInPage />} />
      </Routes>,
      ctx,
      '/auth/sign-in'
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    })
  })

  it('navigates to home after successful sign in', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(
      <Routes>
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>,
      ctx,
      '/auth/sign-in'
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })
})

// ── Reset Password ───────────────────────────────────────────────────────────

describe('ResetPasswordPage', () => {
  it('calls resetPassword with email on submit', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(<ResetPasswordPage />, ctx)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(ctx.resetPassword).toHaveBeenCalledWith('user@example.com')
    })
  })

  it('shows confirmation message after reset email is sent', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(<ResetPasswordPage />, ctx)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('shows error message when resetPassword fails', async () => {
    const ctx = makeAuthContext({
      resetPassword: vi.fn().mockResolvedValue({ error: { message: 'Too many requests' } }),
    })
    renderWithAuth(<ResetPasswordPage />, ctx)

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Too many requests')
    })
  })
})

// ── Update Password ──────────────────────────────────────────────────────────

describe('UpdatePasswordPage', () => {
  it('calls updatePassword with new password on submit', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(
      <Routes>
        <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>,
      ctx,
      '/auth/update-password'
    )

    await userEvent.type(screen.getByLabelText(/new password/i), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(ctx.updatePassword).toHaveBeenCalledWith('newpassword123')
    })
  })

  it('navigates to home after successful password update', async () => {
    const ctx = makeAuthContext()
    renderWithAuth(
      <Routes>
        <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>,
      ctx,
      '/auth/update-password'
    )

    await userEvent.type(screen.getByLabelText(/new password/i), 'newpassword123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })
})

// ── Protected Route ──────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to sign-in', () => {
    const ctx = makeAuthContext({ session: null, loading: false })
    render(
      <AuthContext.Provider value={ctx}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/auth/sign-in" element={<div>Sign In Page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(screen.getByText('Sign In Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children for authenticated users', () => {
    const fakeSession = { user: { id: '123' } } as Session
    const ctx = makeAuthContext({ session: fakeSession, loading: false })
    render(
      <AuthContext.Provider value={ctx}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/auth/sign-in" element={<div>Sign In Page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(screen.getByText('Protected')).toBeInTheDocument()
  })

  it('renders nothing while auth is loading', () => {
    const ctx = makeAuthContext({ session: null, loading: true })
    const { container } = render(
      <AuthContext.Provider value={ctx}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(container).toBeEmptyDOMElement()
  })
})
