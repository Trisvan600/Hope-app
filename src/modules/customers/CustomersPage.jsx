import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchCustomers,
  softDeleteCustomer,
  restoreCustomer,
  PAY_TERMS,
} from './api'

const COLUMNS = [
  { key: 'custno', label: 'Cust No' },
  { key: 'custname', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'payterm', label: 'Pay Terms' },
  { key: 'stamp', label: 'Stamp' },
]

export default function CustomersPage() {
  const [view, setView] = useState('active') // 'active' | 'deleted'
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [payTerms, setPayTerms] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await fetchCustomers({ search, payTerms, view })
      setRows(result.rows)
      setTotal(result.total)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [search, payTerms, view])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  async function handleDelete(c) {
    if (!window.confirm(`Delete customer ${c.custno} - ${c.custname}?\nYou can restore it later.`)) return
    try {
      await softDeleteCustomer(c.custno)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRestore(c) {
    try {
      await restoreCustomer(c.custno)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Customers</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setView('active')} disabled={view === 'active'}>
          Active
        </button>
        <button onClick={() => setView('deleted')} disabled={view === 'deleted'}>
          Deleted
        </button>
        {view === 'active' && <Link to="/customers/new">+ Add customer</Link>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <select value={payTerms} onChange={(e) => setPayTerms(e.target.value)} style={{ padding: 8 }}>
          <option value="">All pay terms</option>
          {PAY_TERMS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {(search || payTerms) && (
          <button onClick={() => { setSearch(''); setPayTerms('') }}>Clear</button>
        )}
      </div>

      <p>Total: {total}</p>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {loading && <p>Loading…</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key} style={{ padding: 8 }}>{c.label}</th>
            ))}
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} style={{ padding: 16, textAlign: 'center' }}>
                {view === 'deleted' ? 'No deleted customers.' : 'No customers found.'}
              </td>
            </tr>
          )}
          {rows.map((c) => (
            <tr key={c.custno}>
              {COLUMNS.map((col) => (
                <td key={col.key} style={{ padding: 8 }}>{String(c[col.key] ?? '')}</td>
              ))}
              <td style={{ padding: 8 }}>
                {view === 'active' ? (
                  <button onClick={() => handleDelete(c)}>Delete</button>
                ) : (
                  <button onClick={() => handleRestore(c)}>Restore</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}