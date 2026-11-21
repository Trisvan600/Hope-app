import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { countPending } from '../modules/users/api'
import './AppLayout.css'

const clientMods = import.meta.glob('/src/**/supabaseClient.{js,ts}', { eager: true })
const { supabase } = Object.values(clientMods)[0]

const initials = (s = '?') => s.trim().slice(0, 2).toUpperCase()

export default function AppLayout({ children }) {
  const [me, setMe] = useState({ name: '', email: '', role: '' })
  const [pending, setPending] = useState(0)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase
        .from('profiles').select('full_name, role').eq('id', user.id).maybeSingle()
      setMe({
        name: p?.full_name || user.email.split('@')[0],
        email: user.email,
        role: p?.role || 'user',
      })
      if (p?.role === 'superadmin') countPending().then(setPending).catch(() => {})
    })()
  }, [])

  const link = ({ isActive }) => 'hx-link' + (isActive ? ' active' : '')

  return (
    <div className="hx-shell">
      <aside className="hx-side">
        <div className="hx-brand">
          <div className="hx-logo">🛡</div>
          <div>
            <div className="hx-brand-name">Hope<span>App</span></div>
            <div className="hx-brand-sub">ADMIN PORTAL</div>
          </div>
        </div>

        <div className="hx-group">OPERATIONS</div>
        <NavLink to="/" end className={link}><i>▦</i> Dashboard</NavLink>
        <NavLink to="/users" className={link}><i>👥</i> Users</NavLink>
        <NavLink to="/customers" className={link}><i>👤</i> Customers</NavLink>
        <NavLink to="/products" className={link}><i>📦</i> Products</NavLink>

        {me.role === 'superadmin' && (
          <>
            <div className="hx-group">MODERATION</div>
            <Link to="/users" className="hx-link">
              <i>🕒</i> Pending Approvals
              {pending > 0 && <span className="hx-pill">{pending}</span>}
            </Link>
          </>
        )}

        <div className="hx-side-foot">
          <div className="hx-avatar">{initials(me.name)}</div>
          <div className="hx-who">
            <b>{me.name}</b>
            <small>{me.role}</small>
          </div>
          <button className="hx-logout" title="Logout" onClick={() => supabase.auth.signOut()}>⎋</button>
        </div>
      </aside>

      <div className="hx-body">
        <header className="hx-top">
          <input className="hx-search" placeholder="Search users, emails..." />
          <div className="hx-status"><span className="hx-dot" /> System Status: <b>Operational</b></div>
          <div className="hx-me">
            <div className="hx-avatar sm">{initials(me.name)}</div>
            <div className="hx-who">
              <b>{me.name}</b>
              <small className="hx-role">{me.role}</small>
            </div>
          </div>
        </header>

        <main className="hx-main">{children}</main>
        <footer className="hx-foot">© 2026 HopeApp Admin Console</footer>
      </div>
    </div>
  )
}