import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRights } from '../../lib/rights'
import {
  addPrice,
  deletePrice,
  fetchPriceHistory,
  pickCurrent,
  updatePrice,
} from './products/priceApi'

const EMPTY = { effdate: '', unitprice: '' }

export default function PriceHistoryPage() {
  const { prodcode } = useParams()
  const { can } = useRights()

  const [rows, setRows] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingDate, setEditingDate] = useState(null) // old effdate while editing
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setRows(await fetchPriceHistory(prodcode))
    } catch (e) {
      setError(e.message || 'Failed to load prices')
    } finally {
      setLoading(false)
    }
  }, [prodcode])

  useEffect(() => { load() }, [load])

  const current = pickCurrent(rows)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function startEdit(r) {
    setEditingDate(r.effdate)
    setForm({ effdate: r.effdate, unitprice: String(r.unitprice) })
    setError('')
  }

  function cancelEdit() {
    setEditingDate(null)
    setForm(EMPTY)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      setSaving(true)
      if (editingDate) await updatePrice(prodcode, editingDate, form)
      else await addPrice(prodcode, form)
      cancelEdit()
      await load()
    } catch (err) {
      setError(err.message || 'Failed to save price')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(r) {
    if (!window.confirm(`Delete the price effective ${r.effdate}?`)) return
    try {
      await deletePrice(prodcode, r.effdate)
      if (editingDate === r.effdate) cancelEdit()
      await load()
    } catch (err) {
      setError(err.message || 'Failed to delete price')
    }
  }

  const showForm = editingDate ? can('products', 'edit') : can('products', 'add')

  return (
    <div>
      <p><Link to="/products">&larr; Back to products</Link></p>
      <h2>Price history: {prodcode}</h2>

      <p>
        <strong>Current price:</strong>{' '}
        {current
          ? `${Number(current.unitprice).toFixed(2)} (effective ${current.effdate})`
          : 'No price in effect yet'}
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'end', margin: '12px 0' }}>
          <label>
            Effective date
            <input
              type="date"
              name="effdate"
              value={form.effdate}
              onChange={handleChange}
              style={{ display: 'block' }}
            />
          </label>
          <label>
            Price
            <input
              type="number"
              step="0.01"
              min="0"
              name="unitprice"
              value={form.unitprice}
              onChange={handleChange}
              style={{ display: 'block' }}
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingDate ? 'Save changes' : 'Add price'}
          </button>
          {editingDate && <button type="button" onClick={cancelEdit}>Cancel</button>}
        </form>
      )}

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && rows.length === 0 && <p>No prices yet for this product.</p>}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Effective date</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.effdate}>
                <td>{r.effdate}</td>
                <td>{Number(r.unitprice).toFixed(2)}</td>
                <td>{current && current.effdate === r.effdate ? 'Current' : ''}</td>
                <td>
                  {can('products', 'edit') && (
                    <button type="button" onClick={() => startEdit(r)}>Edit</button>
                  )}{' '}
                  {can('products', 'delete') && (
                    <button type="button" onClick={() => handleDelete(r)}>Delete</button>
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