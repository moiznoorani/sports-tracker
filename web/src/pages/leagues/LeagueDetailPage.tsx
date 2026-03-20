import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { leagueService, type League } from '../../services/leagueService'

export function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [league, setLeague] = useState<League | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    leagueService.getLeague(id)
      .then(setLeague)
      .catch(e => setError(e.message))
  }, [id])

  if (error) return <p role="alert">{error}</p>
  if (!league) return <p role="status">Loading…</p>

  const inviteUrl = `${window.location.origin}/leagues/join/${league.invite_token}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    inputRef.current?.select()
  }

  return (
    <div>
      <h1>{league.name}</h1>
      <p>{league.sport === 'ultimate_frisbee' ? 'Ultimate Frisbee' : 'Basketball'}</p>
      <p>{league.visibility === 'private' ? 'Private' : 'Public'}</p>

      <section>
        <h2>Invite Link</h2>
        <input ref={inputRef} readOnly value={inviteUrl} aria-label="Invite link" />
        <button type="button" onClick={handleCopy}>Copy</button>
      </section>
    </div>
  )
}
