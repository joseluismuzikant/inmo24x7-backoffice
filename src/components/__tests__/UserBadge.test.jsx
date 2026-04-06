import { render, screen } from '@testing-library/react'
import UserBadge from '../UserBadge'

describe('UserBadge', () => {
  it('renders nothing without profile', () => {
    const { container } = render(<UserBadge profile={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders email, initials and admin role', () => {
    render(<UserBadge profile={{ email: 'tenant.owner@inmo24x7.com', is_admin: true, role: 'owner' }} />)

    expect(screen.getByText('tenant.owner@inmo24x7.com')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('TO')).toBeInTheDocument()
  })
})
