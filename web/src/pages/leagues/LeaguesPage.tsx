import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { leagueService, type League } from '../../services/leagueService'

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

  if (loading) return <div role="status">Loading…</div>

  return (
    <div>
      <h1>My Leagues</h1>
      <Link to="/leagues/new">Create League</Link>
      {error && <div role="alert">{error}</div>}
      {!error && leagues.length === 0 && <p>No leagues yet. Create one to get started.</p>}
      <ul>
        {leagues.map(league => (
          <li key={league.id}>
            <Link to={`/leagues/${league.id}`}>{league.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
