import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminRoute from '../AdminRoute'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('AdminRoute', () => {
  it('shows loading message', () => {
    mockUseAuth.mockReturnValue({ loading: true, profile: null, isAdmin: false })
    render(<AdminRoute><div>Admin</div></AdminRoute>)
    expect(screen.getByText('Cargando perfil...')).toBeInTheDocument()
  })

  it('redirects non-admin users to leads', () => {
    mockUseAuth.mockReturnValue({ loading: false, profile: { id: '1' }, isAdmin: false })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><div>Admin</div></AdminRoute>} />
          <Route path="/leads" element={<div>Leads Screen</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Leads Screen')).toBeInTheDocument()
  })
})
