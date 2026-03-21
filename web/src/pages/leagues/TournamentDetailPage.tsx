import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { tournamentService, type Tournament } from '../../services/tournamentService'
import { GlassCard } from '../../components/ui/GlassCard'

const FORMAT_LABELS: Record<string, string> = {
  round_robin: 'Round Robin',
  single_elimination: 'Single Elimination',
}

const SPORT_LABELS: Record<string, string> = {
  ultimate_frisbee: 'Ultimate Frisbee',
  basketball: 'Basketball',
}

export function TournamentDetailPage() {
  const { id: leagueId, tournamentId } = useParams<{ id: string; tournamentId: string }>()
  const { user } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tournamentId) return
    tournamentService.getTournament(tournamentId)
      .then(setTournament)
      .catch((e: Error) => setError(e.message))
  }, [tournamentId])

  if (error) return (
    <div className="max-w-2xl mx-auto">
      <p role="alert" className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{error}</p>
    </div>
  )

  if (!tournament) return (
    <div className="flex items-center justify-center py-24">
      <div role="status" className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(123,63,133,0.4)', borderTopColor: '#7B3F85' }} />
    </div>
  )

  const isCreator = tournament.created_by === user?.id

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-2">
        <Link to={`/leagues/${leagueId}`} className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--text-subtle)' }}>
          ← Back to League
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tournament.name}
        </h1>
        {isCreator && (
          <Link to={`/leagues/${leagueId}/tournaments/${tournament.id}/edit`} aria-label="Edit tournament">
            <span className="text-sm font-medium px-4 py-2 rounded-xl transition-opacity hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-subtle)', border: '0.5px solid var(--border-card)' }}>
              Edit
            </span>
          </Link>
        )}
      </div>

      <GlassCard padding="p-6">
        <dl className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Format</dt>
            <dd>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(123,63,133,0.15)', color: 'var(--accent-light)' }}>
                {FORMAT_LABELS[tournament.format] ?? tournament.format}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Sport</dt>
            <dd>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(123,63,133,0.15)', color: 'var(--accent-light)' }}>
                {SPORT_LABELS[tournament.sport] ?? tournament.sport}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Status</dt>
            <dd>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={tournament.status === 'published'
                  ? { background: 'rgba(123,63,133,0.25)', color: 'var(--accent-light)' }
                  : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-subtle)' }}>
                {tournament.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>Dates</dt>
            <dd className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {tournament.start_date} – {tournament.end_date}
            </dd>
          </div>
        </dl>
      </GlassCard>
    </div>
  )
}
