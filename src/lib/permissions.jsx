import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

export function can(user, permission) {
  return !!user?.permissions?.includes(permission)
}

// Rights come from user_permissions (per user); the context also exposes the user's role and status.

const EMPTY = { userId: null, role: null, status: null, perms: new Set(), loading: true }

const PermissionsContext = createContext({
  ...EMPTY,
  can: () => false,
  isActive: false,
  isAdmin: false,
  isSuperadmin: false,
  isStaff: false,
  refresh: () => {},
})

export function PermissionsProvider({ children }) {
  const [state, setState] = useState(EMPTY)

  const load = useCallback(async () => {
    try {
      // getSession reads the stored session (no network call), so a stale
      // token no longer causes 403 errors on /auth/v1/user.
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null

      if (!user) {
        setState({ ...EMPTY, loading: false })
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('role, status').eq('id', user.id).maybeSingle()

      // If the database rejects the token, clear it and treat the user as logged out.
      if (profileError && (profileError.code === 'PGRST301' || profileError.status === 401 || profileError.status === 403)) {
        await supabase.auth.signOut()
        setState({ ...EMPTY, loading: false })
        return
      }

      const role = profile?.role ?? 'user'
      const status = profile?.status ?? 'pending'

      let perms = new Set()
      if (status === 'active' && role !== 'superadmin') {
        const { data: rows } = await supabase
          .from('user_permissions').select('module, action').eq('user_id', user.id)
        perms = new Set((rows ?? []).map((r) => `${r.module}:${r.action}`))
      }
      setState({ userId: user.id, role, status, perms, loading: false })
    } catch (err) {
      console.error('Failed to load permissions:', err)
      setState({ ...EMPTY, loading: false })
    }
  }, [])

  useEffect(() => {
    load()
    // setTimeout: do not call supabase inside the auth callback directly
    const { data: sub } = supabase.auth.onAuthStateChange(() => setTimeout(load, 0))
    return () => sub.subscription.unsubscribe()
  }, [load])

  const value = useMemo(() => {
    const isActive = state.status === 'active'
    const isSuperadmin = isActive && state.role === 'superadmin'
    const isAdmin = isActive && state.role === 'admin'
    return {
      userId: state.userId,
      role: state.role,
      status: state.status,
      loading: state.loading,
      isActive,
      isSuperadmin,
      isAdmin,
      isStaff: isSuperadmin || isAdmin, // can open User Management
      can: (module, action) => isSuperadmin || (isActive && state.perms.has(`${module}:${action}`)),
      refresh: load,
    }
  }, [state, load])

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export const usePermissions = () => useContext(PermissionsContext)

// Show a page only when the user has the right.
export function RequirePermission({ module, action = 'view', children }) {
  const { can, loading } = usePermissions()
  if (loading) return <p>Loading…</p>
  if (!can(module, action)) return <p className="s2-error">You don't have access to this page.</p>
  return children
}

// Show a page only for certain roles, e.g. <RequireRole roles={['admin','superadmin']}>
export function RequireRole({ roles, children }) {
  const { role, isActive, loading } = usePermissions()
  if (loading) return <p>Loading…</p>
  if (!isActive || !roles.includes(role)) return <p className="s2-error">You don't have access to this page.</p>
  return children
}