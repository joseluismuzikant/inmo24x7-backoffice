import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TenantRoute from '../TenantRoute'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('TenantRoute', () => {
  it('shows profile error when profile is missing', () => {
    mockUseAuth.mockReturnValue({ loading: false, profile: null, isAdmin: false })
    render(<TenantRoute><div>Tenant</div></TenantRoute>)
    expect(screen.getByText('No se pudo cargar el perfil del usuario.')).toBeInTheDocument()
  })

  it('redirects admin users to admin tenants', () => {
    mockUseAuth.mockReturnValue({ loading: false, profile: { id: '1' }, isAdmin: true })

    render(
      <MemoryRouter initialEntries={['/tenant']}>
        <Routes>
          <Route path="/tenant" element={<TenantRoute><div>Tenant</div></TenantRoute>} />
          <Route path="/admin/tenants" element={<div>Admin Tenants</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin Tenants')).toBeInTheDocument()
  })
})
