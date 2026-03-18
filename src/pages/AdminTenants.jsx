import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import {
  createTenantChannelAdmin,
  deleteTenant,
  getTenantChannelsAdmin,
  getTenants,
  updateChannelAdmin,
  updateTenantStatus,
} from '../services/adminApi'

const AdminTenants = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedTenantForChannels, setSelectedTenantForChannels] = useState(null)
  const [channels, setChannels] = useState([])
  const [channelForm, setChannelForm] = useState({ type: 'email', target: '' })
  const [channelsLoading, setChannelsLoading] = useState(false)

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
    const confirmed = window.confirm(`Eliminar tenant ${tenant.name}? Esta accion no se puede deshacer.`)
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

  const openChannelsEditor = async (tenant) => {
    setSelectedTenantForChannels(tenant)
    setChannelsLoading(true)
    setError('')

    try {
      const result = await getTenantChannelsAdmin(tenant.id)
      setChannels(Array.isArray(result) ? result : [])
    } catch (channelsError) {
      setChannels([])
      setError(channelsError?.response?.data?.error || 'No se pudieron cargar canales del tenant')
    } finally {
      setChannelsLoading(false)
    }
  }

  const addChannel = async (event) => {
    event.preventDefault()
    if (!selectedTenantForChannels?.id) {
      return
    }

    try {
      await createTenantChannelAdmin(selectedTenantForChannels.id, channelForm)
      setChannelForm({ type: 'email', target: '' })
      await openChannelsEditor(selectedTenantForChannels)
      setSuccess('Canal agregado al tenant')
    } catch (channelError) {
      setError(channelError?.response?.data?.error || 'No se pudo crear el canal')
    }
  }

  const toggleChannel = async (channel) => {
    try {
      await updateChannelAdmin(channel.id, { is_active: !channel.is_active })
      await openChannelsEditor(selectedTenantForChannels)
      setSuccess('Canal actualizado')
    } catch (channelError) {
      setError(channelError?.response?.data?.error || 'No se pudo actualizar canal')
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
                        <button className="btn-secondary" onClick={() => navigate(`/admin/leads?tenant_id=${tenant.id}`)} type="button">
                          Leads
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => navigate(`/admin/properties?tenant_id=${tenant.id}`)}
                          type="button"
                        >
                          Properties
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => openChannelsEditor(tenant)}
                          type="button"
                        >
                          Channels
                        </button>
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

        {selectedTenantForChannels ? (
          <div className="mt-6 rounded border border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Canales - {selectedTenantForChannels.name}</h2>

            <form className="mt-3 grid gap-2 md:grid-cols-4" onSubmit={addChannel}>
              <select
                className="input-field"
                value={channelForm.type}
                onChange={(event) => setChannelForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <input
                className="input-field md:col-span-2"
                value={channelForm.target}
                onChange={(event) => setChannelForm((prev) => ({ ...prev, target: event.target.value }))}
                placeholder="Destino"
                required
              />
              <button className="btn-primary" type="submit">
                Agregar canal
              </button>
            </form>

            {channelsLoading ? (
              <p className="mt-3 text-sm text-gray-600">Cargando canales...</p>
            ) : channels.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">No hay canales configurados.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-500">
                      <th className="px-2 py-2">Tipo</th>
                      <th className="px-2 py-2">Destino</th>
                      <th className="px-2 py-2">Activo</th>
                      <th className="px-2 py-2">Default</th>
                      <th className="px-2 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((channel) => (
                      <tr key={channel.id} className="border-b">
                        <td className="px-2 py-2">{channel.type || '-'}</td>
                        <td className="px-2 py-2">{channel.target || channel.value || '-'}</td>
                        <td className="px-2 py-2">{channel.is_active ? 'Si' : 'No'}</td>
                        <td className="px-2 py-2">{channel.is_default ? 'Si' : 'No'}</td>
                        <td className="px-2 py-2">
                          <button className="btn-secondary" onClick={() => toggleChannel(channel)} type="button">
                            {channel.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

export default AdminTenants
