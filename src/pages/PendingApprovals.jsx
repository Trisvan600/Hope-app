// src/modules/PendingApprovals.jsx
import { useEffect, useState, useCallback } from 'react'

// Finds the files anywhere under src, so no relative path can be wrong.
const clientMods = import.meta.glob('/src/**/supabaseClient.{js,ts}', { eager: true })
const permMods = import.meta.glob('/src/**/permissions.{jsx,js,tsx,ts}', { eager: true })
const { supabase } = Object.values(clientMods)[0]
const { usePermissions } = Object.values(permMods)[0]

const btn = { border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', color: '#fff' }

export default function PendingApprovals() {
  const { isSuperadmin, loading: permLoading } = usePermissions()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'pending')
    if (error) setError(error.message)
    else setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isSuperadmin) load()
  }, [isSuperadmin, load])

  async function decide(id, status) {
    setError('')
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()
    if (error) return setError(error.message)
    if (!data || data.length === 0) {
      return setError('Update blocked by RLS. Run the SQL policies for superadmin.')
    }
    setRows((list) => list.filter((r) => r.id !== id))
  }

  if (permLoading) return <p style={{ color: '#fff' }}>Loading…</p>
  if (!isSuperadmin) {
    return <p style={{ color: '#fff', padding: 20 }}>Only a superadmin can approve registrations.</p>
  }
  if (loading) return <p style={{ color: '#fff' }}>Loading…</p>

  return (
    <div style={{ color: '#fff', padding: 20 }}>
      <h2>Pending Approvals ({rows.length})</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {rows.length === 0 && <p>Nothing to review.</p>}

      {rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, background: '#111827', marginBottom: 8, borderRadius: 6 }}>
          <span>{r.full_name || '(no name)'}</span>
          <span style={{ flex: 1 }}>{r.email}</span>
          <button onClick={() => decide(r.id, 'active')} style={{ ...btn, background: '#10b981' }}>Approve</button>
          <button onClick={() => decide(r.id, 'rejected')} style={{ ...btn, background: '#ef4444' }}>Reject</button>
        </div>
      ))}
    </div>
  )
}