import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TenantRoute = ({ children }) => {
  const { loading, profile, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-text">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return <div className="p-6 text-red-600">No se pudo cargar el perfil del usuario.</div>
  }

  if (isAdmin) {
    return <Navigate to="/admin/tenants" replace />
  }

  return children
}

export default TenantRoute
