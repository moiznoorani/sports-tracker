import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { tournamentService, type Tournament } from '../../services/tournamentService'
import { teamService, type Team } from '../../services/teamService'
import { leagueService, type Member } from '../../services/leagueService'
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
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (!tournamentId || !leagueId) return
    tournamentService.getTournament(tournamentId)
      .then(setTournament)
      .catch((e: Error) => setError(e.message))
    leagueService.getMembers(leagueId)
      .then(setMembers)
      .catch(() => {/* non-fatal */})
    teamService.getTeams(tournamentId)
      .then(setTeams)
      .catch(() => {/* non-fatal */})
  }, [tournamentId, leagueId])

  async function reloadTeams() {
    if (!tournamentId) return
    const updated = await teamService.getTeams(tournamentId)
    setTeams(updated)
  }

  async function handlePublish() {
    if (!tournament) return
    setPublishing(true)
    setError(null)
    try {
      const updated = await tournamentService.publishTournament(tournament.id)
      setTournament(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!tournamentId || !newTeamName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      await teamService.createTeam(tournamentId, newTeamName.trim())
      setNewTeamName('')
      await reloadTeams()
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create team')
    } finally {
      setCreating(false)
    }
  }

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
  const isOrganizer = members.some(m => m.user_id === user?.id && m.role === 'organizer')

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

      {isCreator && tournament.status === 'draft' && (
        <div className="mt-4">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full py-4 rounded-2xl font-semibold text-base transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7B3F85 0%, #9B5AA6 100%)', color: '#fff' }}
          >
            {publishing ? 'Publishing…' : 'Publish Tournament'}
          </button>
        </div>
      )}

      <GlassCard padding="p-5" className="mt-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-subtle)' }}>
          Teams · {teams.length}
        </h2>

        {teams.length === 0 ? (
          <p className="text-sm mb-3" style={{ color: 'var(--text-subtle)' }}>No teams yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 mb-3">
            {teams.map(t => (
              <li key={t.id}>
                <Link
                  to={`/leagues/${leagueId}/tournaments/${tournamentId}/teams/${t.id}`}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg group hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-primary)' }}>
                  <span className="text-sm">{t.name}</span>
                  <span style={{ color: 'var(--text-subtle)' }} className="opacity-40 group-hover:opacity-70">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isOrganizer && tournament.status === 'published' && (
          <form onSubmit={handleCreateTeam} className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Team name"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid var(--border-card)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={creating || !newTeamName.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7B3F85 0%, #9B5AA6 100%)', color: '#fff' }}
            >
              {creating ? '…' : 'Add Team'}
            </button>
          </form>
        )}

        {createError && (
          <p role="alert" className="text-sm mt-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
            {createError}
          </p>
        )}
      </GlassCard>
    </div>
  )
}
