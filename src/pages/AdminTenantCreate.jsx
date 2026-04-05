import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Layout from '../components/Layout'
import { getTenantPlans, onboardTenant } from '../services/adminApi'

const initialForm = {
  tenantName: '',
  tenantSlug: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  companyName: '',
  brandName: '',
  address: '',
  city: '',
  province: '',
  country: 'AR',
  logoUrl: '',
  websiteUrl: '',
  ownerEmail: '',
  ownerPassword: '',
  notifyEmail: '',
  whatsappNumber: '',
  planCode: '',
}

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const toDefaultEmail = (slugValue) => {
  const normalizedSlug = toSlug(slugValue)
  return normalizedSlug ? `${normalizedSlug}@inmo24x7.com` : ''
}

const AdminTenantCreate = () => {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [contactEmailManuallyEdited, setContactEmailManuallyEdited] = useState(false)
  const [ownerEmailManuallyEdited, setOwnerEmailManuallyEdited] = useState(false)
  const [showOwnerPassword, setShowOwnerPassword] = useState(false)
  const [planOptions, setPlanOptions] = useState([])

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const rows = await getTenantPlans()
        const codes = Array.from(
          new Set(
            (rows || [])
              .map((plan) => String(plan?.plan_code || '').trim())
              .filter(Boolean),
          ),
        )
        const sortedCodes = codes.sort((a, b) => a.localeCompare(b))
        setPlanOptions(sortedCodes.length ? sortedCodes : ['free'])
      } catch (_error) {
        setPlanOptions(['free'])
      }
    }

    loadPlans()
  }, [])

  useEffect(() => {
    if (!form.planCode && planOptions.length) {
      setForm((prev) => ({ ...prev, planCode: planOptions[0] }))
    }
  }, [form.planCode, planOptions])

  const hasPlansLoaded = useMemo(() => planOptions.length > 0, [planOptions])

  const onChange = (event) => {
    const { name, value } = event.target

    if (name === 'tenantSlug') {
      setSlugManuallyEdited(Boolean(value.trim()))
      const defaultEmail = toDefaultEmail(value)
      setForm((prev) => ({
        ...prev,
        tenantSlug: value,
        contactEmail: contactEmailManuallyEdited ? prev.contactEmail : defaultEmail,
        ownerEmail: ownerEmailManuallyEdited ? prev.ownerEmail : defaultEmail,
      }))
      return
    }

    if (name === 'tenantName') {
      const nextSlug = slugManuallyEdited ? form.tenantSlug : toSlug(value)
      const defaultEmail = toDefaultEmail(nextSlug)
      setForm((prev) => ({
        ...prev,
        tenantName: value,
        tenantSlug: nextSlug,
        contactEmail: contactEmailManuallyEdited ? prev.contactEmail : defaultEmail,
        ownerEmail: ownerEmailManuallyEdited ? prev.ownerEmail : defaultEmail,
      }))
      return
    }

    if (name === 'contactEmail') {
      setContactEmailManuallyEdited(Boolean(value.trim()))
      setForm((prev) => ({ ...prev, contactEmail: value }))
      return
    }

    if (name === 'ownerEmail') {
      setOwnerEmailManuallyEdited(Boolean(value.trim()))
      setForm((prev) => ({ ...prev, ownerEmail: value }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    const payload = {
      tenant: {
        name: form.tenantName,
        slug: form.tenantSlug,
        contact_name: form.contactName || undefined,
        contact_email: form.contactEmail,
        contact_phone: form.contactPhone,
        company_name: form.companyName || undefined,
        brand_name: form.brandName || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        province: form.province || undefined,
        country: form.country || 'AR',
        logo_url: form.logoUrl || null,
        website_url: form.websiteUrl || undefined,
        settings: {},
      },
      owner: {
        email: form.ownerEmail,
        password: form.ownerPassword,
      },
      plan: {
        plan_code: form.planCode,
      },
      channels: [
        form.notifyEmail ? { type: 'email', target: form.notifyEmail, is_default: true } : null,
        form.whatsappNumber ? { type: 'whatsapp', target: form.whatsappNumber } : null,
      ].filter(Boolean),
    }

    try {
      const response = await onboardTenant(payload)
      setResult({
        tenant_id: response?.tenant_id || response?.tenant?.id,
        owner_email: response?.owner_email || form.ownerEmail,
      })
      setForm(initialForm)
      setSlugManuallyEdited(false)
      setContactEmailManuallyEdited(false)
      setOwnerEmailManuallyEdited(false)
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

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Required fields</p>
              <input className="input-field" name="tenantName" placeholder="Name" value={form.tenantName} onChange={onChange} required />
              <input className="input-field" name="tenantSlug" placeholder="Slug" value={form.tenantSlug} onChange={onChange} required />
              <input className="input-field" name="contactPhone" placeholder="Contact phone" value={form.contactPhone} onChange={onChange} required />
              <input className="input-field" name="contactEmail" placeholder="Contact email" type="email" value={form.contactEmail} onChange={onChange} required />
              <input className="input-field" name="ownerEmail" placeholder="Owner email" type="email" value={form.ownerEmail} onChange={onChange} required />
              <div className="relative">
                <input
                  className="input-field pr-10"
                  name="ownerPassword"
                  placeholder="Owner password"
                  type={showOwnerPassword ? 'text' : 'password'}
                  value={form.ownerPassword}
                  onChange={onChange}
                  required
                />
                <button
                  aria-label={showOwnerPassword ? 'Ocultar password' : 'Ver password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  type="button"
                  onClick={() => setShowOwnerPassword((prev) => !prev)}
                >
                  {showOwnerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <select className="input-field" name="planCode" value={form.planCode} onChange={onChange} required disabled={!hasPlansLoaded}>
                {!hasPlansLoaded ? <option value="">Loading plans...</option> : null}
                {planOptions.map((planCode) => (
                  <option key={planCode} value={planCode}>
                    {planCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Optional fields</p>
              <input className="input-field" name="contactName" placeholder="Contact name (optional)" value={form.contactName} onChange={onChange} />
              <input className="input-field" name="companyName" placeholder="Company name (optional)" value={form.companyName} onChange={onChange} />
              <input className="input-field" name="brandName" placeholder="Brand name (optional)" value={form.brandName} onChange={onChange} />
              <input className="input-field" name="address" placeholder="Address (optional)" value={form.address} onChange={onChange} />
              <input className="input-field" name="city" placeholder="City (optional)" value={form.city} onChange={onChange} />
              <input className="input-field" name="province" placeholder="Province (optional)" value={form.province} onChange={onChange} />
              <input className="input-field" name="country" placeholder="Country (optional)" value={form.country} onChange={onChange} />
              <input className="input-field" name="logoUrl" placeholder="Logo URL (optional)" value={form.logoUrl} onChange={onChange} />
              <input className="input-field" name="websiteUrl" placeholder="Website URL (optional)" value={form.websiteUrl} onChange={onChange} />
              <input className="input-field" name="notifyEmail" placeholder="Notify email (optional)" type="email" value={form.notifyEmail} onChange={onChange} />
              <input
                className="input-field"
                name="whatsappNumber"
                placeholder="WhatsApp number (optional)"
                value={form.whatsappNumber}
                onChange={onChange}
              />
            </div>
          </div>

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? 'Creando...' : 'Crear tenant'}
          </button>
        </form>
      </div>
    </Layout>
  )
}

export default AdminTenantCreate
