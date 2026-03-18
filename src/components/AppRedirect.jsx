import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AppRedirect = () => {
  const { loading, profile, isAdmin, error } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-text">Cargando aplicacion...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (!profile) {
    return <div className="p-6 text-red-600">Perfil de usuario no disponible.</div>
  }

  return <Navigate to={isAdmin ? '/admin/tenants' : '/leads'} replace />
}

export default AppRedirect
