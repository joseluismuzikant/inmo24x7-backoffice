import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmail } from '../services/supabaseClient'
import '../styles/Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
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
            <p>Sistema exclusivo para administradores</p>
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
