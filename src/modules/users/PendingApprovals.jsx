import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const PENDING = 'pending' // must match the value in your table exactly

export default function PendingApprovals() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', PENDING)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function decide(id, status) {
    setError('')
    // .select() returns the updated rows, so we can detect an RLS-blocked update
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) return setError(error.message)
    if (!data || data.length === 0) {
      return setError('Update blocked: no rows changed. Check your RLS update policy.')
    }
    setRows((list) => list.filter((r) => r.id !== id))
  }

  if (loading) return <p>Loading…</p>

  return (
    <div>
      <h2>Pending Approvals ({rows.length})</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {rows.length === 0 && <p>Nothing to review.</p>}

      {rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', gap: 12, padding: 8 }}>
          <span>{r.full_name || r.email}</span>
          <span>{r.email}</span>
          <button onClick={() => decide(r.id, 'active')}>Approve</button>
          <button onClick={() => decide(r.id, 'rejected')}>Reject</button>
        </div>
      ))}
    </div>
  )
}