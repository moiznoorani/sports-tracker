import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await signUp(email, password)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
        <Link to="/auth/sign-in">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Create account</h1>
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
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p>Already have an account? <Link to="/auth/sign-in">Sign in</Link></p>
    </div>
  )
}
