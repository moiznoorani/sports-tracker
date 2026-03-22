import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { leagueService, type League } from '../../services/leagueService'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { SPORT_LABELS } from '../../constants/labels'

export function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    leagueService.getMyLeagues()
      .then(setLeagues)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Leagues</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-subtle)' }}>
            {leagues.length === 0 ? 'Get started by creating one' : `${leagues.length} league${leagues.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link to="/leagues/new" aria-label="Create League">
          <Button size="sm">+ Create League</Button>
        </Link>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}

      {!error && leagues.length === 0 && (
        <GlassCard padding="p-10" className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(123,63,133,0.15)' }}
          >
            <span className="text-3xl">⬡</span>
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No leagues yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-subtle)' }}>Create a league to start organizing games.</p>
          <Link to="/leagues/new">
            <Button>Create your first league</Button>
          </Link>
        </GlassCard>
      )}

      <ul className="flex flex-col gap-3">
        {leagues.map(league => (
          <li key={league.id}>
            <Link to={`/leagues/${league.id}`} aria-label={league.name} className="block group">
              <GlassCard
                padding="p-4"
                className="transition-all duration-150 hover:border-purple-700/40"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(123,63,133,0.18)' }}
                  >
                    <span className="text-base">⬡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{league.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                      {SPORT_LABELS[league.sport] ?? league.sport} · {league.visibility === 'private' ? 'Private' : 'Public'}
                    </p>
                  </div>
                  <span className="text-lg opacity-40 group-hover:opacity-70 transition-opacity" style={{ color: 'var(--text-subtle)' }}>›</span>
                </div>
              </GlassCard>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
