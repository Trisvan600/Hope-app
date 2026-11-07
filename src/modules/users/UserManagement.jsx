import { useEffect, useState } from 'react'
import { usePermissions } from '../../lib/permissions'
import { listUsers, setRole, setStatus } from './api'
import UserFormDialog from './UserFormDialog'
import RightsDialog from './RightsDialog'

export default function UserManagement({ refreshKey, onChanged }) {
  const { userId, isSuperadmin } = usePermissions()
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)        // null = closed, {} = add, profile = edit
  const [rightsFor, setRightsFor] = useState(null)

  // Reload when search/filter changes (250 ms debounce) or when refreshKey changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const data = await listUsers({ search, status })
        if (!cancelled) { setRows(data); setError('') }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [search, status, refreshKey])

  async function run(fn) {
    try { await fn(); onChanged() } catch (e) { alert(e.message) }
  }

  // Nobody manages themselves; admins manage only normal users; superadmin manages everyone else
  const canManage = (u) => u.id !== userId && (isSuperadmin || u.role === 'user')

  return (
    <div className="u-card">
      <div className="u-toolbar">
        <input
          className="u-input"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="u-input" value={status} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="u-btn primary" onClick={() => setForm({})}>+ Add User</button>
      </div>

      {error && <p className="s2-error">{error}</p>}
      {loading ? <p>Loading…</p> : (
        <table className="u-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="5">No users found.</td></tr>}
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name || '—'}</td>
                <td>{u.email}</td>
                <td><span className={`u-badge role-${u.role}`}>{u.role}</span></td>
                <td><span className={`u-badge st-${u.status}`}>{u.status}</span></td>
                <td className="u-actions">
                  {canManage(u) ? (
                    <>
                      <button className="u-btn" onClick={() => setForm(u)}>Edit</button>

                      {u.status === 'active' && (
                        <button className="u-btn danger" onClick={() => {
                          if (confirm(`Block ${u.email}?`)) run(() => setStatus(u.id, 'blocked'))
                        }}>Block</button>
                      )}
                      {u.status === 'blocked' && (
                        <button className="u-btn" onClick={() => run(() => setStatus(u.id, 'active'))}>
                          Unblock
                        </button>
                      )}

                      {u.status === 'active' && u.role !== 'superadmin' && (
                        <button className="u-btn" onClick={() => setRightsFor(u)}>Rights</button>
                      )}

                      {isSuperadmin && u.status === 'active' && u.role === 'user' && (
                        <button className="u-btn" onClick={() => run(() => setRole(u.id, 'admin'))}>
                          Make admin
                        </button>
                      )}
                      {isSuperadmin && u.role === 'admin' && (
                        <button className="u-btn" onClick={() => run(() => setRole(u.id, 'user'))}>
                          Remove admin
                        </button>
                      )}
                    </>
                  ) : <span className="u-muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {form && (
        <UserFormDialog
          user={form.id ? form : null}
          onClose={() => setForm(null)}
          onSaved={() => { setForm(null); onChanged() }}
        />
      )}
      {rightsFor && <RightsDialog user={rightsFor} onClose={() => setRightsFor(null)} />}
    </div>
  )
}