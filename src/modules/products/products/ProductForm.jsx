import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createProduct,
  fetchUnits,
  getProduct,
  updateProduct,
} from './products/productsApi'

const EMPTY = { prodcode: '', description: '', unit: '' }

export default function ProductForm() {
  const { prodcode } = useParams() // present on /products/:prodcode/edit
  const isEdit = Boolean(prodcode)
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUnits().then(setUnits).catch(() => setUnits([]))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    getProduct(prodcode)
      .then((p) => setValues({
        prodcode: p.prodcode ?? '',
        description: p.description ?? '',
        unit: p.unit ?? '',
      }))
      .catch((e) => setError(e.message || 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [isEdit, prodcode])

  function handleChange(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!values.prodcode.trim()) return setError('Product code is required.')
    if (!values.description.trim()) return setError('Description is required.')
    if (!values.unit.trim()) return setError('Unit is required.')

    try {
      setSaving(true)
      if (isEdit) await updateProduct(prodcode, values)
      else await createProduct(values)
      navigate('/products')
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>{isEdit ? `Edit product ${prodcode}` : 'New product'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Product code
          <input
            name="prodcode"
            value={values.prodcode}
            onChange={handleChange}
            disabled={isEdit}
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <label>
          Description
          <input
            name="description"
            value={values.description}
            onChange={handleChange}
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        <label>
          Unit
          <input
            name="unit"
            list="unit-options"
            value={values.unit}
            onChange={handleChange}
            style={{ display: 'block', width: '100%' }}
          />
          <datalist id="unit-options">
            {units.map((u) => <option key={u} value={u} />)}
          </datalist>
        </label>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <Link to="/products">Cancel</Link>
        </div>
      </form>
    </div>
  )
}