import { useState, useEffect } from 'react'
import { FileText, Trash2, Upload, MessageSquare, Smartphone, Mail, Calendar, Bot, Play, FileSpreadsheet, FileJson, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import ChatSimulator from '../components/ChatSimulator'
import { getLeads, deleteLead } from '../services/api'

const Dashboard = () => {
  const [leads, setLeads] = useState([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: false,
    calendar: false
  })
  const [whatsappNumber, setWhatsappNumber] = useState('+54 9 11')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setIsLoadingLeads(true)
      const data = await getLeads()
      // Ensure data is always an array
      setLeads(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      setLeads([])
    } finally {
      setIsLoadingLeads(false)
    }
  }

  const handleDeleteLead = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este lead?')) return
    
    try {
      await deleteLead(id)
      setLeads(prev => Array.isArray(prev) ? prev.filter(lead => lead.id !== id) : [])
      // Reset to first page if current page becomes empty
      const newTotalPages = Math.ceil((leads.length - 1) / itemsPerPage)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Error al eliminar el lead')
    }
  }

  // Pagination logic
  const totalPages = Math.ceil((leads?.length || 0) / itemsPerPage)
  const paginatedLeads = leads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  
  const goToPrevious = () => goToPage(currentPage - 1)
  const goToNext = () => goToPage(currentPage + 1)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    handleFiles(files)
  }

  const handleFiles = (files) => {
    const validFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.json')
    )

    if (validFiles.length === 0) {
      alert('Por favor, sube solo archivos Excel (.xlsx, .xls) o JSON (.json)')
      return
    }

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      status: 'procesando'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    console.log('Archivos recibidos:', validFiles)

    setTimeout(() => {
      setUploadedFiles(prev => 
        prev.map(file => 
          newFiles.find(nf => nf.id === file.id) 
            ? { ...file, status: 'procesado' }
            : file
        )
      )
    }, 2000)
  }

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const toggleNotification = (channel) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }))
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 btn-primary"
          >
            <Play size={18} />
            Probar Agente en Vivo
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload size={20} className="text-brand-blue" />
              Base de Conocimiento
            </h2>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging 
                  ? 'border-brand-blue bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Upload size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">
                Arrastra tu Excel (.xlsx) o JSON con el inventario aquí
              </p>
              <p className="text-sm text-gray-400 mb-4">o</p>
              <label className="btn-secondary cursor-pointer inline-block">
                <input
                  type="file"
                  accept=".xlsx,.xls,.json"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                Seleccionar archivos
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {file.name.endsWith('.json') ? (
                        <FileJson size={18} className="text-brand-green" />
                      ) : (
                        <FileSpreadsheet size={18} className="text-brand-green" />
                      )}
                      <span className="text-sm font-medium">{file.name}</span>
                      {file.status === 'procesado' && (
                        <span className="flex items-center gap-1 text-xs text-brand-green">
                          <CheckCircle2 size={14} />
                          Procesado
                        </span>
                      )}
                      {file.status === 'procesando' && (
                        <span className="text-xs text-gray-500">Procesando...</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone size={20} className="text-brand-blue" />
              Ruteo de Notificaciones
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone size={20} className="text-brand-green" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-gray-500">Notificaciones por WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification('whatsapp')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.whatsapp ? 'bg-brand-green' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications.whatsapp ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {notifications.whatsapp && (
                <div className="ml-14">
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="input-field text-sm"
                    placeholder="+54 9 11 XXXX XXXX"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-500">Notificaciones por correo</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification('email')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-brand-green' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Google Calendar</p>
                    <p className="text-sm text-gray-500">Sincronización de citas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {notifications.calendar && (
                    <span className="text-xs text-green-600 font-medium">Conectado</span>
                  )}
                  <button
                    onClick={() => toggleNotification('calendar')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications.calendar ? 'bg-brand-green' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.calendar ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText size={20} className="text-brand-blue" />
              Interesados Recientes
            </h2>
            <button
              onClick={fetchLeads}
              className="text-sm text-brand-blue hover:text-brand-blue-dark font-medium"
            >
              Actualizar
            </button>
          </div>

          {isLoadingLeads ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Cargando leads...</p>
            </div>
          ) : !Array.isArray(leads) || leads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-30" />
              <p>No hay leads registrados aún</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Operación</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Zona</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Presupuesto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Contacto</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-gray-600">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                            lead.operacion === 'venta' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {lead.operacion === 'venta' ? 'Venta' : 'Alquiler'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium capitalize">{lead.zona || 'N/A'}</td>
                        <td className="py-4 px-4 text-gray-600">
                          {lead.presupuestoMax ? `$${lead.presupuestoMax.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {lead.nombre && lead.contacto 
                            ? `${lead.nombre} - ${lead.contacto}`
                            : lead.contacto || lead.nombre || 'N/A'
                          }
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar lead"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, leads.length)}
                    </span>{' '}
                    de <span className="font-medium">{leads.length}</span> resultados
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevious}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Página anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-brand-blue text-white'
                              : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={goToNext}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Página siguiente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ChatSimulator isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Layout>
  )
}

export default Dashboard
