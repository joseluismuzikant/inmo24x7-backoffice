import axios from 'axios'
import { supabase } from './supabaseClient'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add Bearer token and source type
api.interceptors.request.use(
  async (config) => {
    // Get the current session from Supabase
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`
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

export const deleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}`)
  return response.data
}

export const sendMessage = async (userId, text) => {
  const response = await api.post('/message', { userId, text })
  return response.data
}

export default api
