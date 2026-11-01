import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // True when the user arrived via a password-reset email link
  const [recovering, setRecovering] = useState(false)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, 
newSession) => {
      setSession(newSession)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      if (event === 'SIGNED_OUT') setRecovering(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  const value = {
    session,
    user: session?.user ?? null,
    loading,
    recovering,
    setRecovering,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, 
password }),
signUp: (email, password, fullName) =>
supabase.auth.signUp({
email,
password,
options: { data: { full_name: fullName } },
}),
resetPassword: (email) =>
supabase.auth.resetPasswordForEmail(email, {
redirectTo: `${window.location.origin}/update-password`,
}),
updatePassword: (password) => supabase.auth.updateUser({ password }),
signOut: () => supabase.auth.signOut(),
}
return <AuthContext.Provider value={value}>{children}
</AuthContext.Provider>
}
export function useAuth() {
const ctx = useContext(AuthContext)
if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
return ctx
}