import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthCard, Alert } from '../components/AuthCard'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    const { error } = await resetPassword(email)
    setSubmitting(false)
    if (error) return setError(error.message)
    setInfo('If that email is registered, a reset link is on its way. Check your inbox.')
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={<Link to="/login">Back to log in</Link>}
    >
      <form onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <Alert type="success">{info}</Alert>
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  )
}