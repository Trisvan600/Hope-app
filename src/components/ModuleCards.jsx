import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// Count rows in a table. Soft-deleted rows are excluded when the table has is_deleted.
async function countRows(table, activeOnly) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  if (activeOnly) q = q.eq('is_deleted', false)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

const CARDS = [
  { key: 'users',     label: 'Users',     table: 'profiles', activeOnly: false, to: '/users',     note: 'Registered accounts' },
  { key: 'customers', label: 'Customers', table: 'customer', activeOnly: true,  to: '/customers', note: 'Active customers' },
  { key: 'products',  label: 'Products',  table: 'product',  activeOnly: true,  to: '/products',  note: 'Active products' },
]

export default function ModuleCards() {
  const [counts, setCounts] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let cancelled = false
    CARDS.forEach(async (c) => {
      try {
        const n = await countRows(c.table, c.activeOnly)
        if (!cancelled) setCounts((p) => ({ ...p, [c.key]: n }))
      } catch (e) {
        if (!cancelled) setErrors((p) => ({ ...p, [c.key]: e.message }))
      }
    })
    return () => { cancelled = true }
  }, [])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
        margin: '20px 0',
      }}
    >
      {CARDS.map((c) => (
        <Link
          key={c.key}
          to={c.to}
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            textDecoration: 'none',
            color: '#111',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            display: 'block',
          }}
        >
          <div style={{ fontWeight: 600, color: '#555' }}>{c.label}</div>
          <div style={{ fontSize: 36, fontWeight: 700, margin: '12px 0' }}>
            {errors[c.key] ? '—' : counts[c.key] ?? '…'}
          </div>
          <div style={{ color: '#777', fontSize: 14 }}>
            {errors[c.key] ? 'Could not load' : c.note}
          </div>
        </Link>
      ))}
    </div>
  )
}