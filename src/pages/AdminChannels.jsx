import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import {
  createTenantChannelAdmin,
  getTenantChannelsAdmin,
  getTenants,
  updateChannelAdmin,
} from '../services/adminApi'

const AdminChannels = () => {
  const [tenants, setTenants] = useState([])
  const [tenantId, setTenantId] = useState('')
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [channelForm, setChannelForm] = useState({ type: 'email', target: '' })

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const result = await getTenants({ page: 1, pageSize: 100 })
        const items = result.items || []
        setTenants(items)
        if (items.length > 0) {
          setTenantId(items[0].id)
        }
      } catch (_error) {
        setTenants([])
      }
    }

    loadTenants()
  }, [])

  useEffect(() => {
    if (!tenantId) {
      setChannels([])
      return
    }

    const loadChannels = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await getTenantChannelsAdmin(tenantId)
        setChannels(Array.isArray(result) ? result : [])
      } catch (channelsError) {
        setChannels([])
        setError(channelsError?.response?.data?.error || 'No se pudieron cargar canales del tenant')
      } finally {
        setLoading(false)
      }
    }

    loadChannels()
  }, [tenantId])

  const selectedTenantName = useMemo(
    () => tenants.find((tenant) => String(tenant.id) === String(tenantId))?.name || '-',
    [tenants, tenantId],
  )

  const addChannel = async (event) => {
    event.preventDefault()
    if (!tenantId) {
      setError('Selecciona un tenant para crear canales.')
      return
    }

    setSuccess('')
    setError('')
    try {
      await createTenantChannelAdmin(tenantId, channelForm)
      setChannelForm({ type: 'email', target: '' })
      const result = await getTenantChannelsAdmin(tenantId)
      setChannels(Array.isArray(result) ? result : [])
      setSuccess('Canal agregado al tenant')
    } catch (channelError) {
      setError(channelError?.response?.data?.error || 'No se pudo crear el canal')
    }
  }

  const toggleChannel = async (channel) => {
    setSuccess('')
    setError('')
    try {
      await updateChannelAdmin(channel.id, { is_active: !channel.is_active })
      const result = await getTenantChannelsAdmin(tenantId)
      setChannels(Array.isArray(result) ? result : [])
      setSuccess('Canal actualizado')
    } catch (channelError) {
      setError(channelError?.response?.data?.error || 'No se pudo actualizar canal')
    }
  }

  return (
    <Layout>
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Canales (Admin)</h1>
            <p className="text-sm text-gray-500">Gestion de notificaciones por tenant</p>
          </div>

          <select className="input-field w-auto min-w-52" value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mb-3 rounded bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p> : null}

        <h2 className="text-lg font-semibold">Tenant seleccionado: {selectedTenantName}</h2>

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

        {loading ? (
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
    </Layout>
  )
}

export default AdminChannels
