import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { tournamentService, type TournamentFormat } from '../../services/tournamentService'
import type { Sport } from '../../services/leagueService'
import { GlassCard } from '../../components/ui/GlassCard'
import { GlassInput } from '../../components/ui/GlassInput'
import { GlassSelect } from '../../components/ui/GlassSelect'
import { Button } from '../../components/ui/Button'

const FORMAT_OPTIONS = [
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'single_elimination', label: 'Single Elimination' },
]

const SPORT_OPTIONS = [
  { value: 'ultimate_frisbee', label: 'Ultimate Frisbee' },
  { value: 'basketball', label: 'Basketball' },
]

export function CreateTournamentPage() {
  const { id: leagueId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [format, setFormat] = useState<TournamentFormat>('round_robin')
  const [sport, setSport] = useState<Sport>('ultimate_frisbee')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leagueId) return
    setLoading(true)
    setError(null)
    try {
      await tournamentService.createTournament({ leagueId, name, format, sport, startDate, endDate })
      navigate(`/leagues/${leagueId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-2">
        <Link to={`/leagues/${leagueId}`} className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--text-subtle)' }}>
          ← Back to League
        </Link>
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-8 mt-4" style={{ color: 'var(--text-primary)' }}>
        Create Tournament
      </h1>

      <GlassCard padding="p-6">
        {error && (
          <div role="alert" className="text-sm px-4 py-3 rounded-xl mb-5" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <GlassInput
            id="name"
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Spring Open"
            required
          />

          <GlassSelect
            id="format"
            label="Format"
            value={format}
            options={FORMAT_OPTIONS}
            onChange={e => setFormat(e.target.value as TournamentFormat)}
          />

          <GlassSelect
            id="sport"
            label="Sport"
            value={sport}
            options={SPORT_OPTIONS}
            onChange={e => setSport(e.target.value as Sport)}
          />

          <GlassInput
            id="start_date"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />

          <GlassInput
            id="end_date"
            label="End Date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} className="mt-2">
            Create Tournament
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}
