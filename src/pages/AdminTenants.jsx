import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import {
  deleteTenant,
  getTenants,
  updateTenantStatus,
} from '../services/adminApi'

const AdminTenants = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchRows = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getTenants({ page, pageSize })
      setRows(result.items || [])
      setTotal(result.total || 0)
    } catch (fetchError) {
      setError(fetchError?.response?.data?.error || 'No se pudo cargar tenants')
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [page, pageSize])

  const onToggleStatus = async (tenant) => {
    const nextStatus = tenant.status === 'active' ? 'disabled' : 'active'
    setSuccess('')
    setError('')

    const previousRows = rows
    setRows((current) => current.map((item) => (item.id === tenant.id ? { ...item, status: nextStatus } : item)))

    try {
      await updateTenantStatus(tenant.id, nextStatus)
      setSuccess(`Tenant ${tenant.name} actualizado a ${nextStatus}`)
    } catch (statusError) {
      setRows(previousRows)
      setError(statusError?.response?.data?.error || 'No se pudo actualizar el estado')
    }
  }

  const onDelete = async (tenant) => {
    const confirmed = window.confirm(
      `Confirmar eliminacion del tenant ${tenant.name} (${tenant.slug || tenant.id})? Esta accion no se puede deshacer.`,
    )
    if (!confirmed) {
      return
    }

    setSuccess('')
    setError('')
    try {
      await deleteTenant(tenant.id)
      setSuccess(`Tenant ${tenant.name} eliminado`)
      await fetchRows()
    } catch (deleteError) {
      setError(deleteError?.response?.data?.error || 'No se pudo eliminar tenant')
    }
  }

  return (
    <Layout>
      <div className="card">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Tenants</h1>
            <p className="text-sm text-gray-500">Administracion global de tenants</p>
          </div>
          <Link className="btn-primary" to="/admin/tenants/new">
            Crear tenant
          </Link>
        </div>

        {error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mb-3 rounded bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p> : null}

        {loading ? (
          <p className="text-sm text-gray-600">Cargando tenants...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-600">No hay tenants para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="px-2 py-2">Tenant</th>
                  <th className="px-2 py-2">Slug</th>
                  <th className="px-2 py-2">Estado</th>
                  <th className="px-2 py-2">Plan</th>
                  <th className="px-2 py-2">Creado</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tenant) => (
                  <tr key={tenant.id} className="border-b align-top">
                    <td className="px-2 py-3 font-medium">{tenant.name || '-'}</td>
                    <td className="px-2 py-3">{tenant.slug || '-'}</td>
                    <td className="px-2 py-3">{tenant.status || '-'}</td>
                    <td className="px-2 py-3">{tenant.plan || '-'}</td>
                    <td className="px-2 py-3">{tenant.createdAt || tenant.created_at || '-'}</td>
                    <td className="px-2 py-3">{tenant.contact_email || tenant.owner_email || '-'}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-secondary" onClick={() => onToggleStatus(tenant)} type="button">
                          {tenant.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn-danger" onClick={() => onDelete(tenant)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
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

export default AdminTenants
