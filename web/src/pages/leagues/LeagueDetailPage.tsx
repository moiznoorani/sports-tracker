import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { leagueService, type League } from '../../services/leagueService'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'

const SPORT_LABELS: Record<string, string> = {
  ultimate_frisbee: 'Ultimate Frisbee',
  basketball: 'Basketball',
}

export function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [league, setLeague] = useState<League | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    leagueService.getLeague(id)
      .then(setLeague)
      .catch(e => setError(e.message))
  }, [id])

  if (error) return (
    <div className="max-w-2xl mx-auto">
      <p role="alert" className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{error}</p>
    </div>
  )

  if (!league) return (
    <div className="flex items-center justify-center py-24">
      <div
        role="status"
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(123,63,133,0.4)', borderTopColor: '#7B3F85' }}
      />
    </div>
  )

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

      <GlassCard padding="p-5">
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
        <p className="text-xs mt-3" style={{ color: 'var(--text-subtle)' }}>
          Share this link to invite players to join your league.
        </p>
      </GlassCard>
    </div>
  )
}
