import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { onboardTenant } from '../services/adminApi'

const initialForm = {
  tenantName: '',
  tenantSlug: '',
  ownerEmail: '',
  ownerPassword: '',
  notifyEmail: '',
  whatsappNumber: '',
  plan: '',
}

const AdminTenantCreate = () => {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    const payload = {
      tenant_name: form.tenantName,
      tenant_slug: form.tenantSlug,
      owner_email: form.ownerEmail,
      owner_password: form.ownerPassword,
      notify_email: form.notifyEmail || undefined,
      plan: form.plan || undefined,
      whatsapp: form.whatsappNumber ? { number: form.whatsappNumber } : undefined,
    }

    try {
      const response = await onboardTenant(payload)
      setResult({
        tenant_id: response?.tenant_id || response?.tenant?.id,
        owner_email: response?.owner_email || form.ownerEmail,
      })
      setForm(initialForm)
    } catch (submitError) {
      setError(submitError?.response?.data?.error || 'No se pudo crear el tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="card max-w-2xl">
        <h1 className="mb-1 text-xl font-semibold">Crear tenant</h1>
        <p className="mb-4 text-sm text-gray-500">Onboarding de tenant y owner</p>

        {error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

        {result ? (
          <div className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800">
            <p>Tenant creado correctamente.</p>
            <p>tenant_id: {result.tenant_id || 'No devuelto por API'}</p>
            <p>owner_email: {result.owner_email}</p>
            <Link className="mt-2 inline-block text-brand-blue underline" to="/admin/tenants">
              Volver al listado
            </Link>
          </div>
        ) : null}

        <form className="space-y-3" onSubmit={onSubmit}>
          <input className="input-field" name="tenantName" placeholder="Tenant name" value={form.tenantName} onChange={onChange} required />
          <input className="input-field" name="tenantSlug" placeholder="Tenant slug" value={form.tenantSlug} onChange={onChange} required />
          <input className="input-field" name="ownerEmail" placeholder="Owner email" type="email" value={form.ownerEmail} onChange={onChange} required />
          <input
            className="input-field"
            name="ownerPassword"
            placeholder="Owner password"
            type="password"
            value={form.ownerPassword}
            onChange={onChange}
            required
          />
          <input className="input-field" name="notifyEmail" placeholder="Notify email (optional)" type="email" value={form.notifyEmail} onChange={onChange} />
          <input
            className="input-field"
            name="whatsappNumber"
            placeholder="WhatsApp number (optional)"
            value={form.whatsappNumber}
            onChange={onChange}
          />
          <input className="input-field" name="plan" placeholder="Plan (optional)" value={form.plan} onChange={onChange} />

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? 'Creando...' : 'Crear tenant'}
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default AdminTenantCreate
