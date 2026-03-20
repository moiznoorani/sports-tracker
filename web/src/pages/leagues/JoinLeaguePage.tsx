import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { leagueService } from '../../services/leagueService'

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
    <div>
      <h1>Join League</h1>
      {error && <p role="alert">{error}</p>}
      <button type="button" onClick={handleJoin} disabled={submitting}>
        {submitting ? 'Joining…' : 'Join League'}
      </button>
    </div>
  )
}
