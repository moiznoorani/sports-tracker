import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await resetPassword(email)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
        <Link to="/auth/sign-in">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Reset password</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p><Link to="/auth/sign-in">Back to sign in</Link></p>
    </div>
  )
}
