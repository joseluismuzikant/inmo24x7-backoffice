import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Database, BookOpen, Settings, LogOut } from 'lucide-react'
import { signOut } from '../services/supabaseClient'

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
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold">
          <span className="text-white">inmo</span>
          <span className="text-brand-green">24x7</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
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
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
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
