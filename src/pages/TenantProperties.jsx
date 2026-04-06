import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Pagination from '../components/Pagination'
import PropertyJsonImport from '../components/PropertyJsonImport'
import { getTenantProperties } from '../services/tenantApi'

const TenantProperties = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await getTenantProperties({ page, pageSize, search: appliedSearch })
        setRows(result.items || [])
        setTotal(result.total || 0)
      } catch (fetchError) {
        setRows([])
        setTotal(0)
        setError(fetchError?.response?.data?.error || 'No se pudieron cargar propiedades')
      } finally {
        setLoading(false)
      }
    }

    fetchRows()
  }, [page, pageSize, appliedSearch, reloadKey])

  return (
    <Layout>
      <>
        <div className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">Properties</h1>
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
            <p className="text-sm text-gray-600">Cargando propiedades...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-600">No hay propiedades para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                <tr className="border-b text-xs uppercase text-gray-500">
                  <th className="px-2 py-2">Codigo</th>
                  <th className="px-2 py-2">Operacion</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2">Zona</th>
                  <th className="px-2 py-2">Precio</th>
                  <th className="px-2 py-2">Estado</th>
                </tr>
                </thead>
                <tbody>
                  {rows.map((property) => (
                  <tr key={property.id} className="border-b">
                    <td className="px-2 py-3">{property.code || property.id}</td>
                    <td className="px-2 py-3">{property.operacion || property.operation_type || '-'}</td>
                    <td className="px-2 py-3">{property.tipo || property.type || '-'}</td>
                    <td className="px-2 py-3">{property.zona || property.zone || '-'}</td>
                    <td className="px-2 py-3">{property.precio || property.price || '-'}</td>
                    <td className="px-2 py-3">{property.status || '-'}</td>
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

        <div className="mt-4">
          <PropertyJsonImport
            requireTenantSelection={false}
            onImported={() => {
              setPage(1)
              setReloadKey((prev) => prev + 1)
            }}
          />
        </div>
      </>
    </Layout>
  )
}

export default TenantProperties
