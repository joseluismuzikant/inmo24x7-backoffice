import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Database, BookOpen, Settings, LogOut } from 'lucide-react'
import { signOut } from '../services/supabaseClient'
import '../styles/Sidebar.css'

// Check if Supabase Auth is enabled via environment variable
const isSupabaseAuthEnabled = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true'

const Sidebar = () => {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    // If auth is disabled, just redirect to home (no actual logout needed)
    if (!isSupabaseAuthEnabled) {
      navigate('/')
      return
    }

    setIsLoggingOut(true)
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    }
    setIsLoggingOut(false)
  }

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/propiedades', icon: Database, label: 'Propiedades' },
    { to: '/conocimiento', icon: BookOpen, label: 'Base de Conocimiento' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ]

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          <span className="sidebar-logo-white">inmo</span>
          <span className="sidebar-logo-green">24x7</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {isSupabaseAuthEnabled && (
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="sidebar-logout-btn"
          >
            <LogOut size={20} />
            <span className="font-medium">
              {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
            </span>
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
