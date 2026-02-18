import { useState, useRef, useEffect } from 'react'
import { X, Bot, User, Send } from 'lucide-react'
import { sendMessage } from '../services/api'
import '../styles/ChatSimulator.css'

const ChatSimulator = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu agente IA. ¿En qué puedo ayudarte hoy?' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [userId, setUserId] = useState('test-user-123')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await sendMessage(userId, userMessage)
      
      if (response.messages && response.messages.length > 0) {
        const botMessages = response.messages.map(msg => ({
          role: 'assistant',
          content: typeof msg === 'string' ? msg : (msg.text || msg.content || 'Mensaje recibido')
        }))
        setMessages(prev => [...prev, ...botMessages])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Lo siento, no pude procesar tu mensaje. Intenta nuevamente.' 
        }])
      }

      if (response.handoff) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '🔔 Se ha activado el handoff. Un agente humano te contactará pronto.' 
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error al conectar con el servidor. Verifica que el backend esté funcionando.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-header-avatar">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="chat-header-title">Agente IA</h3>
            <p className="chat-header-subtitle">Prueba tu agente en vivo</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="chat-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message-wrapper ${message.role === 'user' ? 'chat-message-wrapper-user' : 'chat-message-wrapper-bot'}`}
          >
            <div
              className={`chat-message ${
                message.role === 'user'
                  ? 'chat-message-user'
                  : 'chat-message-bot'
              }`}
            >
              <div className="chat-message-header">
                {message.role === 'assistant' ? (
                  <Bot size={14} className="chat-message-icon" />
                ) : (
                  <User size={14} />
                )}
                <span className="chat-message-label">
                  {message.role === 'assistant' ? 'Agente IA' : 'Cliente'}
                </span>
              </div>
              <p className="chat-message-text">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-typing-indicator">
            <div className="chat-typing-box">
              <div className="chat-typing-content">
                <Bot size={14} className="chat-message-icon" />
                <div className="chat-typing-dots">
                  <div className="chat-typing-dot" style={{ animationDelay: '0ms' }} />
                  <div className="chat-typing-dot" style={{ animationDelay: '150ms' }} />
                  <div className="chat-typing-dot" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="mb-3">
          <label className="chat-input-label">
            User ID de prueba
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="chat-input"
            placeholder="Ingresa un userId de prueba"
          />
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Envía un mensaje..."
            className="chat-input-field"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="chat-send-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatSimulator
