import { useState } from 'react'
import Layout from '../components/Layout'
import ChatSimulator from '../components/ChatSimulator'
import { useEffect } from 'react'
import { getTenants } from '../services/adminApi'

const AdminHome = () => {
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [chatSessionSeed, setChatSessionSeed] = useState(Date.now())
  const [tenants, setTenants] = useState([])
  const [selectedTenantId, setSelectedTenantId] = useState('')

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const result = await getTenants({ page: 1, pageSize: 100 })
        const items = result.items || []
        setTenants(items)
        if (items.length > 0) {
          setSelectedTenantId(items[0].id)
        }
      } catch (_error) {
        setTenants([])
      }
    }

    loadTenants()
  }, [])

  return (
    <Layout>
      <div className="card">
        <h1 className="text-xl font-semibold">Home (Admin)</h1>
        <p className="mt-1 text-sm text-gray-500">Simulador de chatbot disponible para pruebas rápidas.</p>
        {!isChatOpen ? (
          <button
            className="btn-primary mt-3"
            onClick={() => {
              setChatSessionSeed(Date.now())
              setIsChatOpen(true)
            }}
            type="button"
          >
            Abrir simulador
          </button>
        ) : null}
      </div>

      <ChatSimulator
        key={chatSessionSeed}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tenantOptions={tenants}
        selectedTenantId={selectedTenantId}
        onTenantChange={setSelectedTenantId}
      />
    </Layout>
  )
}

export default AdminHome
