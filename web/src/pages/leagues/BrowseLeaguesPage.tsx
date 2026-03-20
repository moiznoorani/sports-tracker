import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { leagueService, type PublicLeague, type League } from '../../services/leagueService'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'

const SPORT_LABELS: Record<string, string> = {
  ultimate_frisbee: 'Ultimate Frisbee',
  basketball: 'Basketball',
}

export function BrowseLeaguesPage() {
  const navigate = useNavigate()
  const [leagues, setLeagues] = useState<PublicLeague[]>([])
  const [myLeagueIds, setMyLeagueIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const [all, mine] = await Promise.all([
        leagueService.browseLeagues(),
        leagueService.getMyLeagues(),
      ])
      setLeagues(all)
      setMyLeagueIds(new Set((mine as League[]).map(l => l.id)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load leagues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleJoin(leagueId: string) {
    setJoining(leagueId)
    setError(null)
    try {
      await leagueService.joinLeague(leagueId)
      const mine = await leagueService.getMyLeagues()
      setMyLeagueIds(new Set((mine as League[]).map(l => l.id)))
      navigate(`/leagues/${leagueId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to join league')
    } finally {
      setJoining(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div
        role="status"
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(123,63,133,0.4)', borderTopColor: '#7B3F85' }}
      />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Browse Leagues</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-subtle)' }}>
          {`${leagues.length} public league${leagues.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {error && (
        <div role="alert" className="text-sm px-4 py-3 rounded-xl mb-4" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {leagues.length === 0 && (
        <GlassCard padding="p-10" className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(123,63,133,0.15)' }}
          >
            <span className="text-3xl">⬡</span>
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No public leagues</p>
          <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
            Public leagues created by organizers will appear here.
          </p>
        </GlassCard>
      )}

      <ul className="flex flex-col gap-3">
        {leagues.map(league => {
          const isMember = myLeagueIds.has(league.id)
          return (
            <li key={league.id}>
              <GlassCard padding="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(123,63,133,0.18)' }}
                  >
                    <span className="text-base">⬡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{league.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(123,63,133,0.15)', color: 'var(--accent-light)' }}
                      >
                        {SPORT_LABELS[league.sport] ?? league.sport}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                        {league.member_count} member{league.member_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  {isMember ? (
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(155,90,166,0.2)', color: 'var(--accent-light)' }}
                    >
                      Joined
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="glass"
                      loading={joining === league.id}
                      onClick={() => handleJoin(league.id)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </GlassCard>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
