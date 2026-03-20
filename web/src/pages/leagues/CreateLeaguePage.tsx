import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { leagueService, type Sport, type Visibility } from '../../services/leagueService'
import { GlassCard } from '../../components/ui/GlassCard'
import { GlassInput } from '../../components/ui/GlassInput'
import { GlassSelect } from '../../components/ui/GlassSelect'
import { Button } from '../../components/ui/Button'

export function CreateLeaguePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [sport, setSport] = useState<Sport>('ultimate_frisbee')
  const [visibility, setVisibility] = useState<Visibility>('private')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await leagueService.createLeague({ name, sport, visibility })
      navigate('/leagues')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-2">
        <Link to="/leagues" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--text-subtle)' }}>
          ← My Leagues
        </Link>
      </div>

      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Create League</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-subtle)' }}>Set up a new league for your team</p>
      </div>

      <GlassCard padding="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <GlassInput
            id="name"
            label="League Name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Friday Night Frisbee"
            required
          />

          <GlassSelect
            id="sport"
            label="Sport"
            value={sport}
            onChange={e => setSport(e.target.value as Sport)}
            options={[
              { value: 'ultimate_frisbee', label: 'Ultimate Frisbee' },
              { value: 'basketball', label: 'Basketball' },
            ]}
          />

          <GlassSelect
            id="visibility"
            label="Visibility"
            value={visibility}
            onChange={e => setVisibility(e.target.value as Visibility)}
            options={[
              { value: 'private', label: 'Private — invite only' },
              { value: 'public', label: 'Public — anyone can find it' },
            ]}
          />

          {error && (
            <div role="alert" className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Link to="/leagues" className="flex-1">
              <Button variant="glass" fullWidth type="button">Cancel</Button>
            </Link>
            <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
              Create league
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
