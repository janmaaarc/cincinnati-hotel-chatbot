import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Loader2, User, BedDouble, UtensilsCrossed, Clock, HelpCircle } from 'lucide-react'
import ContactForm from './ContactForm'
import logger from '../utils/logger'

const QUICK_SUGGESTIONS = [
  { icon: BedDouble, text: 'Room types & rates' },
  { icon: UtensilsCrossed, text: 'Restaurant hours' },
  { icon: Clock, text: 'Check-in time' },
  { icon: HelpCircle, text: 'Hotel amenities' }
]

function ChatInterface() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [lastUnansweredQuestion, setLastUnansweredQuestion] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const lastMessageTimeRef = useRef(0)
  const MESSAGE_COOLDOWN_MS = 1000

  useEffect(() => {
    createSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const createSession = async () => {
    try {
      const response = await fetch('/api/chat/session', {
        method: 'POST'
      })
      const data = await response.json()
      setSessionId(data.sessionId)

      setMessages([{
        role: 'assistant',
        content: "Good day! Welcome to Cincinnati Hotel. I'm your personal concierge assistant. How may I assist you today?",
        timestamp: new Date()
      }])
    } catch (error) {
      logger.error('Error creating session:', error)
      setMessages([{
        role: 'assistant',
        content: "Welcome to Cincinnati Hotel! I'm here to help. What would you like to know?",
        timestamp: new Date()
      }])
    }
  }

  const sendMessage = async (messageText) => {
    const text = messageText || inputValue.trim()
    if (!text || isLoading || !sessionId) return

    const now = Date.now()
    if (now - lastMessageTimeRef.current < MESSAGE_COOLDOWN_MS) {
      return
    }
    lastMessageTimeRef.current = now

    setInputValue('')
    setShowSuggestions(false)

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text
        })
      })

      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        answerFound: data.answerFound,
        timestamp: new Date()
      }])

      if (!data.answerFound) {
        setLastUnansweredQuestion(text)
        setTimeout(() => setShowContactForm(true), 500)
      }
    } catch (error) {
      logger.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize for the inconvenience. I'm experiencing some technical difficulties. Please try again shortly.",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  const handleContactSubmit = async (formData) => {
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionId,
          unansweredQuestion: lastUnansweredQuestion
        })
      })

      setShowContactForm(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Thank you for providing your contact details. A member of our dedicated team will reach out to you shortly.",
        timestamp: new Date()
      }])
    } catch (error) {
      logger.error('Error submitting contact form:', error)
    }
  }

  return (
    <div className="min-h-screen bg-hotel-cream flex flex-col">
      {/* Header */}
      <header className="bg-hotel-dark shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center flex-shrink-0 shadow-lg shadow-hotel-gold/20">
              <span className="text-white font-display text-base md:text-lg font-bold">C</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-display text-white tracking-wide truncate leading-tight">Cincinnati Hotel</h1>
              <p className="text-xs md:text-sm text-hotel-gold tracking-[0.15em] md:tracking-wider uppercase">Virtual Concierge</p>
            </div>
          </div>
          <div className="px-2 md:px-2.5 py-1 bg-emerald-500/20 rounded-lg flex-shrink-0">
            <span className="text-emerald-400 text-xs md:text-sm font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="hidden sm:inline">Online</span>
            </span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 md:gap-3 animate-fadeInUp ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-hotel-charcoal'
                  : 'bg-gradient-to-br from-hotel-gold to-hotel-gold-dark shadow-sm shadow-hotel-gold/20'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 md:w-4.5 md:h-4.5 text-white" />
                ) : (
                  <span className="text-white font-display text-sm md:text-base font-bold">C</span>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] md:max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-hotel-charcoal text-white rounded-br-md'
                      : 'bg-white text-hotel-charcoal rounded-bl-md border border-gray-100'
                  }`}
                >
                  <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs md:text-sm text-gray-500 mt-1 px-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.timestamp ? formatTime(message.timestamp) : ''}
                </p>
              </div>
            </div>
          ))}

          {/* Quick Suggestions */}
          {showSuggestions && messages.length === 1 && !isLoading && (
            <div className="animate-fadeInUp">
              <p className="text-xs md:text-sm text-gray-500 mb-2.5 md:mb-3 text-center uppercase tracking-wider">Quick questions</p>
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-lg md:rounded-xl
                               text-sm md:text-base text-hotel-charcoal hover:border-hotel-gold hover:bg-hotel-gold/5
                               transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <suggestion.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-hotel-gold" />
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-2 md:gap-3 animate-fadeIn">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center flex-shrink-0 shadow-sm shadow-hotel-gold/20">
                <span className="text-white font-display text-sm md:text-base font-bold">C</span>
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 md:px-5 md:py-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-hotel-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-hotel-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-hotel-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-sm text-gray-500">Typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Contact Form */}
        {showContactForm && (
          <ContactForm
            onSubmit={handleContactSubmit}
            onCancel={() => setShowContactForm(false)}
          />
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-3 md:p-4 sticky bottom-0">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2 md:gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  maxLength={1000}
                  autoComplete="off"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 md:py-3.5
                             text-hotel-charcoal placeholder-gray-500 text-base
                             focus:outline-none focus:ring-2 focus:ring-hotel-gold/30 focus:border-hotel-gold/50
                             transition-all"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-br from-hotel-gold to-hotel-gold-dark text-white p-3 md:p-3.5 rounded-xl
                           hover:opacity-90 transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed
                           shadow-lg shadow-hotel-gold/25
                           active:scale-95 flex-shrink-0"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ChatInterface
