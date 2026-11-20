import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Home() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [dbStatus, setDbStatus] = useState({ state: 'checking', message: 'Checking database connection…' })

  // Reads this user's row from the `profiles` table to prove the DB connection works
  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('id', user.id)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        setDbStatus({
          state: 'error',
          message: `Auth works, but the profiles query failed: ${error.message}. Did you run the SQL from Part 2?`,
        })
      } else {
        setProfile(data)
        setDbStatus({ state: 'ok', message: 'Connected to Supabase database' })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user.id])

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email

  return (
    <div className="page">
      <header className="navbar">
        <strong>Midterm App</strong>
        <div className="nav-right">
          <span className="muted">{user.email}</span>
          <button className="secondary" onClick={signOut}>Log out</button>
        </div>
      </header>
      <main className="content">
        <h1>Welcome, {displayName}!</h1>
        <p className="muted">You are logged in. This page is only visible to authenticated users.</p>
        <div className={`status status-${dbStatus.state}`}>
          <span className="dot" /> {dbStatus.message}
        </div>
        <section className="panel">
          <h2>Your account</h2>
          <dl>
            <dt>User ID</dt>
            <dd>{user.id}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Full name</dt>
            <dd>{profile?.full_name ?? '—'}</dd>
            <dt>Member since</dt>
            <dd>{new Date(user.created_at).toLocaleString()}</dd>
          </dl>
        </section>
      </main>
    </div>
  )
}