import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GlassCard } from '../../components/ui/GlassCard'
import { GlassInput } from '../../components/ui/GlassInput'
import { Button } from '../../components/ui/Button'

export function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) { setError(error.message); return }
    navigate(from, { replace: true })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{
        background: 'linear-gradient(160deg, #0A0A0F 0%, #111118 50%, #0D0D14 100%)',
      }}
    >
      {/* Logo mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7B3F85, #9B5AA6)',
            boxShadow: '0 8px 32px rgba(123,63,133,0.4)',
          }}
        >
          <span className="text-white font-bold text-xl">ST</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Sports Tracker
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>Sign in to your account</p>
      </div>

      <GlassCard className="w-full max-w-sm" padding="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <GlassInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <GlassInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <p role="alert" className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
            Sign in
          </Button>

          <Link
            to="/auth/reset-password"
            className="text-center text-xs transition-colors hover:opacity-80"
            style={{ color: 'var(--text-subtle)' }}
          >
            Forgot password?
          </Link>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
        </div>

        <Button variant="glass" fullWidth onClick={() => signInWithGoogle()}>
          <GoogleIcon />
          Sign in with Google
        </Button>
      </GlassCard>

      <p className="mt-6 text-sm" style={{ color: 'var(--text-subtle)' }}>
        No account?{' '}
        <Link to="/auth/sign-up" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-light)' }}>
          Create one
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
