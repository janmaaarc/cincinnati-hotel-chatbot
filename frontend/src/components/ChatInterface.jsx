import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Loader2, User, BedDouble, UtensilsCrossed, Clock, Wifi, Car, Sparkles, ChevronUp, ChevronDown, HelpCircle, RefreshCw, Copy, Check } from 'lucide-react'
import ContactForm from './ContactForm'
import logger from '../utils/logger'
import { getApiUrl } from '../config'

const QUICK_SUGGESTIONS = [
  { icon: BedDouble, text: 'What are your room rates?' },
  { icon: Clock, text: 'What time is check-in?' },
  { icon: Wifi, text: 'Is WiFi free?' },
  { icon: Car, text: 'Do you have parking?' },
  { icon: UtensilsCrossed, text: 'What restaurants are on-site?' },
  { icon: Sparkles, text: 'Do you have a spa?' }
]

const STORAGE_KEY = 'cincinnati_hotel_chat'
const MAX_CHARS = 1000
const MAX_RETRIES = 3
const RETRY_DELAY = 1000
const LOCALSTORAGE_DEBOUNCE_MS = 1000

// Generate unique message ID
const generateMessageId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Simple debounce function
const debounce = (fn, ms) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}

const formatRelativeTime = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return { relative: '', absolute: '' }
  }
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  const absolute = date.toLocaleString()

  if (diff < 60) return { relative: 'Just now', absolute }
  if (diff < 3600) {
    const mins = Math.floor(diff / 60)
    return { relative: `${mins} min${mins > 1 ? 's' : ''} ago`, absolute }
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return { relative: `${hours} hour${hours > 1 ? 's' : ''} ago`, absolute }
  }
  return { relative: date.toLocaleDateString(), absolute }
}

function ChatInterface() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [lastUnansweredQuestion, setLastUnansweredQuestion] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showQuickPanel, setShowQuickPanel] = useState(false)
  const [retryMessage, setRetryMessage] = useState(null)
  const [toast, setToast] = useState(null)
  const [copiedMessageId, setCopiedMessageId] = useState(null)
  const messagesEndRef = useRef(null)
  const lastMessageTimeRef = useRef(0)
  const prevMessagesLengthRef = useRef(0)
  const abortControllerRef = useRef(null)
  const MESSAGE_COOLDOWN_MS = 1000

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Copy message to clipboard
  const copyToClipboard = useCallback(async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      showToast('Copied to clipboard')
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      showToast('Failed to copy', 'error')
    }
  }, [showToast])

  // Debounced localStorage save
  const debouncedSave = useMemo(
    () => debounce((data) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (error) {
        logger.error('Error saving to localStorage:', error)
      }
    }, LOCALSTORAGE_DEBOUNCE_MS),
    []
  )

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { sessionId: savedSession, messages: savedMessages } = JSON.parse(saved)
        if (savedSession && savedMessages?.length > 0) {
          setSessionId(savedSession)
          setMessages(savedMessages.map(m => ({
            ...m,
            id: m.id || generateMessageId(),
            timestamp: new Date(m.timestamp)
          })))
          setShowSuggestions(savedMessages.length <= 1)
          prevMessagesLengthRef.current = savedMessages.length
          return
        }
      } catch (e) {
        logger.error('Error loading saved chat:', e)
      }
    }
    createSession()

    // Cleanup abort controller on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Debounced save to localStorage when messages change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      debouncedSave({
        sessionId,
        messages: messages.map(m => ({
          ...m,
          timestamp: m.timestamp?.toISOString()
        }))
      })
    }
  }, [sessionId, messages, debouncedSave])

  // Conditional scroll - only when new messages added
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom()
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date) => {
    const { relative, absolute } = formatRelativeTime(date)
    return { relative, absolute }
  }

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY)
    setMessages([])
    setSessionId(null)
    setShowSuggestions(true)
    setRetryMessage(null)
    prevMessagesLengthRef.current = 0
    showToast('Chat history cleared')
    createSession()
  }

  const createSession = async () => {
    abortControllerRef.current = new AbortController()
    try {
      const response = await fetch(getApiUrl('/api/chat/session'), {
        method: 'POST',
        signal: abortControllerRef.current.signal
      })
      const data = await response.json()
      setSessionId(data.sessionId)

      const welcomeMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: "Good day! Welcome to Cincinnati Hotel. I'm your personal concierge assistant. How may I assist you today?",
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      prevMessagesLengthRef.current = 1
    } catch (error) {
      if (error.name === 'AbortError') return
      logger.error('Error creating session:', error)
      const fallbackMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: "Welcome to Cincinnati Hotel! I'm here to help. What would you like to know?",
        timestamp: new Date()
      }
      setMessages([fallbackMessage])
      prevMessagesLengthRef.current = 1
    }
  }

  const sendMessageWithRetry = useCallback(async (text, retryCount = 0) => {
    try {
      abortControllerRef.current = new AbortController()
      const response = await fetch(getApiUrl('/api/chat/message'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setRetryMessage(null)

      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'assistant',
        content: data.answer,
        answerFound: data.answerFound,
        timestamp: new Date()
      }])

      if (!data.answerFound) {
        setLastUnansweredQuestion(text)
        setTimeout(() => setShowContactForm(true), 500)
      }
      return true
    } catch (error) {
      if (error.name === 'AbortError') return false
      logger.error(`Error sending message (attempt ${retryCount + 1}):`, error)

      if (retryCount < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
        return sendMessageWithRetry(text, retryCount + 1)
      }

      setRetryMessage(text)
      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'assistant',
        content: "I apologize for the inconvenience. I'm experiencing some technical difficulties.",
        isError: true,
        timestamp: new Date()
      }])
      return false
    }
  }, [sessionId])

  const sendMessage = async (messageText) => {
    const text = messageText || inputValue.trim()

    // Check isLoading first to prevent race condition
    if (isLoading || !text || !sessionId) return

    const now = Date.now()
    if (now - lastMessageTimeRef.current < MESSAGE_COOLDOWN_MS) {
      return
    }

    // Set loading immediately to prevent double-sends
    setIsLoading(true)
    lastMessageTimeRef.current = now

    setInputValue('')
    setShowSuggestions(false)
    setRetryMessage(null)

    const userMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    await sendMessageWithRetry(text)
    setIsLoading(false)
  }

  const handleRetry = () => {
    if (retryMessage) {
      setMessages(prev => prev.filter(m => !m.isError))
      setIsLoading(true)
      setRetryMessage(null)
      sendMessageWithRetry(retryMessage).finally(() => setIsLoading(false))
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
      const response = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionId,
          unansweredQuestion: lastUnansweredQuestion
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      setShowContactForm(false)
      showToast('Message sent! We\'ll get back to you soon.')
      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'assistant',
        content: "Thank you for providing your contact details. A member of our dedicated team will reach out to you shortly.",
        timestamp: new Date()
      }])
    } catch (error) {
      logger.error('Error submitting contact form:', error)
      showToast('Failed to submit. Please try again.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 bg-hotel-cream flex flex-col overflow-hidden animate-page-enter">
      {/* Screen reader only page title */}
      <h1 className="sr-only">Chat with Cincinnati Hotel Virtual Concierge</h1>

      {/* Skip to chat input - Accessibility */}
      <a
        href="#chat-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-hotel-gold focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to chat input
      </a>

      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg animate-fadeInUp ${
            toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-hotel-charcoal text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-hotel-dark shadow-lg flex-shrink-0 z-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-white/60 hover:text-white active:text-white active:scale-95 transition-all rounded-lg hover:bg-white/10 active:bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg shadow-hotel-gold/20">
              <img src="/hotel-logo.png" alt="Cincinnati Hotel" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-base md:text-lg font-display text-white tracking-wide truncate leading-tight">Cincinnati Hotel</p>
              <p className="text-xs md:text-sm text-hotel-gold tracking-[0.15em] md:tracking-wider uppercase">Virtual Concierge</p>
            </div>
          </div>
          <div className="px-2 md:px-2.5 py-1 bg-emerald-500/20 rounded-lg flex-shrink-0">
            <span className="text-emerald-400 text-xs md:text-sm font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true"></span>
              <span className="hidden sm:inline">Online</span>
            </span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto min-h-0">
        {/* Messages with live region for screen readers */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6 min-h-0"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {/* Welcome message when no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fadeIn">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg shadow-hotel-gold/20 mb-6">
                <img src="/hotel-logo.png" alt="" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl md:text-2xl font-display text-hotel-charcoal mb-2">
                Welcome to Cincinnati Hotel
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-sm mb-6">
                I'm your virtual concierge. Ask me anything about our rooms, amenities, dining, or services.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_SUGGESTIONS.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => sendMessage(suggestion.text)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-full
                               text-sm text-hotel-charcoal hover:border-hotel-gold hover:bg-hotel-gold/5
                               active:border-hotel-gold active:bg-hotel-gold/10 active:scale-[0.98]
                               transition-all duration-200 shadow-sm"
                  >
                    <suggestion.icon className="w-3.5 h-3.5 text-hotel-gold" aria-hidden="true" />
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`group flex gap-2 md:gap-3 animate-fadeInUp ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden ${
                message.role === 'user'
                  ? 'bg-hotel-charcoal'
                  : 'shadow-sm shadow-hotel-gold/20'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 md:w-4.5 md:h-4.5 text-white" aria-hidden="true" />
                ) : (
                  <img src="/hotel-logo.png" alt="" className="w-full h-full object-cover" />
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
                <div className={`flex items-center gap-2 mt-1 px-1 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.timestamp && (
                    <time
                      dateTime={message.timestamp.toISOString()}
                      className="text-xs md:text-sm text-gray-500"
                      aria-label={`Sent at ${formatTime(message.timestamp).absolute}`}
                    >
                      {formatTime(message.timestamp).relative}
                    </time>
                  )}
                  {/* Copy button for assistant messages - always visible on mobile */}
                  {message.role === 'assistant' && !message.isError && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-gray-400 hover:text-hotel-gold active:text-hotel-gold active:scale-95 transition-all touch-target"
                      aria-label="Copy message"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  {message.isError && retryMessage && (
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1 text-xs text-hotel-gold hover:text-hotel-gold-dark transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Suggestions */}
          {showSuggestions && messages.length === 1 && !isLoading && (
            <div className="animate-fadeInUp">
              <p className="text-xs md:text-sm text-gray-500 mb-2.5 md:mb-3 text-center uppercase tracking-wider">Quick questions</p>
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-lg md:rounded-xl
                               text-sm md:text-base text-hotel-charcoal hover:border-hotel-gold hover:bg-hotel-gold/5
                               active:border-hotel-gold active:bg-hotel-gold/10 active:scale-[0.98]
                               transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <suggestion.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-hotel-gold" aria-hidden="true" />
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading indicator with screen reader announcement */}
          {isLoading && (
            <div className="flex gap-2 md:gap-3 animate-fadeIn" role="status" aria-live="polite">
              <span className="sr-only">Assistant is typing...</span>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm shadow-hotel-gold/20">
                <img src="/hotel-logo.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 md:px-5 md:py-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1" aria-hidden="true">
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

        {/* Contact Form with dialog semantics */}
        {showContactForm && (
          <div role="dialog" aria-labelledby="contact-form-title" aria-modal="true">
            <ContactForm
              onSubmit={handleContactSubmit}
              onCancel={() => setShowContactForm(false)}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white flex-shrink-0 safe-area-pb">
          {/* Quick Suggestions Panel */}
          <div className={`overflow-hidden transition-all duration-300 ${showQuickPanel ? 'max-h-48' : 'max-h-0'}`}>
            <div className="p-3 md:p-4 pb-0 border-b border-gray-100">
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => {
                      handleSuggestionClick(suggestion.text)
                      setShowQuickPanel(false)
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg
                               text-sm text-hotel-charcoal hover:border-hotel-gold hover:bg-hotel-gold/5
                               active:border-hotel-gold active:bg-hotel-gold/10 active:scale-[0.98]
                               transition-all duration-200"
                  >
                    <suggestion.icon className="w-3.5 h-3.5 text-hotel-gold" aria-hidden="true" />
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              {/* Quick suggestions toggle */}
              <button
                type="button"
                onClick={() => setShowQuickPanel(!showQuickPanel)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-hotel-gold mb-2 transition-colors"
                aria-expanded={showQuickPanel}
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Quick questions</span>
                {showQuickPanel ? <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>

              <div className="flex gap-2 md:gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  id="chat-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Type your message..."
                  maxLength={MAX_CHARS}
                  autoComplete="off"
                  aria-label="Type your message to the concierge"
                  className="w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-3 md:py-3.5
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
            <div className="flex justify-between items-center mt-1.5 px-1">
              <span className={`text-xs ${inputValue.length >= MAX_CHARS * 0.9 ? 'text-rose-500' : 'text-gray-500'}`}>
                {inputValue.length}/{MAX_CHARS}
              </span>
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                >
                  Clear chat
                </button>
              )}
            </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChatInterface
