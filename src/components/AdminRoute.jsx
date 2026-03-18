import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
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

  if (!profile || !isAdmin) {
    return <Navigate to="/leads" replace />
  }

  return children
}

export default AdminRoute
