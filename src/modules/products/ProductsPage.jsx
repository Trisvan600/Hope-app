import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useRights } from '../../lib/useRights'
import {
  fetchProducts,
  fetchUnits,
  softDeleteProduct,
  restoreProduct,
  fetchCurrentPriceMap,
  fetchPriceHistory,
  addPrice,
  updatePrice,
  deletePrice,
} from './productsApi'

const today = () => new Date().toISOString().slice(0, 10)

export default function ProductsPage() {
  const { can } = useRights()

  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filter, setFilter] = useState('')
  const [view, setView] = useState('active') // 'active' | 'deleted'
  const [reloadKey, setReloadKey] = useState(0)
  const [units, setUnits] = useState([])
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authReady, setAuthReady] = useState(false)

  // DEV-07 / DEV-08 state
  const [priceMap, setPriceMap] = useState({})
  const [priceProd, setPriceProd] = useState(null) // product whose price history popup is open
  const [history, setHistory] = useState([])
  const [priceForm, setPriceForm] = useState({ effdate: today(), unitprice: '' })
  const [editingDate, setEditingDate] = useState(null)
  const [priceError, setPriceError] = useState('')
  const [priceReload, setPriceReload] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(() => setAuthReady(true))
    const { data: sub } = supabase.auth.onAuthStateChange(() => setAuthReady(true))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authReady) return
    fetchUnits().then(setUnits).catch(() => setUnits([]))
  }, [authReady, reloadKey])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchProducts({ search: debounced, filter, view })
      .then(({ rows, total }) => {
        if (cancelled) return
        setRows(rows)
        setTotal(total)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message || 'Failed to load products')
        setRows([])
        setTotal(0)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [authReady, debounced, filter, view, reloadKey])

  // DEV-08: current price for each product
  useEffect(() => {
    if (!authReady) return
    fetchCurrentPriceMap().then(setPriceMap).catch(() => setPriceMap({}))
  }, [authReady, reloadKey, priceReload])

  // DEV-07: price history of the selected product
  useEffect(() => {
    if (!priceProd) return
    fetchPriceHistory(priceProd.prodcode)
      .then(setHistory)
      .catch((e) => setPriceError(e.message || 'Failed to load price history'))
  }, [priceProd, priceReload])

  // close popup with Escape key
  useEffect(() => {
    if (!priceProd) return
    const onKey = (e) => { if (e.key === 'Escape') closePrices() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [priceProd])

  async function handleDelete(p) {
    if (!window.confirm(`Delete product ${p.prodcode} - ${p.description}?\nYou can restore it later.`)) return
    try {
      await softDeleteProduct(p.prodcode)
      if (priceProd?.prodcode === p.prodcode) closePrices()
      setReloadKey((k) => k + 1)
    } catch (e) {
      setError(e.message || 'Failed to delete product')
    }
  }

  async function handleRestore(p) {
    try {
      await restoreProduct(p.prodcode)
      setReloadKey((k) => k + 1)
    } catch (e) {
      setError(e.message || 'Failed to restore product')
    }
  }

  function openPrices(p) {
    setHistory([])
    setPriceProd(p)
    setPriceError('')
    setEditingDate(null)
    setPriceForm({ effdate: today(), unitprice: '' })
  }

  function closePrices() {
    setPriceProd(null)
    setHistory([])
    setEditingDate(null)
    setPriceError('')
  }

  async function handlePriceSubmit(e) {
    e.preventDefault()
    setPriceError('')
    if (!priceForm.effdate || priceForm.unitprice === '' || Number(priceForm.unitprice) < 0) {
      setPriceError('Enter an effective date and a valid price.')
      return
    }
    try {
      if (editingDate) await updatePrice(priceProd.prodcode, editingDate, priceForm)
      else await addPrice({ prodcode: priceProd.prodcode, ...priceForm })
      setEditingDate(null)
      setPriceForm({ effdate: today(), unitprice: '' })
      setPriceReload((k) => k + 1)
    } catch (err) {
      setPriceError(err.message || 'Failed to save price')
    }
  }

  async function handlePriceDelete(r) {
    if (!window.confirm(`Delete price ${r.unitprice} effective ${r.effdate}?`)) return
    try {
      await deletePrice(priceProd.prodcode, r.effdate)
      setPriceReload((k) => k + 1)
    } catch (err) {
      setPriceError(err.message || 'Failed to delete price')
    }
  }

  const columns = rows.length ? Object.keys(rows[0]) : []
  const canSavePrice = editingDate ? can('products', 'edit') : can('products', 'add')

  return (
    <div>
      <h2>Products (with search)</h2>

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
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All units</option>
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        {(search || filter) && (
          <button type="button" onClick={() => { setSearch(''); setFilter('') }}>
            Clear
          </button>
        )}
        {view === 'active' && can('products', 'add') && (
          <Link to="/products/new">
            <button type="button">+ New product</button>
          </Link>
        )}
      </div>

      <p>Total: {total}</p>

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && rows.length === 0 && (
        <p>{view === 'deleted' ? 'No deleted products.' : 'No products found.'}</p>
      )}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>Current price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.prodcode ?? i}>
                {columns.map((col) => (
                  <td key={col}>{String(p[col] ?? '')}</td>
                ))}
                <td>{priceMap[p.prodcode] ?? '—'}</td>
                <td>
                  {view === 'active' ? (
                    <>
                      <button type="button" onClick={() => openPrices(p)}>Prices</button>{' '}
                      {can('products', 'edit') && (
                        <Link to={`/products/${p.prodcode}/edit`}>Edit</Link>
                      )}{' '}
                      {can('products', 'delete') && (
                        <button type="button" onClick={() => handleDelete(p)}>Delete</button>
                      )}
                    </>
                  ) : (
                    can('products', 'delete') && (
                      <button type="button" onClick={() => handleRestore(p)}>Restore</button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* DEV-07: price history popup */}
      {priceProd && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closePrices}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              color: '#111',
              padding: 20,
              borderRadius: 12,
              width: 'min(560px, 92vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h3 style={{ margin: 0 }}>
                Price history: {priceProd.prodcode} - {priceProd.description}
              </h3>
              <button type="button" onClick={closePrices}>Close</button>
            </div>

            {priceError && <p style={{ color: 'crimson' }}>Error: {priceError}</p>}

            {canSavePrice && (
              <form
                onSubmit={handlePriceSubmit}
                style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}
              >
                <input
                  type="date"
                  value={priceForm.effdate}
                  onChange={(e) => setPriceForm({ ...priceForm, effdate: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Unit price"
                  value={priceForm.unitprice}
                  onChange={(e) => setPriceForm({ ...priceForm, unitprice: e.target.value })}
                />
                <button type="submit">{editingDate ? 'Update' : 'Add price'}</button>
                {editingDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDate(null)
                      setPriceForm({ effdate: today(), unitprice: '' })
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            )}

            <table style={{ width: '100%' }}>
              <thead>
                <tr><th>Effective date</th><th>Unit price</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.effdate}>
                    <td>{r.effdate}</td>
                    <td>{r.unitprice}</td>
                    <td>
                      {can('products', 'edit') && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDate(r.effdate)
                            setPriceForm({ effdate: r.effdate, unitprice: r.unitprice })
                          }}
                        >
                          Edit
                        </button>
                      )}{' '}
                      {can('products', 'delete') && (
                        <button type="button" onClick={() => handlePriceDelete(r)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={3}>No price history yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}