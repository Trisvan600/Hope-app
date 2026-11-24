import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

// If the table has a different name in Supabase, change it here
const TABLE = 'customers'

export default function CustomersSearchPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from(TABLE).select('*')
      if (error) setError(error.message)
      else setCustomers(data)
      setLoading(false)
    }
    load()
  }, [])

  // real column names, taken from the data
  const columns = customers.length ? Object.keys(customers[0]) : []

  // filter column = the first column whose name contains "term" (e.g. pay_term, payment_terms)
  const filterKey = columns.find((k) => /term/i.test(k))

  const filterOptions = useMemo(() => {
    if (!filterKey) return []
    return [...new Set(customers.map((c) => c[filterKey]).filter(Boolean))].sort()
  }, [customers, filterKey])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return customers.filter((c) => {
      const matchesSearch =
        !s || Object.values(c).some((v) => String(v ?? '').toLowerCase().includes(s))
      const matchesFilter = !filterValue || c[filterKey] === filterValue
      return matchesSearch && matchesFilter
    })
  }, [customers, search, filterValue, filterKey])

  return (
    <div style={{ padding: 16 }}>
      <h2>Customers (with search)</h2>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
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
      </div>

      <p>
        Total: {filtered.length}
        {filtered.length !== customers.length && ` of ${customers.length}`}
      </p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading && <p>Loading…</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ padding: 8 }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={columns.length || 1} style={{ padding: 16, textAlign: 'center' }}>
                No customers found.
              </td>
            </tr>
          )}
          {filtered.map((c, i) => (
            <tr key={c.id ?? i}>
              {columns.map((col) => (
                <td key={col} style={{ padding: 8 }}>{String(c[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}