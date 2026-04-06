import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/supabaseClient', () => ({
  signOut: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('Layout', () => {
  it('renders children and user badge', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: false,
      profile: { email: 'owner@inmo24x7.com', role: 'owner', is_admin: false },
    })

    render(
      <MemoryRouter>
        <Layout>
          <div>Inner Page Content</div>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getByText('Inner Page Content')).toBeInTheDocument()
    expect(screen.getByText('owner@inmo24x7.com')).toBeInTheDocument()
  })
})
