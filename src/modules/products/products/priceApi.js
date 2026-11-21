import { supabase } from '../../../lib/supabaseClient'

// ---- change these if your table uses different names ----
const TABLE = 'pricehist'
const PRODUCT_COL = 'prodcode'
const DATE_COL = 'effdate'
const PRICE_COL = 'unitprice'
// ----------------------------------------------------------

function today() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
}

function validate({ effdate, unitprice }) {
  if (!effdate) throw new Error('Effective date is required.')
  if (unitprice === '' || unitprice === null || Number.isNaN(Number(unitprice))) {
    throw new Error('Price must be a number.')
  }
  if (Number(unitprice) < 0) throw new Error('Price cannot be negative.')
}

// all prices of one product, newest first
export async function fetchPriceHistory(prodcode) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq(PRODUCT_COL, prodcode)
    .order(DATE_COL, { ascending: false })
  if (error) throw error
  return data ?? []
}

// the price in force today = newest row whose date is today or earlier
export function pickCurrent(rows) {
  const t = today()
  return rows
    .filter((r) => r[DATE_COL] <= t)
    .sort((a, b) => (a[DATE_COL] < b[DATE_COL] ? 1 : -1))[0] ?? null
}

// { PRODCODE: unitprice } for every product (used on the product list)
export async function fetchCurrentPriceMap() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`${PRODUCT_COL}, ${DATE_COL}, ${PRICE_COL}`)
    .lte(DATE_COL, today())
    .order(DATE_COL, { ascending: true })
    .limit(10000)
  if (error) throw error
  const map = {}
  for (const r of data ?? []) map[r[PRODUCT_COL]] = r[PRICE_COL] // later date overwrites earlier
  return map
}

export async function addPrice(prodcode, values) {
  validate(values)
  const { data: existing, error: checkErr } = await supabase
    .from(TABLE).select(DATE_COL)
    .eq(PRODUCT_COL, prodcode).eq(DATE_COL, values.effdate).maybeSingle()
  if (checkErr) throw checkErr
  if (existing) throw new Error(`A price for ${values.effdate} already exists. Edit it instead.`)

  const { data, error } = await supabase.from(TABLE).insert({
    [PRODUCT_COL]: prodcode,
    [DATE_COL]: values.effdate,
    [PRICE_COL]: Number(values.unitprice),
  }).select().single()
  if (error) throw error
  return data
}

export async function updatePrice(prodcode, oldDate, values) {
  validate(values)
  if (values.effdate !== oldDate) {
    const { data: clash, error: checkErr } = await supabase
      .from(TABLE).select(DATE_COL)
      .eq(PRODUCT_COL, prodcode).eq(DATE_COL, values.effdate).maybeSingle()
    if (checkErr) throw checkErr
    if (clash) throw new Error(`A price for ${values.effdate} already exists.`)
  }
  const { data, error } = await supabase.from(TABLE).update({
    [DATE_COL]: values.effdate,
    [PRICE_COL]: Number(values.unitprice),
  }).eq(PRODUCT_COL, prodcode).eq(DATE_COL, oldDate).select().single()
  if (error) throw error
  return data
}

export async function deletePrice(prodcode, effdate) {
  const { error } = await supabase
    .from(TABLE).delete()
    .eq(PRODUCT_COL, prodcode).eq(DATE_COL, effdate)
  if (error) throw error
}