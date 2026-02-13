import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
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
    // Ensure we always return an array
    const data = response.data
    if (Array.isArray(data)) {
      return data
    } else if (data && typeof data === 'object' && Array.isArray(data.leads)) {
      // Handle response format: { leads: [...] }
      return data.leads
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      // Handle response format: { data: [...] }
      return data.data
    } else {
      console.warn('API response is not an array:', data)
      return []
    }
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
