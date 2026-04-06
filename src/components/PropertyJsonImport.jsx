import { useState } from 'react'
import { importAdminPropertiesJson } from '../services/adminApi'
import { importTenantPropertiesJson } from '../services/tenantApi'

const readFileAsText = (file) => {
  if (typeof file.text === 'function') {
    return file.text()
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsText(file)
  })
}

const PropertyJsonImport = ({ tenantId, onImported, requireTenantSelection = true }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const onFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setError('')
    setResult(null)

    if (requireTenantSelection && !tenantId) {
      setError('Selecciona un tenant para importar propiedades.')
      event.target.value = ''
      return
    }

    setLoading(true)

    try {
      const raw = await readFileAsText(file)
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed?.properties)) {
        throw new Error('El JSON debe incluir { properties: [] }')
      }

      const response = requireTenantSelection
        ? await importAdminPropertiesJson({
            tenantId,
            properties: parsed.properties,
          })
        : await importTenantPropertiesJson({
            properties: parsed.properties,
          })

      setResult(response)
      if (onImported) {
        onImported(response)
      }
    } catch (uploadError) {
      setError(uploadError?.response?.data?.error || uploadError?.message || 'No se pudo importar el archivo JSON')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-3">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-gray-900">Importar propiedades (JSON)</h2>
        <p className="text-xs text-gray-500">
          Carga un archivo con el formato {`{ properties: [...] }`}
          {requireTenantSelection ? ' para el tenant seleccionado.' : '.'}
        </p>
      </div>

      <input
        accept="application/json"
        className="input-field"
        data-testid="property-json-file-input"
        disabled={loading}
        onChange={onFileChange}
        type="file"
      />

      {loading ? <p className="mt-2 text-sm text-gray-600">Importando propiedades...</p> : null}
      {error ? <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-2 rounded bg-emerald-50 p-2 text-sm text-emerald-800">
          <p>Total: {result.total || 0}</p>
          <p>Insertadas: {result.inserted || 0}</p>
          <p>Actualizadas: {result.updated || 0}</p>
          <p>Con error: {result.failed || 0}</p>
        </div>
      ) : null}
    </div>
  )
}

export default PropertyJsonImport
