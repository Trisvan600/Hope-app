import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import { ACTIONS, MODULES } from "./module";

// ---------- users (DEV-05 / DEV-06) ----------

// status: 'all' | 'pending' | 'active' | 'blocked' | 'rejected'
export async function listUsers({ search = '', status = 'all' } = {}) {
  let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (status !== 'all') q = q.eq('status', status)
  const s = search.trim().replace(/[%,()]/g, '')
  if (s) q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function countPending() {
  const { count, error } = await supabase
    .from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  if (error) throw error
  return count ?? 0
}

// The database rules (trigger + RLS) decide who may change what; a blocked change returns 0 rows.
export async function updateUser(id, values) {
  const { data, error } = await supabase
    .from('profiles').update(values).eq('id', id).select().maybeSingle()
  if (error) throw error
  if (!data) throw new Error("You're not allowed to change this user.")
  return data
}

export const setStatus = (id, status) => updateUser(id, { status })
export const setRole = (id, role) => updateUser(id, { role })

// Add User. The browser cannot create auth users with the anon key, so we call signUp on a
// throw-away client (no stored session, so the admin stays logged in). The new account is
// 'pending'; a superadmin creating it can activate it straight away.
export async function createUser({ email, password, full_name, role = 'user', activate = false }) {
  const temp = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'adduser-temp' } }
  )
  const { data, error } = await temp.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  })
  if (error) throw error
  if (!data.user || data.user.identities?.length === 0) {
    throw new Error('That email is already registered.')
  }
  const changes = {}
  if (activate) changes.status = 'active'
  if (role !== 'user') changes.role = role
  if (Object.keys(changes).length) await updateUser(data.user.id, changes)
  return data.user
}

// ---------- rights (DEV-07) ----------

// Returns a Set of 'module:action' strings
export async function getUserRights(userId) {
  const { data, error } = await supabase
    .from('user_permissions').select('module, action').eq('user_id', userId)
  if (error) throw error
  return new Set(data.map((r) => `${r.module}:${r.action}`))
}

// checked = Set of 'module:action'. Adds the new ones first, then removes the unticked ones.
export async function saveUserRights(userId, checked) {
  const rows = [...checked].map((k) => {
    const [module, action] = k.split(':')
    return { user_id: userId, module, action }
  })
  if (rows.length) {
    const { error } = await supabase
      .from('user_permissions')
      .upsert(rows, { onConflict: 'user_id,module,action', ignoreDuplicates: true })
    if (error) throw error
  }
  for (const m of MODULES) {
    const unticked = ACTIONS.map((a) => a.key).filter((a) => !checked.has(`${m.key}:${a}`))
    if (!unticked.length) continue
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('module', m.key)
      .in('action', unticked)
    if (error) throw error
  }
}