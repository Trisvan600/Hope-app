import { supabase } from '../../lib/supabaseClient'

// ---------- Products list (DEV-06 soft delete / restore) ----------

export async function fetchProducts({ search = '', filter = '', view = 'active' } = {}) {
  let q = supabase
    .from('product')
    .select('*', { count: 'exact' })
    .eq('is_deleted', view === 'deleted')
    .order('prodcode', { ascending: true })

  if (search) {
    q = q.or(`prodcode.ilike.%${search}%,description.ilike.%${search}%`)
  }
  if (filter) {
    q = q.eq('unit', filter)
  }

  const { data, error, count } = await q
  if (error) throw error
  return { rows: data || [], total: count ?? (data ? data.length : 0) }
}

export async function fetchUnits() {
  const { data, error } = await supabase
    .from('product')
    .select('unit')
    .eq('is_deleted', false)
  if (error) throw error
  return [...new Set((data || []).map((r) => r.unit).filter(Boolean))].sort()
}

export async function softDeleteProduct(prodcode) {
  const { error } = await supabase
    .from('product')
    .update({ is_deleted: true })
    .eq('prodcode', prodcode)
  if (error) throw error
}

export async function restoreProduct(prodcode) {
  const { error } = await supabase
    .from('product')
    .update({ is_deleted: false })
    .eq('prodcode', prodcode)
  if (error) throw error
}

// ---------- Current price (DEV-08) ----------
// Returns { [prodcode]: unitprice } using the latest price on or before today.

export async function fetchCurrentPriceMap() {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('pricehist')
    .select('prodcode, effdate, unitprice')
    .lte('effdate', today)
    .order('effdate', { ascending: false })
  if (error) throw error

  const map = {}
  for (const r of data || []) {
    if (!(r.prodcode in map)) map[r.prodcode] = r.unitprice // first = newest
  }
  return map
}

// ---------- Price history (DEV-07) ----------

export async function fetchPriceHistory(prodcode) {
  const { data, error } = await supabase
    .from('pricehist')
    .select('prodcode, effdate, unitprice')
    .eq('prodcode', prodcode)
    .order('effdate', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addPrice({ prodcode, effdate, unitprice }) {
  const { error } = await supabase
    .from('pricehist')
    .insert({ prodcode, effdate, unitprice: Number(unitprice) })
  if (error) throw error
}

export async function updatePrice(prodcode, oldEffdate, { effdate, unitprice }) {
  const { error } = await supabase
    .from('pricehist')
    .update({ effdate, unitprice: Number(unitprice) })
    .eq('prodcode', prodcode)
    .eq('effdate', oldEffdate)
  if (error) throw error
}

export async function deletePrice(prodcode, effdate) {
  const { error } = await supabase
    .from('pricehist')
    .delete()
    .eq('prodcode', prodcode)
    .eq('effdate', effdate)
  if (error) throw error
}
export async function getProduct(prodcode) {
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .eq('prodcode', prodcode)
    .single()
  if (error) throw error
  return data
}

export async function createProduct(values) {
  const { data, error } = await supabase
    .from('product')
    .insert({ ...values, is_deleted: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(prodcode, values) {
  const { prodcode: _ignore, ...fields } = values // never overwrite the key
  const { data, error } = await supabase
    .from('product')
    .update(fields)
    .eq('prodcode', prodcode)
    .select()
    .single()
  if (error) throw error
  return data
}
