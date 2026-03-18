import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import { getTenantLeads } from '../services/tenantApi'

const TenantLeads = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await getTenantLeads({ page, pageSize, search: appliedSearch })
        setRows(result.items || [])
        setTotal(result.total || 0)
      } catch (fetchError) {
        setRows([])
        setTotal(0)
        setError(fetchError?.response?.data?.error || 'No se pudieron cargar leads')
      } finally {
        setLoading(false)
      }
    }

    fetchRows()
  }, [page, pageSize, appliedSearch])

  return (
    <Layout>
      <div className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Leads</h1>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
              setAppliedSearch(search)
            }}
          >
            <input
              className="input-field"
              placeholder="Buscar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="btn-secondary" type="submit">
              Buscar
            </button>
          </form>
        </div>

        {error ? <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-gray-600">Cargando leads...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-600">No hay leads para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Operacion</th>
                  <th className="px-2 py-2">Zona</th>
                  <th className="px-2 py-2">Presupuesto</th>
                  <th className="px-2 py-2">Contacto</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id} className="border-b">
                    <td className="px-2 py-3">{lead.created_at || lead.createdAt || '-'}</td>
                    <td className="px-2 py-3">{lead.operacion || '-'}</td>
                    <td className="px-2 py-3">{lead.zona || '-'}</td>
                    <td className="px-2 py-3">{lead.presupuesto_max || lead.presupuestoMax || '-'}</td>
                    <td className="px-2 py-3">{lead.contacto || lead.nombre || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPage(1)
            setPageSize(value)
          }}
        />
      </div>
    </Layout>
  )
}

export default TenantLeads
