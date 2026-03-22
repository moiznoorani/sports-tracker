import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { leagueService, type League, type Member } from '../../services/leagueService'
import { tournamentService, type Tournament } from '../../services/tournamentService'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { SPORT_LABELS } from '../../constants/labels'

export function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [league, setLeague] = useState<League | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadData = async (leagueId: string) => {
    try {
      const [l, m, t] = await Promise.all([
        leagueService.getLeague(leagueId),
        leagueService.getMembers(leagueId),
        tournamentService.getTournaments(leagueId),
      ])
      setLeague(l)
      setMembers(m)
      setTournaments(t)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    if (!id) return
    loadData(id)
  }, [id])

  const isOrganizer = members.some(m => m.user_id === user?.id && m.role === 'organizer')

  const handleRemove = async (userId: string) => {
    if (!id) return
    await leagueService.removeMember(id, userId)
    const updated = await leagueService.getMembers(id)
    setMembers(updated)
  }

  if (error) return (
    <div className="max-w-2xl mx-auto">
      <ErrorBanner message={error} />
    </div>
  )

  if (!league) return <LoadingSpinner />

  const inviteUrl = `${window.location.origin}/leagues/join/${league.invite_token}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    inputRef.current?.select()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-2">
        <Link to="/leagues" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--text-subtle)' }}>
          ← My Leagues
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-8 mt-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(123,63,133,0.4), rgba(155,90,166,0.3))' }}
        >
          <span className="text-2xl">⬡</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{league.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-subtle)' }}>
            {SPORT_LABELS[league.sport] ?? league.sport} · {league.visibility === 'private' ? 'Private' : 'Public'}
          </p>
        </div>
      </div>

      {/* Invite link */}
      <GlassCard padding="p-5" className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-subtle)' }}>Invite Link</h2>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            readOnly
            value={inviteUrl}
            aria-label="Invite link"
            className="flex-1 px-4 py-3 rounded-xl text-xs outline-none min-w-0"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid var(--border-card)',
              color: 'var(--text-subtle)',
              fontFamily: 'monospace',
            }}
          />
          <Button variant="glass" size="sm" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </Button>
        </div>
      </GlassCard>

      {/* Tournaments */}
      <GlassCard padding="p-5" className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>
            Tournaments · {tournaments.length}
          </h2>
          {isOrganizer && (
            <Link to={`/leagues/${id}/tournaments/new`} aria-label="Create Tournament">
              <Button size="sm" variant="glass">+ Create Tournament</Button>
            </Link>
          )}
        </div>
        {tournaments.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>No tournaments yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tournaments.map(t => (
              <li key={t.id}>
                <Link
                  to={`/leagues/${id}/tournaments/${t.id}`}
                  aria-label={t.name}
                  className="block group"
                >
                  <div className="flex items-center gap-3 py-2 px-1 rounded-xl transition-all hover:bg-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(123,63,133,0.15)', color: 'var(--accent-light)' }}>
                          {t.format === 'round_robin' ? 'Round Robin' : 'Single Elimination'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(123,63,133,0.15)', color: 'var(--accent-light)' }}>
                          {t.sport === 'ultimate_frisbee' ? 'Ultimate Frisbee' : 'Basketball'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={t.status === 'published'
                            ? { background: 'rgba(123,63,133,0.25)', color: 'var(--accent-light)' }
                            : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-subtle)' }}>
                          {t.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-subtle)' }} className="opacity-40 group-hover:opacity-70 transition-opacity">›</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {/* Members */}
      <GlassCard padding="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-subtle)' }}>
          Members · {members.length}
        </h2>
        <ul className="flex flex-col gap-2">
          {members.map(member => (
            <li key={member.user_id} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                style={{ background: 'rgba(123,63,133,0.2)', color: 'var(--accent-light)' }}
              >
                {(member.display_name ?? '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {member.display_name ?? 'Unknown'}
                </p>
                {member.role === 'organizer' && (
                  <span className="text-xs" style={{ color: 'var(--accent-light)' }}>Organizer</span>
                )}
              </div>
              {isOrganizer && member.role !== 'organizer' && (
                <button
                  type="button"
                  aria-label={`Remove ${member.display_name ?? 'member'}`}
                  onClick={() => handleRemove(member.user_id)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  )
}
