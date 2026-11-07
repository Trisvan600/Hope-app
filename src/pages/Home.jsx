import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const clientMods = import.meta.glob('/src/**/supabaseClient.{js,ts}', { eager: true })
const { supabase } = Object.values(clientMods)[0]

async function countRows(table, apply) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  if (apply) q = apply(q)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

const initials = (s = '?') => s.trim().slice(0, 2).toUpperCase()

export default function Home() {
  const [me, setMe] = useState({ name: '', role: '' })
  const [stats, setStats] = useState({ users: 0, customers: 0, products: 0, pending: 0 })
  const [recent, setRecent] = useState([])
  const [online, setOnline] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: p } = await supabase
          .from('profiles').select('full_name, role').eq('id', user.id).maybeSingle()

        const [users, pending, list, customers, products] = await Promise.all([
          countRows('profiles'),
          countRows('profiles', (q) => q.eq('status', 'pending')),
          supabase.from('profiles').select('id, full_name, email, status, role').limit(5),
          countRows('customer').catch(() => 0),   // palitan kung iba ang table name
          countRows('product').catch(() => 0),    // palitan kung iba ang table name
        ])
        if (!alive) return
        setMe({ name: p?.full_name || user.email.split('@')[0], role: p?.role || 'user' })
        setStats({ users, customers, products, pending })
        setRecent(list.data ?? [])
      } catch {
        if (alive) setOnline(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const isSuper = me.role === 'superadmin'

  const cards = [
    { label: 'Total Users', value: stats.users, note: 'Registered accounts', icon: '👥', tone: 'blue' },
    { label: 'Customers', value: stats.customers, note: 'Active customers', icon: '👤', tone: 'violet' },
    { label: 'Products', value: stats.products, note: 'Active products', icon: '📦', tone: 'green' },
    {
      label: 'Pending Approvals', value: stats.pending, icon: '🕒', tone: 'amber',
      note: stats.pending > 0 ? 'Requires admin action' : 'Nothing to review',
      noteTone: stats.pending > 0 ? 'amber' : '',
    },
    { label: 'Your Role', value: me.role || '—', note: 'Current access level', icon: '🛡', tone: 'green' },
    {
      label: 'System Health', value: online ? 'Online' : 'Offline', icon: '🗄', tone: 'violet',
      note: online ? 'Database connected' : 'Cannot reach database',
      noteTone: online ? '' : 'red',
    },
  ]

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>Welcome back, {me.name || '...'}!</h1>
          <p>Review new sign-ups and manage your users from here.</p>
        </div>
        <div className="dash-actions">
          {isSuper && <Link to="/users" className="btn ghost">Review approvals</Link>}
          <Link to="/users" className="btn primary">Manage users</Link>
        </div>
      </div>

      <div className="dash-cards">
        {cards.map((c) => (
          <div className="card stat" key={c.label}>
            <div className="stat-top">
              <span>{c.label}</span>
              <div className={`ico ${c.tone}`}>{c.icon}</div>
            </div>
            <div className="stat-val">{c.value}</div>
            <div className={`stat-note ${c.noteTone || ''}`}>{c.note}</div>
          </div>
        ))}
      </div>

      <div className="card table-card">
        <div className="table-head">
          <div>
            <h3>User Directory</h3>
            <p>Recent accounts and their status</p>
          </div>
          <Link to="/users" className="btn ghost sm">View all</Link>
        </div>

        <table>
          <thead>
            <tr><th>USER</th><th>ACCOUNT STATUS</th><th>ROLE</th></tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan="3" className="empty">No users to show.</td></tr>
            )}
            {recent.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="u-cell">
                    <div className="u-av">{initials(u.full_name || u.email)}</div>
                    <div>
                      <b>{u.full_name || '(no name)'}</b>
                      <small>{u.email}</small>
                    </div>
                  </div>
                </td>
                <td><span className={`badge ${u.status}`}>{u.status}</span></td>
                <td className="role">{u.role || 'user'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}