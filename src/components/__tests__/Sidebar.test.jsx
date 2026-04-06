import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/supabaseClient', () => ({
  signOut: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('Sidebar', () => {
  it('renders admin menu links', () => {
    mockUseAuth.mockReturnValue({ isAdmin: true })

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByText('Tenants')).toBeInTheDocument()
    expect(screen.getByText('Crear tenant')).toBeInTheDocument()
    expect(screen.getByText('Propiedades')).toBeInTheDocument()
  })

  it('renders tenant menu links', () => {
    mockUseAuth.mockReturnValue({ isAdmin: false })

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('Notificaciones')).toBeInTheDocument()
  })
})
