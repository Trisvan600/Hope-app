import { supabase } from '../../lib/supabaseClient'

const TABLE = 'customer'

export const PAY_TERMS = ['30D', '45D', 'COD'] // add any other terms you use

function makeStamp(action, who) {
  const d = new Date()
  const date = d.toLocaleDateString('en-CA') // 2026-11-07
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  return `${action} ${who || 'system'} ${date} ${time}`
}

async function currentUserEmail() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email
}

// view: 'active' (is_deleted = false) or 'deleted' (is_deleted = true)
export async function fetchCustomers({ search = '', payTerms = '', view = 'active' } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not logged in. Please log in again.')

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('is_deleted', view === 'deleted')
    .order('custno', { ascending: true })

  const term = search.trim().replace(/[,()]/g, ' ')
  if (term) {
    query = query.or(
      `custno.ilike.%${term}%,custname.ilike.%${term}%,address.ilike.%${term}%`
    )
  }
  if (payTerms) query = query.eq('payterm', payTerms)

  const { data, error, count } = await query
  if (error) throw error
  return { rows: data ?? [], total: count ?? 0 }
}

export async function getCustomer(custno) {
  const { data, error } = await supabase
    .from(TABLE).select('*').eq('custno', custno).single()
  if (error) throw error
  return data
}

export async function createCustomer(values) {
  const custno = values.custno.trim().toUpperCase()

  const { data: existing, error: checkErr } = await supabase
    .from(TABLE).select('custno').eq('custno', custno).maybeSingle()
  if (checkErr) throw checkErr
  if (existing) throw new Error(`Customer number ${custno} already exists.`)

  const { data, error } = await supabase.from(TABLE).insert({
    custno,
    custname: values.custname.trim(),
    address: values.address.trim(),
    payterm: values.payterm,
    is_deleted: false,
    stamp: makeStamp('ADD', await currentUserEmail()),
  }).select().single()
  if (error) throw error
  return data
}

export async function updateCustomer(custno, values) {
  const { data, error } = await supabase.from(TABLE).update({
    custname: values.custname.trim(),
    address: values.address.trim(),
    payterm: values.payterm,
    stamp: makeStamp('EDIT', await currentUserEmail()),
  }).eq('custno', custno).select().single()
  if (error) throw error
  return data
}

// ---- S2-DEV-03: soft delete and restore ----

export async function softDeleteCustomer(custno) {
  const { data, error } = await supabase.from(TABLE).update({
    is_deleted: true,
    stamp: makeStamp('DEL', await currentUserEmail()),
  }).eq('custno', custno).select().single()
  if (error) throw error
  return data
}

export async function restoreCustomer(custno) {
  const { data, error } = await supabase.from(TABLE).update({
    is_deleted: false,
    stamp: makeStamp('RESTORE', await currentUserEmail()),
  }).eq('custno', custno).select().single()
  if (error) throw error
  return data
}