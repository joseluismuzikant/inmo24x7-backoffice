import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import { getAdminLeads, getTenants } from '../services/adminApi'

const AdminLeads = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tenantIdFromUrl = searchParams.get('tenant_id') || ''

  const [tenants, setTenants] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

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
        const result = await getAdminLeads({ page, pageSize, tenant_id: tenantIdFromUrl })
        setRows(result.items || [])
        setTotal(result.total || 0)
      } catch (fetchError) {
        setRows([])
        setTotal(0)
        setError(fetchError?.response?.data?.error || 'No se pudieron cargar leads')
      } finally {
        setLoading(false)
      }
    }

    fetchRows()
  }, [page, pageSize, tenantIdFromUrl])

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

  return (
    <Layout>
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Leads (Admin)</h1>
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
        </div>

        {error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-gray-600">Cargando leads...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-600">No hay leads para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Tenant</th>
                  <th className="px-2 py-2">Operacion</th>
                  <th className="px-2 py-2">Zona</th>
                  <th className="px-2 py-2">Presupuesto</th>
                  <th className="px-2 py-2">Contacto</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id} className="border-b">
                    <td className="px-2 py-3">{lead.created_at || lead.createdAt || '-'}</td>
                    <td className="px-2 py-3">{lead.tenant_id || '-'}</td>
                    <td className="px-2 py-3">{lead.operacion || '-'}</td>
                    <td className="px-2 py-3">{lead.zona || '-'}</td>
                    <td className="px-2 py-3">{lead.presupuesto_max || lead.presupuestoMax || '-'}</td>
                    <td className="px-2 py-3">{lead.contacto || lead.nombre || '-'}</td>
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
    </Layout>
  )
}

export default AdminLeads
