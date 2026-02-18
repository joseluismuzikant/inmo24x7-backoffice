import { useState, useEffect } from 'react'
import { FileText, Trash2, Upload, Smartphone, Mail, Calendar, Play, FileSpreadsheet, FileJson, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import ChatSimulator from '../components/ChatSimulator'
import { getLeads, deleteLead } from '../services/api'
import '../styles/Dashboard.css'

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
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 btn-primary"
          >
            <Play size={18} />
            Probar Agente en Vivo
          </button>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h2 className="dashboard-section-title">
              <Upload size={20} className="text-brand-blue" />
              Base de Conocimiento
            </h2>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`upload-zone ${
                isDragging 
                  ? 'upload-zone-dragging' 
                  : 'upload-zone-default'
              }`}
            >
              <div className="upload-icon-container">
                <Upload size={32} className="text-gray-400" />
              </div>
              <p className="upload-text">
                Arrastra tu Excel (.xlsx) o JSON con el inventario aquí
              </p>
              <p className="upload-subtext">o</p>
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
              <div className="file-list">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-item-content">
                      {file.name.endsWith('.json') ? (
                        <FileJson size={18} className="file-item-icon" />
                      ) : (
                        <FileSpreadsheet size={18} className="file-item-icon" />
                      )}
                      <span className="file-item-name">{file.name}</span>
                      {file.status === 'procesado' && (
                        <span className="file-status-processed">
                          <CheckCircle2 size={14} />
                          Procesado
                        </span>
                      )}
                      {file.status === 'procesando' && (
                        <span className="file-status-processing">Procesando...</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="file-remove-btn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="dashboard-section-title">
              <Smartphone size={20} className="text-brand-blue" />
              Ruteo de Notificaciones
            </h2>

            <div className="space-y-4">
              <div className="notification-item">
                <div className="notification-content">
                  <div className="notification-icon-container notification-icon-container-green">
                    <Smartphone size={20} className="notification-icon-green" />
                  </div>
                  <div>
                    <p className="notification-text">WhatsApp</p>
                    <p className="notification-subtext">Notificaciones por WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification('whatsapp')}
                  className={`toggle-btn ${
                    notifications.whatsapp ? 'toggle-btn-on' : 'toggle-btn-off'
                  }`}
                >
                  <span
                    className={`toggle-indicator ${
                      notifications.whatsapp ? 'toggle-indicator-on' : 'toggle-indicator-off'
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
                    className="notification-input"
                    placeholder="+54 9 11 XXXX XXXX"
                  />
                </div>
              )}

              <div className="notification-item">
                <div className="notification-content">
                  <div className="notification-icon-container notification-icon-container-blue">
                    <Mail size={20} className="notification-icon-blue" />
                  </div>
                  <div>
                    <p className="notification-text">Email</p>
                    <p className="notification-subtext">Notificaciones por correo</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification('email')}
                  className={`toggle-btn ${
                    notifications.email ? 'toggle-btn-on' : 'toggle-btn-off'
                  }`}
                >
                  <span
                    className={`toggle-indicator ${
                      notifications.email ? 'toggle-indicator-on' : 'toggle-indicator-off'
                    }`}
                  />
                </button>
              </div>

              <div className="notification-item">
                <div className="notification-content">
                  <div className="notification-icon-container notification-icon-container-purple">
                    <Calendar size={20} className="notification-icon-purple" />
                  </div>
                  <div>
                    <p className="notification-text">Google Calendar</p>
                    <p className="notification-subtext">Sincronización de citas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {notifications.calendar && (
                    <span className="connected-badge">Conectado</span>
                  )}
                  <button
                    onClick={() => toggleNotification('calendar')}
                    className={`toggle-btn ${
                      notifications.calendar ? 'toggle-btn-on' : 'toggle-btn-off'
                    }`}
                  >
                    <span
                      className={`toggle-indicator ${
                        notifications.calendar ? 'toggle-indicator-on' : 'toggle-indicator-off'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="leads-section">
            <h2 className="leads-section-title">
              <FileText size={20} className="text-brand-blue" />
              Interesados Recientes
            </h2>
            <button
              onClick={fetchLeads}
              className="refresh-btn"
            >
              Actualizar
            </button>
          </div>

          {isLoadingLeads ? (
            <div className="leads-loading">
              <div className="leads-spinner" />
              <p className="leads-loading-text">Cargando leads...</p>
            </div>
          ) : !Array.isArray(leads) || leads.length === 0 ? (
            <div className="leads-empty">
              <FileText size={48} className="leads-empty-icon" />
              <p>No hay leads registrados aún</p>
            </div>
          ) : (
            <>
              <div className="leads-table-container">
                <table className="leads-table">
                  <thead>
                    <tr className="leads-table-header">
                      <th className="leads-table-header-cell">Fecha</th>
                      <th className="leads-table-header-cell">Operación</th>
                      <th className="leads-table-header-cell">Zona</th>
                      <th className="leads-table-header-cell">Presupuesto</th>
                      <th className="leads-table-header-cell">Contacto</th>
                      <th className="leads-table-header-cell-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((lead) => (
                      <tr key={lead.id} className="leads-table-row">
                        <td className="leads-table-cell-gray">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                        <td className="leads-table-cell">
                          <span className={`leads-badge ${
                            lead.operacion === 'venta' 
                              ? 'leads-badge-venta' 
                              : 'leads-badge-alquiler'
                          }`}>
                            {lead.operacion === 'venta' ? 'Venta' : 'Alquiler'}
                          </span>
                        </td>
                        <td className="leads-table-cell-capitalize">{lead.zona || 'N/A'}</td>
                        <td className="leads-table-cell-gray">
                          {lead.presupuestoMax ? `$${lead.presupuestoMax.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="leads-table-cell-gray">
                          {lead.nombre && lead.contacto 
                            ? `${lead.nombre} - ${lead.contacto}`
                            : lead.contacto || lead.nombre || 'N/A'
                          }
                        </td>
                        <td className="leads-table-cell text-right">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="leads-delete-btn"
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
                <div className="pagination-container">
                  <div className="pagination-info">
                    Mostrando <span className="pagination-info-bold">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                    <span className="pagination-info-bold">
                      {Math.min(currentPage * itemsPerPage, leads.length)}
                    </span>{' '}
                    de <span className="pagination-info-bold">{leads.length}</span> resultados
                  </div>
                  
                  <div className="pagination-controls">
                    <button
                      onClick={goToPrevious}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                      title="Página anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="pagination-pages">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`pagination-page-btn ${
                            page === currentPage
                              ? 'pagination-page-btn-active'
                              : 'pagination-page-btn-inactive'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={goToNext}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
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
