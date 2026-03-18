import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { createTenantChannel, getTenantChannels, updateTenantChannel } from '../services/tenantApi'

const emptyForm = {
  type: 'email',
  target: '',
  is_active: true,
  is_default: false,
}

const TenantNotifications = () => {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)

  const fetchChannels = async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await getTenantChannels()
      setChannels(Array.isArray(rows) ? rows : [])
    } catch (fetchError) {
      setChannels([])
      setError(fetchError?.response?.data?.error || 'No se pudieron cargar canales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChannels()
  }, [])

  const onCreate = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await createTenantChannel(form)
      setForm(emptyForm)
      setSuccess('Canal creado correctamente')
      await fetchChannels()
    } catch (createError) {
      setError(createError?.response?.data?.error || 'No se pudo crear canal')
    } finally {
      setSubmitting(false)
    }
  }

  const onPatch = async (id, payload) => {
    setError('')
    setSuccess('')
    try {
      await updateTenantChannel(id, payload)
      setSuccess('Canal actualizado')
      await fetchChannels()
    } catch (patchError) {
      setError(patchError?.response?.data?.error || 'No se pudo actualizar canal')
    }
  }

  return (
    <Layout>
      <div className="card">
        <h1 className="mb-1 text-xl font-semibold">Notificaciones</h1>
        <p className="mb-4 text-sm text-gray-500">Canales del tenant autenticado</p>

        {error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mb-3 rounded bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p> : null}

        <form className="mb-5 grid gap-2 md:grid-cols-4" onSubmit={onCreate}>
          <select
            className="input-field"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <input
            className="input-field md:col-span-2"
            placeholder="Destino (email o numero)"
            value={form.target}
            onChange={(event) => setForm((prev) => ({ ...prev, target: event.target.value }))}
            required
          />
          <button className="btn-primary" disabled={submitting} type="submit">
            {submitting ? 'Guardando...' : 'Crear canal'}
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-gray-600">Cargando canales...</p>
        ) : channels.length === 0 ? (
          <p className="text-sm text-gray-600">No hay canales configurados.</p>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="px-2 py-3">{channel.type || '-'}</td>
                    <td className="px-2 py-3">{channel.target || channel.value || '-'}</td>
                    <td className="px-2 py-3">{channel.is_active ? 'Si' : 'No'}</td>
                    <td className="px-2 py-3">{channel.is_default ? 'Si' : 'No'}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => onPatch(channel.id, { is_active: !channel.is_active })}
                        >
                          {channel.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn-secondary" type="button" onClick={() => onPatch(channel.id, { is_default: true })}>
                          Marcar default
                        </button>
                      </div>
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

export default TenantNotifications
