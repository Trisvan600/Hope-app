import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PermissionsProvider } from './lib/permissions'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'
import Home from './pages/Home'
import Sprint2Routes from './Sprint2Routes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionsProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/*" element={<ProtectedRoute><Sprint2Routes /></ProtectedRoute>} />
          </Routes>
        </PermissionsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
  
}