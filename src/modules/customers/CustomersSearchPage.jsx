import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRights } from '../../lib/useRights'
import {
  fetchCustomers,
  softDeleteCustomer,
  restoreCustomer,
  PAY_TERMS,
} from './api'

export default function CustomersSearchPage() {
  const { can } = useRights()

  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [payTerms, setPayTerms] = useState('')
  const [view, setView] = useState('active') // 'active' | 'deleted'  (S2-DEV-03)
  const [reloadKey, setReloadKey] = useState(0)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authReady, setAuthReady] = useState(false)

  // wait for the session to be restored before querying
  useEffect(() => {
    supabase.auth.getSession().then(() => setAuthReady(true))
    const { data: sub } = supabase.auth.onAuthStateChange(() => setAuthReady(true))
    return () => sub.subscription.unsubscribe()
  }, [])

  // debounce typing
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchCustomers({ search: debounced, payTerms, view })
      .then(({ rows, total }) => {
        if (cancelled) return
        setRows(rows)
        setTotal(total)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message || 'Failed to load customers')
        setRows([])
        setTotal(0)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [authReady, debounced, payTerms, view, reloadKey])

  // ---- S2-DEV-03: soft delete and restore ----
  async function handleDelete(c) {
    if (!can('customers', 'delete')) return
    if (!window.confirm(`Delete customer ${c.custno} - ${c.custname}?\nYou can restore it later.`)) return
    try {
      await softDeleteCustomer(c.custno)
      setReloadKey((k) => k + 1)
    } catch (e) {
      setError(e.message || 'Failed to delete customer')
    }
  }

  async function handleRestore(c) {
    if (!can('customers', 'delete')) return // restore counts as 'delete'
    try {
      await restoreCustomer(c.custno)
      setReloadKey((k) => k + 1)
    } catch (e) {
      setError(e.message || 'Failed to restore customer')
    }
  }

  return (
    <div>
      <h2>Customers (with search)</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setView('active')} disabled={view === 'active'}>
          Active
        </button>
        <button type="button" onClick={() => setView('deleted')} disabled={view === 'deleted'}>
          Deleted
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={{ flex: 1 }}
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={payTerms} onChange={(e) => setPayTerms(e.target.value)}>
          <option value="">All pay terms</option>
          {PAY_TERMS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {view === 'active' && can('customers', 'add') && (
          <Link to="/customers/new">
            <button type="button">+ New customer</button>
          </Link>
        )}
      </div>

      <p>Total: {total}</p>

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && rows.length === 0 && (
        <p>{view === 'deleted' ? 'No deleted customers.' : 'No customers found.'}</p>
      )}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>custno</th>
              <th>custname</th>
              <th>address</th>
              <th>payterm</th>
              <th>is_deleted</th>
              <th>stamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.custno}>
                <td>{c.custno}</td>
                <td>{c.custname}</td>
                <td>{c.address}</td>
                <td>{c.payterm}</td>
                <td>{String(c.is_deleted)}</td>
                <td>{c.stamp}</td>
                <td>
                  {view === 'active' ? (
                    <>
                      {can('customers', 'edit') && (
                        <Link to={`/customers/${c.custno}/edit`}>Edit</Link>
                      )}{' '}
                      {can('customers', 'delete') && (
                        <button type="button" onClick={() => handleDelete(c)}>Delete</button>
                      )}
                    </>
                  ) : (
                    can('customers', 'delete') && (
                      <button type="button" onClick={() => handleRestore(c)}>Restore</button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}