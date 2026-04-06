import { fireEvent, render, screen } from '@testing-library/react'
import Pagination from '../Pagination'

describe('Pagination', () => {
  it('renders pagination summary', () => {
    render(<Pagination page={2} pageSize={10} total={35} onPageChange={() => {}} onPageSizeChange={() => {}} />)

    expect(screen.getByText('Pagina 2 de 4 - Total: 35')).toBeInTheDocument()
  })

  it('calls callbacks for page actions', () => {
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

    render(<Pagination page={2} pageSize={10} total={35} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.change(screen.getByLabelText('Por pagina'), { target: { value: '20' } })

    expect(onPageChange).toHaveBeenCalledWith(1)
    expect(onPageChange).toHaveBeenCalledWith(3)
    expect(onPageSizeChange).toHaveBeenCalledWith(20)
  })
})
