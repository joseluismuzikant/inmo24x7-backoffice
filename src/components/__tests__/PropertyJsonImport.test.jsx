import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PropertyJsonImport from '../PropertyJsonImport'
import { importAdminPropertiesJson } from '../../services/adminApi'
import { importTenantPropertiesJson } from '../../services/tenantApi'

vi.mock('../../services/adminApi', () => ({
  importAdminPropertiesJson: vi.fn(),
}))

vi.mock('../../services/tenantApi', () => ({
  importTenantPropertiesJson: vi.fn(),
}))

const importAdminPropertiesJsonMock = vi.mocked(importAdminPropertiesJson)
const importTenantPropertiesJsonMock = vi.mocked(importTenantPropertiesJson)

describe('PropertyJsonImport', () => {
  beforeEach(() => {
    importAdminPropertiesJsonMock.mockReset()
    importTenantPropertiesJsonMock.mockReset()
  })

  it('shows an error when tenant is not selected', async () => {
    render(<PropertyJsonImport tenantId="" />)

    const file = new File([JSON.stringify({ properties: [{ id: 'p1' }] })], 'properties.json', {
      type: 'application/json',
    })

    fireEvent.change(screen.getByTestId('property-json-file-input'), {
      target: { files: [file] },
    })

    expect(screen.getByText('Selecciona un tenant para importar propiedades.')).toBeInTheDocument()
    expect(importAdminPropertiesJsonMock).not.toHaveBeenCalled()
  })

  it('imports JSON and shows summary', async () => {
    importAdminPropertiesJsonMock.mockResolvedValue({
      total: 1,
      inserted: 1,
      updated: 0,
      failed: 0,
      errors: [],
    })

    const onImported = vi.fn()
    render(<PropertyJsonImport tenantId="tenant-1" onImported={onImported} />)

    const file = new File(
      [
        JSON.stringify({
          properties: [
            {
              id: 'prop-palermo-001',
              url: 'https://inmo24x7.com/properties/prop-palermo-001',
              title: 'Departamento 3 ambientes',
              operation_type: 'venta',
              price_amount: 120000,
              price_currency: 'USD',
              real_estate_type: 'departamento',
              address_name: 'Palermo, CABA',
            },
          ],
        }),
      ],
      'properties.json',
      { type: 'application/json' },
    )

    fireEvent.change(screen.getByTestId('property-json-file-input'), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(importAdminPropertiesJsonMock).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
        properties: [
          {
            id: 'prop-palermo-001',
            url: 'https://inmo24x7.com/properties/prop-palermo-001',
            title: 'Departamento 3 ambientes',
            operation_type: 'venta',
            price_amount: 120000,
            price_currency: 'USD',
            real_estate_type: 'departamento',
            address_name: 'Palermo, CABA',
          },
        ],
      })
    })

    expect(screen.getByText('Insertadas: 1')).toBeInTheDocument()
    expect(onImported).toHaveBeenCalledTimes(1)
  })

  it('imports in tenant mode without tenant selection', async () => {
    importTenantPropertiesJsonMock.mockResolvedValue({
      total: 1,
      inserted: 1,
      updated: 0,
      failed: 0,
      errors: [],
    })

    render(<PropertyJsonImport requireTenantSelection={false} />)

    const file = new File(
      [
        JSON.stringify({
          properties: [
            {
              id: 'prop-1',
              url: 'https://inmo24x7.com/properties/prop-1',
              title: 'Departamento',
              operation_type: 'venta',
              price_amount: 100000,
              price_currency: 'USD',
              real_estate_type: 'departamento',
              address_name: 'Palermo',
            },
          ],
        }),
      ],
      'properties.json',
      { type: 'application/json' },
    )

    fireEvent.change(screen.getByTestId('property-json-file-input'), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(importTenantPropertiesJsonMock).toHaveBeenCalledWith({
        properties: [
          {
            id: 'prop-1',
            url: 'https://inmo24x7.com/properties/prop-1',
            title: 'Departamento',
            operation_type: 'venta',
            price_amount: 100000,
            price_currency: 'USD',
            real_estate_type: 'departamento',
            address_name: 'Palermo',
          },
        ],
      })
    })
  })
})
