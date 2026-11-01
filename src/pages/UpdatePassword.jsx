import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthCard, Alert } from '../components/AuthCard'

// The user lands here from the email link; Supabase signs them in temporarily
export default function UpdatePassword() {
  const { session, loading, updatePassword, setRecovering, signOut } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) return setError(error.message)
    setInfo('Password updated! Redirecting to log in…')
    setRecovering(false)
    await signOut()
    setTimeout(() => navigate('/login', { replace: true }), 1500)
  }

  if (loading) return <div className="center-screen">Loading…</div>

  return (
    <AuthCard title="Choose a new password" footer={<Link to="/login">Back to log in</Link>}>
      {!session && !info ? (
        <Alert>
          This reset link is invalid or has expired. <Link to="/forgot-password">Request a new one</Link>.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <Alert>{error}</Alert>
          <Alert type="success">{info}</Alert>
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm new password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}