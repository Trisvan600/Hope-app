import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase' // adjust path to your supabase client
import { AuthCard, Alert } from '../components/AuthCard'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // 1. Sign in
    const { data, error: signInError } = await signIn(email, password)
    if (signInError) {
      setSubmitting(false)
      return setError(signInError.message)
    }

    // 2. Check if the account is blocked
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profile?.status === 'blocked') { // palitan ng exact value na sine-save ng Block button mo
      await supabase.auth.signOut()
      setSubmitting(false)
      return setError('Your account has been blocked. Please contact an administrator.')
    }

    // 3. All good
    setSubmitting(false)
    navigate('/', { replace: true })
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          <Link to="/forgot-password">Forgot password?</Link>
          <span>No account? <Link to="/register">Register</Link></span>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
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
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  )
}