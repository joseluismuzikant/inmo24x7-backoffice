import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import PropertyJsonImport from '../components/PropertyJsonImport'
import { deleteAdminProperty, getAdminProperties, getTenants } from '../services/adminApi'

const AdminProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tenantIdFromUrl = searchParams.get('tenant_id') || ''

  const [tenants, setTenants] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const result = await getTenants({ page: 1, pageSize: 50 })
        setTenants(result.items || [])
      } catch (_error) {
        setTenants([])
      }
    }

    loadTenants()
  }, [])

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await getAdminProperties({ page, pageSize, tenant_id: tenantIdFromUrl })
        setRows(result.items || [])
        setTotal(result.total || 0)
      } catch (fetchError) {
        setRows([])
        setTotal(0)
        setError(fetchError?.response?.data?.error || 'No se pudieron cargar propiedades')
      } finally {
        setLoading(false)
      }
    }

    fetchRows()
  }, [page, pageSize, tenantIdFromUrl, reloadKey])

  useEffect(() => {
    const visibleIds = new Set(rows.map((property) => String(property.id)))
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(String(id))))
  }, [rows])

  const onTenantChange = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set('tenant_id', value)
    } else {
      next.delete('tenant_id')
    }
    setPage(1)
    setSearchParams(next)
  }

  const selectedTenantName = useMemo(
    () => tenants.find((tenant) => String(tenant.id) === String(tenantIdFromUrl))?.name || 'Todos',
    [tenants, tenantIdFromUrl],
  )

  const allPageIds = rows.map((property) => String(property.id))
  const allSelectedOnPage = rows.length > 0 && allPageIds.every((id) => selectedIds.includes(id))

  const onToggleSelect = (propertyId) => {
    const id = String(propertyId)
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const onToggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !allPageIds.includes(id)))
      return
    }

    setSelectedIds((prev) => {
      const next = new Set(prev)
      allPageIds.forEach((id) => next.add(id))
      return Array.from(next)
    })
  }

  const onBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return
    }

    const confirmed = window.confirm(`Eliminar ${selectedIds.length} propiedades seleccionadas? Esta accion no se puede deshacer.`)
    if (!confirmed) {
      return
    }

    setBulkDeleting(true)
    setError('')

    try {
      const results = await Promise.allSettled(selectedIds.map((id) => deleteAdminProperty(id)))
      const failed = results.filter((result) => result.status === 'rejected').length
      const deleted = results.length - failed

      if (failed > 0) {
        setError(`Se eliminaron ${deleted} propiedades y fallaron ${failed}.`)
      }

      setSelectedIds([])
      setReloadKey((prev) => prev + 1)
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <Layout>
      <>
        <div className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Properties (Admin)</h1>
              <p className="text-sm text-gray-500">Tenant seleccionado: {selectedTenantName}</p>
            </div>
            <select
              className="input-field w-auto min-w-52"
              value={tenantIdFromUrl}
              onChange={(event) => onTenantChange(event.target.value)}
            >
              <option value="">Todos los tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>

            <button
              className="btn-danger"
              disabled={selectedIds.length === 0 || bulkDeleting}
              onClick={onBulkDelete}
              type="button"
            >
              {bulkDeleting ? 'Eliminando...' : `Eliminar seleccionadas (${selectedIds.length})`}
            </button>
          </div>

          {error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

          {loading ? (
            <p className="text-sm text-gray-600">Cargando propiedades...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-600">No hay propiedades para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="px-2 py-2">
                    <input aria-label="Seleccionar todas" checked={allSelectedOnPage} onChange={onToggleSelectAll} type="checkbox" />
                  </th>
                  <th className="px-2 py-2">Codigo</th>
                  <th className="px-2 py-2">Tenant</th>
                  <th className="px-2 py-2">Operacion</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2">Zona</th>
                  <th className="px-2 py-2">Precio</th>
                  <th className="px-2 py-2">Estado</th>
                </tr>
                </thead>
                <tbody>
                  {rows.map((property) => (
                    <tr key={property.id} className="border-b">
                      <td className="px-2 py-3">
                        <input
                          aria-label={`Seleccionar propiedad ${property.id}`}
                          checked={selectedIds.includes(String(property.id))}
                          onChange={() => onToggleSelect(property.id)}
                          type="checkbox"
                        />
                      </td>
                      <td className="px-2 py-3">{property.code || property.id}</td>
                      <td className="px-2 py-3">{property.tenant_name || property.tenantName || property.tenant_id || property.tenantId || '-'}</td>
                      <td className="px-2 py-3">{property.operacion || property.operation_type || '-'}</td>
                      <td className="px-2 py-3">{property.tipo || property.type || '-'}</td>
                      <td className="px-2 py-3">{property.zona || property.zone || '-'}</td>
                      <td className="px-2 py-3">{property.precio || property.price || '-'}</td>
                      <td className="px-2 py-3">{property.status || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPage(1)
              setPageSize(value)
            }}
          />
        </div>

        <div className="mt-4">
          <PropertyJsonImport
            tenantId={tenantIdFromUrl}
            onImported={() => {
              setPage(1)
              setReloadKey((prev) => prev + 1)
            }}
          />
        </div>
      </>
    </Layout>
  )
}

export default AdminProperties
