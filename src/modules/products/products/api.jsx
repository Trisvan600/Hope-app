import { supabase } from '../../lib/supabaseClient'

// ---- change these if your tables use different names ----
const TABLE = 'product'
const KEY = 'prodcode'
const SEARCH_COLUMNS = ['prodcode', 'description']
const FILTER_COLUMN = 'unit'

const PRICE_TABLE = 'pricehist'
const PRICE_PRODUCT_COL = 'prodcode'
const PRICE_DATE_COL = 'effdate'
const PRICE_COL = 'unitprice'
// ----------------------------------------------------------

function makeStamp(action, who) {
  const d = new Date()
  const date = d.toLocaleDateString('en-CA')
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  return `${action} ${who || 'system'} ${date} ${time}`
}

async function currentUserEmail() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email
}

function today() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
}

/* ============ S2-DEV-04: list, search, filter ============ */

export async function fetchUnits() {
  const { data, error } = await supabase.from(TABLE).select(FILTER_COLUMN)
  if (error) throw error
  return [...new Set((data ?? []).map((r) => r[FILTER_COLUMN]).filter(Boolean))].sort()
}

// view: 'active' (is_deleted = false) or 'deleted' (is_deleted = true)
export async function fetchProducts({ search = '', filter = '', view = 'active' } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not logged in. Please log in again.')

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('is_deleted', view === 'deleted')
    .order(KEY, { ascending: true })

  const term = search.trim().replace(/[,()]/g, ' ')
  if (term) {
    query = query.or(SEARCH_COLUMNS.map((c) => `${c}.ilike.%${term}%`).join(','))
  }
  if (filter) query = query.eq(FILTER_COLUMN, filter)

  const { data, error, count } = await query
  if (error) throw error
  return { rows: data ?? [], total: count ?? 0 }
}

/* ============ S2-DEV-05: create and edit ============ */

export async function getProduct(prodcode) {
  const { data, error } = await supabase
    .from(TABLE).select('*').eq(KEY, prodcode).single()
  if (error) throw error
  return data
}

export async function createProduct(values) {
  const prodcode = values.prodcode.trim().toUpperCase()

  const { data: existing, error: checkErr } = await supabase
    .from(TABLE).select(KEY).eq(KEY, prodcode).maybeSingle()
  if (checkErr) throw checkErr
  if (existing) throw new Error(`Product code ${prodcode} already exists.`)

  const { data, error } = await supabase.from(TABLE).insert({
    prodcode,
    description: values.description.trim(),
    unit: values.unit.trim(),
    is_deleted: false,
    stamp: makeStamp('ADD', await currentUserEmail()),
  }).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(prodcode, values) {
  const { data, error } = await supabase.from(TABLE).update({
    description: values.description.trim(),
    unit: values.unit.trim(),
    stamp: makeStamp('EDIT', await currentUserEmail()),
  }).eq(KEY, prodcode).select().single()
  if (error) throw error
  return data
}

/* ============ S2-DEV-06: soft delete and restore ============ */

export async function softDeleteProduct(prodcode) {
  const { data, error } = await supabase.from(TABLE).update({
    is_deleted: true,
    stamp: makeStamp('DEL', await currentUserEmail()),
  }).eq(KEY, prodcode).select().single()
  if (error) throw error
  return data
}

export async function restoreProduct(prodcode) {
  const { data, error } = await supabase.from(TABLE).update({
    is_deleted: false,
    stamp: makeStamp('RESTORE', await currentUserEmail()),
  }).eq(KEY, prodcode).select().single()
  if (error) throw error
  return data
}

/* ============ S2-DEV-07: price history (add, edit, delete) ============ */

function validatePrice({ effdate, unitprice }) {
  if (!effdate) throw new Error('Effective date is required.')
  if (unitprice === '' || unitprice === null || Number.isNaN(Number(unitprice))) {
    throw new Error('Price must be a number.')
  }
  if (Number(unitprice) < 0) throw new Error('Price cannot be negative.')
}

// all prices of one product, newest first
export async function fetchPriceHistory(prodcode) {
  const { data, error } = await supabase
    .from(PRICE_TABLE)
    .select('*')
    .eq(PRICE_PRODUCT_COL, prodcode)
    .order(PRICE_DATE_COL, { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addPrice(prodcode, values) {
  validatePrice(values)
  const { data: existing, error: checkErr } = await supabase
    .from(PRICE_TABLE).select(PRICE_DATE_COL)
    .eq(PRICE_PRODUCT_COL, prodcode).eq(PRICE_DATE_COL, values.effdate).maybeSingle()
  if (checkErr) throw checkErr
  if (existing) throw new Error(`A price for ${values.effdate} already exists. Edit it instead.`)

  const { data, error } = await supabase.from(PRICE_TABLE).insert({
    [PRICE_PRODUCT_COL]: prodcode,
    [PRICE_DATE_COL]: values.effdate,
    [PRICE_COL]: Number(values.unitprice),
  }).select().single()
  if (error) throw error
  return data
}

export async function updatePrice(prodcode, oldDate, values) {
  validatePrice(values)
  if (values.effdate !== oldDate) {
    const { data: clash, error: checkErr } = await supabase
      .from(PRICE_TABLE).select(PRICE_DATE_COL)
      .eq(PRICE_PRODUCT_COL, prodcode).eq(PRICE_DATE_COL, values.effdate).maybeSingle()
    if (checkErr) throw checkErr
    if (clash) throw new Error(`A price for ${values.effdate} already exists.`)
  }
  const { data, error } = await supabase.from(PRICE_TABLE).update({
    [PRICE_DATE_COL]: values.effdate,
    [PRICE_COL]: Number(values.unitprice),
  }).eq(PRICE_PRODUCT_COL, prodcode).eq(PRICE_DATE_COL, oldDate).select().single()
  if (error) throw error
  return data
}

export async function deletePrice(prodcode, effdate) {
  const { error } = await supabase
    .from(PRICE_TABLE).delete()
    .eq(PRICE_PRODUCT_COL, prodcode).eq(PRICE_DATE_COL, effdate)
  if (error) throw error
}

/* ============ S2-DEV-08: current price ============ */

// the price in force today = newest row whose date is today or earlier
export function pickCurrent(rows) {
  const t = today()
  return rows
    .filter((r) => r[PRICE_DATE_COL] <= t)
    .sort((a, b) => (a[PRICE_DATE_COL] < b[PRICE_DATE_COL] ? 1 : -1))[0] ?? null
}

// { PRODCODE: unitprice } for every product (shown on the product list)
export async function fetchCurrentPriceMap() {
  const { data, error } = await supabase
    .from(PRICE_TABLE)
    .select(`${PRICE_PRODUCT_COL}, ${PRICE_DATE_COL}, ${PRICE_COL}`)
    .lte(PRICE_DATE_COL, today())
    .order(PRICE_DATE_COL, { ascending: true })
    .limit(10000)
  if (error) throw error
  const map = {}
  for (const r of data ?? []) map[r[PRICE_PRODUCT_COL]] = r[PRICE_COL] // later date overwrites earlier
  return map
}