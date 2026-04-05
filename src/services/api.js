import axios from 'axios'
import { supabase } from './supabaseClient'

const apiUrl = import.meta.env.VITE_API_URL || 'https://api.inmo24x7.com'

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

let cachedAccessToken = null
let tokenFetchedAt = 0
const TOKEN_CACHE_TTL_MS = 5000
let lastRefreshAttemptAt = 0

const getAccessToken = async () => {
  if (!supabase) {
    return null
  }

  const now = Date.now()
  if (cachedAccessToken && now - tokenFetchedAt < TOKEN_CACHE_TTL_MS) {
    return cachedAccessToken
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  let token = session?.access_token || null

  if (!token && now - lastRefreshAttemptAt > TOKEN_CACHE_TTL_MS) {
    lastRefreshAttemptAt = now
    try {
      const {
        data: { session: refreshedSession },
      } = await supabase.auth.refreshSession()
      token = refreshedSession?.access_token || null
    } catch (_error) {
      token = null
    }
  }

  cachedAccessToken = token
  tokenFetchedAt = now
  return cachedAccessToken
}

// Request interceptor to add Bearer token and source type
api.interceptors.request.use(
  async (config) => {
    // Get the current session from Supabase
    if (supabase) {
      try {
        const token = await getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error getting session:', error)
      }
    }
    
    // Add source type header to identify backoffice requests
    config.headers['X-Source-Type'] = 'backoffice'
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const getLeads = async () => {
  try {
    const response = await api.get('/api/leads')
    const data = response.data
    
    const leadsArray = Array.isArray(data) 
      ? data 
      : data?.leads || data?.data || []

    return leadsArray.map(lead => ({
      ...lead,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      presupuestoMax: lead.presupuesto_max,
      visitorId: lead.visitor_id,
      sourceType: lead.source_type,
    }))
  } catch (error) {
    console.error('Error in getLeads:', error)
    return []
  }
}

export const getProfile = async () => {
  const response = await api.get('/api/profile')
  return response.data?.profile || response.data?.data || response.data
}

export const normalizePaginatedResponse = (data, fallbackPage = 1, fallbackPageSize = 10) => {
  const isArray = Array.isArray(data)
  if (isArray) {
    return {
      items: data,
      total: data.length,
      page: fallbackPage,
      pageSize: fallbackPageSize,
    }
  }

  const candidates = [
    data?.items,
    data?.data,
    data?.results,
    data?.leads,
    data?.properties,
    data?.tenants,
    data?.rows,
  ]

  const firstArray = candidates.find((candidate) => Array.isArray(candidate))
  let items = firstArray || []

  if (!items.length && data && typeof data === 'object') {
    const nestedArray = Object.values(data).find((value) => Array.isArray(value))
    if (Array.isArray(nestedArray)) {
      items = nestedArray
    }
  }

  const total =
    data?.total ??
    data?.count ??
    data?.pagination?.total ??
    data?.meta?.total ??
    items.length
  const page = data?.page ?? data?.pagination?.page ?? data?.meta?.page ?? fallbackPage
  const pageSize =
    data?.pageSize ??
    data?.page_size ??
    data?.limit ??
    data?.pagination?.pageSize ??
    data?.pagination?.limit ??
    fallbackPageSize
  const totalPages =
    data?.totalPages ??
    data?.total_pages ??
    data?.pagination?.totalPages ??
    data?.meta?.totalPages ??
    Math.max(1, Math.ceil((total || 0) / pageSize))

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export const deleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}`)
  return response.data
}

export const sendMessage = async (userId, text) => {
  const response = await api.post('/message', { userId, text })
  return response.data
}

export default api
