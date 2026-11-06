import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Home.css'

// Palitan ang `href` kung iba ang routes mo. Plain links ito, kaya walang kailangang router import.
const NAV = [
  { label: 'Dashboard', href: '/', icon: 'dashboard' },
  { label: 'Users', href: '/users', icon: 'users' },
  { label: 'Pending Approvals', href: '/pending-approvals', icon: 'pending', badge: true },
  { label: 'Settings', href: '/settings', icon: 'settings' },
]

const ICONS = {
  dashboard: ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75', 'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  pending: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M12 6v6l4 2'],
  settings: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1'],
  shield: ['M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3 8 3z', 'm9 12 2 2 4-4'],
  server: ['M4 3h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M4 13h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z', 'M6 7h.01M6 17h.01'],
  menu: ['M4 6h16M4 12h16M4 18h16'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
}

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(ICONS[name] || []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

function timeAgo(value) {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'Yesterday' : new Date(value).toLocaleDateString()
}

// Bilang ng rows sa isang table; null kung nag-error (hal. walang column)
async function countRows(table, filter) {
  try {
    let q = supabase.from(table).select('*', { count: 'exact', head: true })
    if (filter) q = q.eq(filter[0], filter[1])
    const { count, error } = await q
    return error ? null : count
  } catch {
    return null
  }
}

function StatCard({ label, value, note, icon, tone }) {
  return (
    <div className="hm-stat">
      <div className="hm-stat-top">
        <span className="hm-stat-label">{label}</span>
        <span className={`hm-stat-icon ${tone}`}><Icon name={icon} /></span>
      </div>
      <strong className="hm-stat-value">{value}</strong>
      <span className="hm-stat-note">{note}</span>
    </div>
  )
}

function Sidebar({ open, onClose, name, initial, role, pending, onLogout }) {
  const here = typeof window !== 'undefined' ? window.location.pathname : '/'
  return (
    <aside className={`hm-sidebar${open ? ' open' : ''}`}>
      <div className="hm-brand">
        <span className="hm-logo"><Icon name="shield" /></span>
        <span className="hm-brand-name">Hope<span>App</span></span>
      </div>

      <nav className="hm-menu">
        {NAV.map((n) => (
          <a key={n.label} href={n.href} onClick={onClose}
            className={`hm-menu-item${here === n.href ? ' active' : ''}`}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
            {n.badge && pending > 0 && <em className="hm-menu-badge">{pending}</em>}
          </a>
        ))}
      </nav>

      <div className="hm-sidebar-user">
        <span className="hm-avatar sm">{initial}</span>
        <div><strong>{name}</strong><small>{role}</small></div>
      </div>
      <button className="hm-logout" onClick={onLogout}>
        <Icon name="logout" size={16} /> Logout
      </button>
    </aside>
  )
}

export default function Home() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [logs, setLogs] = useState([])
  const [counts, setCounts] = useState({ total: null, pending: null })
  const [menuOpen, setMenuOpen] = useState(false)
  const [db, setDb] = useState({ state: 'checking', message: 'Checking database connection…' })

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      try {
        const { data, error } = await supabase
          .from('profiles').select('*').eq('id', user.id).maybeSingle()
        if (cancelled) return
        if (error) {
          setDb({ state: 'error', message: `Profile query failed: ${error.message}` })
        } else {
          setProfile(data)
          setDb({ state: 'ok', message: 'Connected to Supabase database' })
        }
      } catch (e) {
        if (!cancelled) setDb({ state: 'error', message: e.message })
      }

      const [total, pending] = await Promise.all([
        countRows('profiles'),
        countRows('profiles', ['status', 'pending']),
      ])
      if (!cancelled) setCounts({ total, pending })

      try {
        const { data: rows, error } = await supabase
          .from('login_logs').select('id, logged_in_at').eq('user_id', user.id)
          .order('logged_in_at', { ascending: false }).limit(5)
        if (!cancelled && !error && rows) {
          setLogs(rows.map((r) => ({ id: r.id, event: 'User Login', time: timeAgo(r.logged_in_at) })))
        }
      } catch { /* walang login_logs table: ok lang */ }
    }

    load()
    return () => { cancelled = true }
  }, [user?.id])

  if (!user) return null

  const name = profile?.full_name || user.user_metadata?.full_name || user.email
  const initial = (name || '?').charAt(0).toUpperCase()
  const role = profile?.role || 'User'
  const ok = db.state === 'ok'
  const fmt = (n) => (n === null ? '—' : n.toLocaleString())

  return (
    <div className="hm-layout">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} name={name}
        initial={initial} role={role} pending={counts.pending || 0} onLogout={signOut} />
      {menuOpen && <div className="hm-scrim" onClick={() => setMenuOpen(false)} />}

      <div className="hm-main">
        <header className="hm-topbar">
          <button className="hm-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <h2>Dashboard</h2>
          <span className="hm-email">{user.email}</span>
        </header>

        <main className="hm-content">
          <section className="hm-hero">
            <div>
              <span className="hm-badge">Portal Active</span>
              <h1>Welcome back, {name}!</h1>
              <p>Review new sign-ups and manage your users from here.</p>
            </div>
            <div className="hm-hero-actions">
              <a className="hm-btn ghost" href="/pending-approvals">Review approvals</a>
              <a className="hm-btn primary" href="/users">Manage users</a>
            </div>
          </section>

          <section className="hm-stats">
            <StatCard label="Total Users" value={fmt(counts.total)} note="Registered accounts" icon="users" tone="indigo" />
            <StatCard label="Pending Approvals" value={fmt(counts.pending)}
              note={counts.pending ? 'Waiting for review' : 'Nothing to review'} icon="pending" tone="amber" />
            <StatCard label="Your Role" value={role} note="Current access level" icon="shield" tone="green" />
            <StatCard label="System Health" value={ok ? 'Online' : db.state === 'error' ? 'Error' : '…'}
              note={ok ? 'Database connected' : 'Check connection'} icon="server" tone="purple" />
          </section>

          <section className="hm-grid">
            <div className="hm-panel">
              <div className="hm-panel-head"><h3>Recent logins</h3></div>
              <div className="hm-table-wrap">
                <table className="hm-table">
                  <thead><tr><th>Event</th><th>Time</th></tr></thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr><td colSpan="2" className="time">No login history yet.</td></tr>
                    ) : logs.map((l) => (
                      <tr key={l.id}>
                        <td><span className="hm-dot green" /> {l.event}</td>
                        <td className="time">{l.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="hm-panel hm-profile">
              <span className="hm-avatar lg">{initial}</span>
              <strong className="hm-profile-name">{name}</strong>
              <span className="hm-profile-email">{user.email}</span>
              <span className="hm-role-badge">{role}</span>
              <div className="hm-profile-stats">
                <div><small>Role</small><strong>{role}</strong></div>
                <div><small>Status</small>
                  <strong className={ok ? 'ok' : db.state === 'error' ? 'bad' : ''}>
                    {ok ? 'Active' : db.state === 'error' ? 'Error' : '…'}
                  </strong>
                </div>
                <div><small>Member since</small>
                  <strong>{new Date(user.created_at).toLocaleDateString()}</strong>
                </div>
              </div>
              <div className={`hm-status hm-status-${db.state}`}>
                <span className="hm-dot" /> {db.message}
              </div>
            </aside>
          </section>
        </main>

        <footer className="hm-footer">© {new Date().getFullYear()} Hope App. All rights reserved.</footer>
      </div>
    </div>
  )
}