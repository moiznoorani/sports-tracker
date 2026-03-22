import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GlassCard } from '../../components/ui/GlassCard'
import { GlassInput } from '../../components/ui/GlassInput'
import { Button } from '../../components/ui/Button'
import { ErrorBanner } from '../../components/ui/ErrorBanner'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await resetPassword(email)
    setSubmitting(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
        style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #111118 50%, #0D0D14 100%)' }}
      >
        <GlassCard className="w-full max-w-sm text-center" padding="p-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #7B3F85, #9B5AA6)', boxShadow: '0 8px 32px rgba(123,63,133,0.4)' }}
          >
            <span className="text-white text-2xl">✉</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-subtle)' }}>
            If an account exists for <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</span>, a reset link has been sent.
          </p>
          <Button variant="ghost" onClick={() => navigate('/auth/sign-in')}>Back to sign in</Button>
        </GlassCard>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #111118 50%, #0D0D14 100%)' }}
    >
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7B3F85, #9B5AA6)', boxShadow: '0 8px 32px rgba(123,63,133,0.4)' }}
        >
          <span className="text-white font-bold text-xl">ST</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Reset password</h1>
        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>We'll send you a link to get back in</p>
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

          {error && <ErrorBanner message={error} size="xs" />}

          <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
            Send reset link
          </Button>
        </form>
      </GlassCard>

      <p className="mt-6 text-sm" style={{ color: 'var(--text-subtle)' }}>
        <Link to="/auth/sign-in" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-light)' }}>
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
