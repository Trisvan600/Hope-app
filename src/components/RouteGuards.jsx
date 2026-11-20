import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
// Only logged-in users may see these pages
export function ProtectedRoute({ children }) {
const { session, loading } = useAuth()
if (loading) return <div className="center-screen">Loading…</div>
if (!session) return <Navigate to="/login" replace />
return children
}
// Keeps logged-in users away from login/register pages
export function PublicOnlyRoute({ children }) {
const { session, loading, recovering } = useAuth()
if (loading) return <div className="center-screen">Loading…</div>
if (session && !recovering) return <Navigate to="/" replace />
return children
}