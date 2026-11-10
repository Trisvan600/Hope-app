import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import CustomerFormDialog from './CustomerFormDialog'
import './CustomersPage.css'

const TABLE = 'customer'
const KEY = 'custno' // the primary key column

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [dialog, setDialog] = useState(null) // null | 'new' | customer row
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    const { data, error } = await supabase.from(TABLE).select('*').order(KEY)
    if (error) setError(error.message)
    else { setError(''); setCustomers(data ?? []) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ---------- DEV-02: create and edit ----------
  async function handleSave(values) {
    if (dialog === 'new') {
      const { error } = await supabase.from(TABLE).insert([{ ...values, is_deleted: false }])
      if (error) throw error
    } else {
      const { error } = await supabase.from(TABLE).update(values).eq(KEY, dialog[KEY])
      if (error) throw error
    }
    await load()
  }

  // ---------- DEV-03: soft delete and restore ----------
  async function setDeleted(row, value) {
    const { error } = await supabase.from(TABLE).update({ is_deleted: value }).eq(KEY, row[KEY])
    if (error) { setError(error.message); return }
    await load()
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete ${row.custname}? You can restore it later.`)) return
    await setDeleted(row, true)
  }

  const columns = customers.length ? Object.keys(customers[0]) : []
  const filterKey = columns.find((k) => /term/i.test(k))

  const filterOptions = useMemo(() => {
    if (!filterKey) return []
    return [...new Set(customers.map((c) => c[filterKey]).filter(Boolean))].sort()
  }, [customers, filterKey])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return customers.filter((c) => {
      const matchesDeleted = !!c.is_deleted === showDeleted
      const matchesSearch =
        !s || Object.values(c).some((v) => String(v ?? '').toLowerCase().includes(s))
      const matchesFilter = !filterValue || c[filterKey] === filterValue
      return matchesDeleted && matchesSearch && matchesFilter
    })
  }, [customers, search, filterValue, filterKey, showDeleted])

  const visibleCount = customers.filter((c) => !!c.is_deleted === showDeleted).length

  return (
    <div style={{ padding: 16 }}>
      <h2>Customers</h2>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="">All pay terms</option>
          {filterOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        {(search || filterValue) && (
          <button onClick={() => { setSearch(''); setFilterValue('') }}>Clear</button>
        )}
        <label style={{ whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          />{' '}
          Show deleted
        </label>
        <button className="u-btn primary" onClick={() => setDialog('new')}>
          + Add customer
        </button>
      </div>

      <p>
        Total: {filtered.length}
        {filtered.length !== visibleCount && ` of ${visibleCount}`}
      </p>

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {loading && <p>Loading…</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ padding: 8 }}>{col}</th>
            ))}
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} style={{ padding: 16, textAlign: 'center' }}>
                {showDeleted ? 'No deleted customers.' : 'No customers found.'}
              </td>
            </tr>
          )}
          {filtered.map((c, i) => (
            <tr key={c[KEY] ?? i}>
              {columns.map((col) => (
                <td key={col} style={{ padding: 8 }}>{String(c[col] ?? '')}</td>
              ))}
              <td style={{ padding: 8 }}>
                <div className="u-actions">
                  {showDeleted ? (
                    <button className="u-btn" onClick={() => setDeleted(c, false)}>Restore</button>
                  ) : (
                    <>
                      <button className="u-btn" onClick={() => setDialog(c)}>Edit</button>
                      <button className="u-btn danger" onClick={() => handleDelete(c)}>Delete</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {dialog && (
        <CustomerFormDialog
          customer={dialog === 'new' ? null : dialog}
          onSave={handleSave}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}