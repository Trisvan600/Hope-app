import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PAY_TERMS, createCustomer, getCustomer, updateCustomer } from './api'

const EMPTY = { custno: '', custname: '', address: '', payterm: '' }

export default function CustomerForm() {
  const { custno } = useParams()      // present on /customers/:custno/edit
  const isEdit = Boolean(custno)
  const navigate = useNavigate()

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    getCustomer(custno)
      .then((c) => setValues({
        custno: c.custno, custname: c.custname ?? '',
        address: c.address ?? '', payterm: c.payterm ?? '',
      }))
      .catch((e) => setServerError(e.message))
      .finally(() => setLoading(false))
  }, [custno, isEdit])

  const set = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.value }))

  function validate() {
    const e = {}
    if (!isEdit) {
      if (!values.custno.trim()) e.custno = 'Customer number is required'
      else if (!/^[A-Za-z0-9-]{1,10}$/.test(values.custno.trim()))
        e.custno = 'Use letters, numbers or dashes (max 10)'
    }
    if (!values.custname.trim()) e.custname = 'Customer name is required'
    if (!values.address.trim()) e.address = 'Address is required'
    if (!values.payterm) e.payterm = 'Select a pay term'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSaving(true)
    try {
      if (isEdit) await updateCustomer(custno, values)
      else await createCustomer(values)
      navigate('/customers')
    } catch (e) {
      setServerError(e.message || 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 520, display: 'grid', gap: 12 }}>
      <h2>{isEdit ? `Edit customer ${custno}` : 'New customer'}</h2>

      <label>
        Customer no.
        <input value={values.custno} onChange={set('custno')} disabled={isEdit} />
        {errors.custno && <small style={{ color: 'crimson' }}>{errors.custno}</small>}
      </label>

      <label>
        Customer name
        <input value={values.custname} onChange={set('custname')} />
        {errors.custname && <small style={{ color: 'crimson' }}>{errors.custname}</small>}
      </label>

      <label>
        Address
        <textarea rows={3} value={values.address} onChange={set('address')} />
        {errors.address && <small style={{ color: 'crimson' }}>{errors.address}</small>}
      </label>

      <label>
        Pay term
        <select value={values.payterm} onChange={set('payterm')}>
          <option value="">Select...</option>
          {PAY_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.payterm && <small style={{ color: 'crimson' }}>{errors.payterm}</small>}
      </label>

      {serverError && <p style={{ color: 'crimson' }}>{serverError}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create customer'}
        </button>
        <button type="button" onClick={() => navigate('/customers')}>Cancel</button>
      </div>
    </form>
  )
}