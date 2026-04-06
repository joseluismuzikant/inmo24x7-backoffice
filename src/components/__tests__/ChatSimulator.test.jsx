import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ChatSimulator from '../ChatSimulator'
import { sendMessage } from '../../services/api'

vi.mock('../../services/api', () => ({
  sendMessage: vi.fn(),
}))

const sendMessageMock = vi.mocked(sendMessage)

describe('ChatSimulator', () => {
  beforeEach(() => {
    sendMessageMock.mockReset()
  })

  it('does not render when closed', () => {
    const { container } = render(<ChatSimulator isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sends a message and renders assistant response', async () => {
    sendMessageMock.mockResolvedValue({ messages: ['Respuesta de prueba'] })

    render(
      <ChatSimulator
        isOpen
        onClose={() => {}}
        tenantOptions={[{ id: 'tenant-1', name: 'Tenant 1' }]}
        selectedTenantId="tenant-1"
        onTenantChange={() => {}}
      />,
    )

    const input = screen.getByPlaceholderText('Envía un mensaje...')
    fireEvent.change(input, { target: { value: 'Hola' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    await waitFor(() => {
      expect(sendMessageMock).toHaveBeenCalledWith(expect.stringMatching(/^test-user-/), 'Hola', 'tenant-1')
    })
    expect(screen.getByText('Respuesta de prueba')).toBeInTheDocument()
  })
})
