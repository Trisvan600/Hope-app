// src/components/RequireApproval.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function RequireApproval({ children }) {
  const [loading, setLoading] = useState(true)
  const [userStatus, setUserStatus] = useState(null)

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUserStatus('unauthenticated')
        setLoading(false)
        return
      }

      // 1. Verify email confirmation first
      if (!user.email_confirmed_at) {
        setUserStatus('unverified_email')
        setLoading(false)
        return
      }

      // 2. Query Supabase profiles table for admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single()

      setUserStatus(profile?.status || 'pending')
      setLoading(false)
    }

    checkStatus()
  }, [])

  if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Verifying permissions...</div>

  if (userStatus === 'unverified_email') {
    return (
      <div style={{ background: '#0b1120', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
          <h2>Email Verification Required</h2>
          <p style={{ color: '#9ca3af' }}>Please verify your email address via the link sent to your inbox.</p>
        </div>
      </div>
    )
  }

  if (userStatus === 'pending') {
    return (
      <div style={{ background: '#0b1120', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#f97316' }}>Account Pending Approval</h2>
          <p style={{ color: '#9ca3af' }}>Your email is confirmed! Your account is currently waiting for Super Admin approval before you can access the application.</p>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
            style={{ background: '#374151', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  if (userStatus === 'rejected') {
    return (
      <div style={{ background: '#0b1120', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
          <p style={{ color: '#9ca3af' }}>Your registration request has been rejected by an administrator.</p>
        </div>
      </div>
    )
  }

  // Render main application content if status === 'active'
  return children
}