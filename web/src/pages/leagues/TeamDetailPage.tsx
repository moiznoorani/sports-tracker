import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { teamService, type Team } from '../../services/teamService'
import { rosterService, type RosterPlayer } from '../../services/rosterService'
import { leagueService, type Member } from '../../services/leagueService'
import { GlassCard } from '../../components/ui/GlassCard'

export function TeamDetailPage() {
  const { leagueId, tournamentId, teamId } = useParams<{
    leagueId: string; tournamentId: string; teamId: string
  }>()
  const { user } = useAuth()

  const [team, setTeam] = useState<Team | null>(null)
  const [roster, setRoster] = useState<RosterPlayer[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  useEffect(() => {
    if (!teamId || !leagueId) return
    teamService.getTeam(teamId).then(setTeam)
    rosterService.getRoster(teamId).then(setRoster)
    leagueService.getMembers(leagueId).then(setMembers)
  }, [teamId, leagueId])

  async function reloadRoster() {
    if (!teamId) return
    const updated = await rosterService.getRoster(teamId)
    setRoster(updated)
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!teamId || !tournamentId || !selectedPlayerId) return
    setAssigning(true)
    setAssignError(null)
    try {
      await rosterService.assignPlayer(teamId, tournamentId, selectedPlayerId)
      setSelectedPlayerId('')
      await reloadRoster()
    } catch (e: unknown) {
      setAssignError(e instanceof Error ? e.message : 'Failed to assign player')
    } finally {
      setAssigning(false)
    }
  }

  async function handleRemove(id: string) {
    await rosterService.removePlayer(id)
    await reloadRoster()
  }

  async function handleSetCaptain(playerId: string) {
    if (!teamId) return
    await rosterService.setCaptain(teamId, playerId)
    setTeam(t => t ? { ...t, captain_id: playerId } : t)
  }

  const isOrganizer = members.some(m => m.user_id === user?.id && m.role === 'organizer')
  const assignedIds = new Set(roster.map(r => r.player_id))
  const unassigned = members.filter(m => m.role !== 'organizer' && !assignedIds.has(m.user_id))

  if (!team) return (
    <div className="flex items-center justify-center py-24">
      <div role="status" className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(123,63,133,0.4)', borderTopColor: '#7B3F85' }} />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-2">
        <Link to={`/leagues/${leagueId}/tournaments/${tournamentId}`}
          className="text-xs font-medium hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-subtle)' }}>
          ← Back to Tournament
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mt-4 mb-8"
        style={{ color: 'var(--text-primary)' }}>
        {team.name}
      </h1>

      <GlassCard padding="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--text-subtle)' }}>
          Roster · {roster.length}
        </h2>

        {roster.length === 0 ? (
          <p className="text-sm mb-3" style={{ color: 'var(--text-subtle)' }}>No players yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 mb-4">
            {roster.map(p => (
              <li key={p.id} className="flex items-center gap-3 py-2 px-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'rgba(123,63,133,0.2)', color: 'var(--accent-light)' }}>
                  {(p.display_name ?? '?')[0].toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {p.display_name ?? p.player_id}
                </span>
                {team.captain_id === p.player_id && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(123,63,133,0.25)', color: 'var(--accent-light)' }}>
                    Captain
                  </span>
                )}
                {isOrganizer && team.captain_id !== p.player_id && (
                  <button
                    type="button"
                    onClick={() => handleSetCaptain(p.player_id)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{ color: 'var(--accent-light)', background: 'rgba(123,63,133,0.1)' }}>
                    Set Captain
                  </button>
                )}
                {isOrganizer && (
                  <button
                    type="button"
                    aria-label={`Remove ${p.display_name ?? 'player'}`}
                    onClick={() => handleRemove(p.id)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                    style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {isOrganizer && unassigned.length > 0 && (
          <form onSubmit={handleAssign} className="flex gap-2 mt-2">
            <select
              aria-label="Add player"
              value={selectedPlayerId}
              onChange={e => setSelectedPlayerId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid var(--border-card)',
                color: 'var(--text-primary)',
              }}>
              <option value="">Select a player…</option>
              {unassigned.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.display_name ?? m.user_id}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={assigning || !selectedPlayerId}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7B3F85 0%, #9B5AA6 100%)', color: '#fff' }}>
              {assigning ? '…' : 'Add Player'}
            </button>
          </form>
        )}

        {isOrganizer && unassigned.length === 0 && roster.length > 0 && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
            All league members have been assigned to a team.
          </p>
        )}

        {assignError && (
          <p role="alert" className="text-sm mt-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
            {assignError}
          </p>
        )}
      </GlassCard>
    </div>
  )
}
