import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import AdminHome from './pages/AdminHome'
import AdminTenants from './pages/AdminTenants'
import AdminTenantCreate from './pages/AdminTenantCreate'
import AdminChannels from './pages/AdminChannels'
import AdminLeads from './pages/AdminLeads'
import AdminProperties from './pages/AdminProperties'
import TenantLeads from './pages/TenantLeads'
import TenantProperties from './pages/TenantProperties'
import TenantNotifications from './pages/TenantNotifications'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import TenantRoute from './components/TenantRoute'
import AppRedirect from './components/AppRedirect'
import { useAuth } from './context/AuthContext'

const PublicRoute = ({ children }) => {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-text">Cargando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/home"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminHome />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tenants"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminTenants />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tenants/new"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminTenantCreate />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/channels"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminChannels />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminLeads />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminProperties />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <TenantRoute>
                <TenantLeads />
              </TenantRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <TenantRoute>
                <TenantProperties />
              </TenantRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <TenantRoute>
                <TenantNotifications />
              </TenantRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/propiedades" element={<Navigate to="/properties" replace />} />
        <Route path="/conocimiento" element={<Navigate to="/notifications" replace />} />
        <Route path="/configuracion" element={<Navigate to="/notifications" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
