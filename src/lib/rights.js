import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const ALL = { add: true, edit: true, delete: true }
const NONE = { add: false, edit: false, delete: false }

// who can do what, per module. Change these to your own rules.
const ROLE_RIGHTS = {
  superadmin: { customers: ALL, products: ALL },
  admin:      { customers: ALL, products: ALL },
  user:       { customers: NONE, products: NONE }, // view only
}

export function useRights() {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) { setRole(null); setLoading(false) }
        return
      }
      const { data } = await supabase
        .from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (!cancelled) { setRole(data?.role ?? null); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // can('products', 'add') / can('customers', 'delete') ...
  // Restore counts as 'delete'.
  function can(module, action) {
    return Boolean(ROLE_RIGHTS[role]?.[module]?.[action])
  }

  return { can, role, loading }
}