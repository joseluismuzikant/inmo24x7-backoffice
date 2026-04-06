import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('ProtectedRoute', () => {
  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({ loading: true, user: null })
    render(<ProtectedRoute><div>Private</div></ProtectedRoute>)
    expect(screen.getByText('Cargando sesion...')).toBeInTheDocument()
  })

  it('redirects to login when no user', () => {
    mockUseAuth.mockReturnValue({ loading: false, user: null })

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/private" element={<ProtectedRoute><div>Private</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Screen</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login Screen')).toBeInTheDocument()
  })
})
