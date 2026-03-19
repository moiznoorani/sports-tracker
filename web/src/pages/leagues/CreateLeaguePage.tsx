import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { leagueService, type Sport, type Visibility } from '../../services/leagueService'

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
    <div>
      <h1>Create League</h1>
      {error && <div role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">League Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="sport">Sport</label>
          <select
            id="sport"
            value={sport}
            onChange={e => setSport(e.target.value as Sport)}
          >
            <option value="ultimate_frisbee">Ultimate Frisbee</option>
            <option value="basketball">Basketball</option>
          </select>
        </div>
        <div>
          <label htmlFor="visibility">Visibility</label>
          <select
            id="visibility"
            value={visibility}
            onChange={e => setVisibility(e.target.value as Visibility)}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
        <button type="submit" disabled={submitting}>Create</button>
      </form>
    </div>
  )
}
