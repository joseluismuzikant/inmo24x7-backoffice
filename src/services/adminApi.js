import api, { normalizePaginatedResponse } from './api'

const getWithOptionalPagination = async (url, params) => {
  try {
    return await api.get(url, { params })
  } catch (error) {
    const status = error?.response?.status
    if (status === 400 || status === 404) {
      return api.get(url)
    }
    throw error
  }
}

export const onboardTenant = async (payload) => {
  const response = await api.post('/admin/onboard', payload)
  return response.data
}

export const getTenants = async ({ page = 1, pageSize = 10 } = {}) => {
  const response = await api.get('/admin/tenants', { params: { page, pageSize, limit: pageSize } })
  return normalizePaginatedResponse(response.data, page, pageSize)
}

export const getTenantPlans = async () => {
  const response = await api.get('/admin/tenant-plans')
  return response.data?.items || response.data || []
}

export const updateTenantStatus = async (id, status) => {
  const response = await api.patch(`/admin/tenants/${id}/status`, { status })
  return response.data
}

export const deleteTenant = async (id) => {
  const response = await api.delete(`/admin/tenants/${id}`)
  return response.data
}

export const getAdminLeads = async ({ page = 1, pageSize = 10, tenant_id = '' } = {}) => {
  const params = { page, pageSize, limit: pageSize }
  if (tenant_id) {
    params.tenant_id = tenant_id
  }

  const response = await getWithOptionalPagination('/api/leads', params)
  return normalizePaginatedResponse(response.data, page, pageSize)
}

export const getAdminProperties = async ({ page = 1, pageSize = 10, tenant_id = '' } = {}) => {
  const params = { page, pageSize, limit: pageSize }
  if (tenant_id) {
    params.tenant_id = tenant_id
  }

  const response = await getWithOptionalPagination('/api/properties', params)
  return normalizePaginatedResponse(response.data, page, pageSize)
}

export const importAdminPropertiesJson = async ({ tenantId, properties }) => {
  const payload = {
    tenant_id: tenantId,
    properties,
  }
  const response = await api.post('/api/properties/import-json', payload)
  return response.data
}

export const deleteAdminProperty = async (id) => {
  const response = await api.delete(`/api/properties/${id}`)
  return response.data
}

export const getTenantChannelsAdmin = async (tenantId) => {
  const response = await api.get(`/admin/tenants/${tenantId}/channels`)
  return response.data?.items || response.data || []
}

export const createTenantChannelAdmin = async (tenantId, payload) => {
  const response = await api.post(`/admin/tenants/${tenantId}/channels`, payload)
  return response.data
}

export const updateChannelAdmin = async (channelId, payload) => {
  const response = await api.patch(`/admin/channels/${channelId}`, payload)
  return response.data
}
