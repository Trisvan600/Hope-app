import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthCard, Alert } from '../components/AuthCard'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setSubmitting(true)
    const { data, error } = await signUp(email, password, fullName)
    setSubmitting(false)
    if (error) return setError(error.message)
    if (data.session) {
      // Email confirmation is off in Supabase: user is logged in immediately
      navigate('/', { replace: true })
    } else {
      // Email confirmation is on: user must click the link in their inbox
      setInfo('Account created! Check your email to confirm your address, then log in.')
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Register to get started"
      footer={<span>Already registered? <Link to="/login">Log in</Link></span>}
    >
      <form onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <Alert type="success">{info}</Alert>
        <label>
          Full name
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>
    </AuthCard>
  )
}