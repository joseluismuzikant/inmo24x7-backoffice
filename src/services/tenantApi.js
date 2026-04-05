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

export const getTenantLeads = async ({ page = 1, pageSize = 10, search = '' } = {}) => {
  const params = { page, pageSize, limit: pageSize }
  if (search) {
    params.search = search
  }

  const response = await getWithOptionalPagination('/api/leads', params)
  return normalizePaginatedResponse(response.data, page, pageSize)
}

export const getTenantProperties = async ({ page = 1, pageSize = 10, search = '' } = {}) => {
  const params = { page, pageSize, limit: pageSize }
  if (search) {
    params.search = search
  }

  const response = await getWithOptionalPagination('/api/properties', params)
  return normalizePaginatedResponse(response.data, page, pageSize)
}

export const getTenantChannels = async () => {
  const response = await api.get('/api/tenant/channels')
  return response.data?.items || response.data || []
}

export const createTenantChannel = async (payload) => {
  const response = await api.post('/api/tenant/channels', payload)
  return response.data
}

export const updateTenantChannel = async (id, payload) => {
  const response = await api.patch(`/api/tenant/channels/${id}`, payload)
  return response.data
}
