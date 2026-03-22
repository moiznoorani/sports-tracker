import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GlassCard } from '../../components/ui/GlassCard'
import { GlassInput } from '../../components/ui/GlassInput'
import { Button } from '../../components/ui/Button'
import { ErrorBanner } from '../../components/ui/ErrorBanner'

export function UpdatePasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) { setError(error.message); return }
    navigate('/', { replace: true })
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
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Set new password</h1>
        <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>Choose something strong</p>
      </div>

      <GlassCard className="w-full max-w-sm" padding="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <GlassInput
            id="password"
            label="New Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
            minLength={6}
            autoComplete="new-password"
          />

          {error && <ErrorBanner message={error} size="xs" />}

          <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
            Update password
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}
