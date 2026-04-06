import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppRedirect from '../AppRedirect'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('AppRedirect', () => {
  it('shows loading while auth initializes', () => {
    mockUseAuth.mockReturnValue({ loading: true, profile: null, isAdmin: false, error: null })
    render(<AppRedirect />)
    expect(screen.getByText('Cargando aplicacion...')).toBeInTheDocument()
  })

  it('redirects admin to admin home screen', () => {
    mockUseAuth.mockReturnValue({ loading: false, profile: { id: '1' }, isAdmin: true, error: null })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AppRedirect />} />
          <Route path="/admin/home" element={<div>Admin Home</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin Home')).toBeInTheDocument()
  })
})
