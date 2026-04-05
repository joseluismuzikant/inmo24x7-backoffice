import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { signInWithEmail } from '../services/supabaseClient'
import '../styles/Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await signInWithEmail(email, password)
      
      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? 'Credenciales inválidas. Verifica tu email y contraseña.' 
          : error.message)
        return
      }

      if (data.user) {
        navigate('/')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-logo">
              <span className="login-logo-blue">inmo</span>
              <span className="login-logo-green">24x7</span>
            </h1>
            <p className="login-subtitle">Backoffice de Administración</p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-label">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="login-form-group">
              <label className="login-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-btn"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p>Acceso al backoffice de tenants y administracion</p>
          </div>
        </div>

        <div className="login-copyright">
          <p>© 2024 Inmo24x7. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
