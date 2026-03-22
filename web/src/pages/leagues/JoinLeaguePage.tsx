import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leagueService } from '../../services/leagueService'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { ErrorBanner } from '../../components/ui/ErrorBanner'

export function JoinLeaguePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleJoin = async () => {
    if (!token) return
    setError(null)
    setSubmitting(true)
    try {
      await leagueService.joinByToken(token)
      navigate('/leagues', { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ background: 'var(--bg-deep)' }}>
      <GlassCard className="w-full max-w-sm text-center" padding="p-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(123,63,133,0.4), rgba(155,90,166,0.3))' }}
        >
          <span className="text-3xl">⬡</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Join League</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-subtle)' }}>
          You've been invited to join a league. Tap below to accept.
        </p>

        {error && <ErrorBanner message={error} size="xs" className="mb-4" />}

        <Button type="button" fullWidth loading={submitting} disabled={submitting} onClick={handleJoin}>
          Join League
        </Button>

        <button
          type="button"
          onClick={() => navigate('/leagues')}
          className="mt-3 text-sm w-full py-2 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-subtle)' }}
        >
          Not now
        </button>
      </GlassCard>
    </div>
  )
}
