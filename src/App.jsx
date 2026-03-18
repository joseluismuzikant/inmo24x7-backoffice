import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminTenants from './pages/AdminTenants'
import { useAuth } from './context/AuthContext'

const AdminRoute = ({ children }) => {
  const { profile, isLoading } = useAuth()
  if (isLoading) return <div>Cargando...</div>
  if (!profile || !profile.is_admin) return <Navigate to="/" replace />
  return children
}

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/tenants" element={
            <AdminRoute>
                <AdminTenants />
            </AdminRoute>
        } />
        <Route path="/" element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
