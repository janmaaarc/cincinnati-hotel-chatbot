import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Loader2, User, BedDouble, UtensilsCrossed, Clock, Wifi, Car, Sparkles, HelpCircle, RefreshCw, Copy, Check, Trash2, ThumbsUp, ThumbsDown, Search, Download, Mic, MicOff, Moon, Sun, Volume2, VolumeX, X } from 'lucide-react'
import ContactForm from './ContactForm'
import logger from '../utils/logger'
import { getApiUrl } from '../config'

// Follow-up suggestions based on context
const FOLLOW_UP_SUGGESTIONS = [
  'Tell me more',
  'What about pricing?',
  'How do I book?',
  'Contact staff'
]

// Theme storage key
const THEME_KEY = 'cincinnati_hotel_theme'
const SOUND_KEY = 'cincinnati_hotel_sound'

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

// Get date group label for message grouping
const getDateGroup = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Unknown'
  }
  const now = new Date()
  const messageDate = new Date(date)

  // Reset time to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

  if (messageDay.getTime() === today.getTime()) {
    return 'Today'
  }
  if (messageDay.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }
  return messageDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

// Group messages by date
const groupMessagesByDate = (messages) => {
  const groups = []
  let currentGroup = null

  messages.forEach((message) => {
    const dateGroup = getDateGroup(message.timestamp)
    if (!currentGroup || currentGroup.label !== dateGroup) {
      currentGroup = { label: dateGroup, messages: [] }
      groups.push(currentGroup)
    }
    currentGroup.messages.push(message)
  })

  return groups
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
  // Message feedback state
  const [messageFeedback, setMessageFeedback] = useState({}) // { messageId: 'up' | 'down' }
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  // Voice input state
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'dark'
  })
  // Sound notification state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_KEY)
    return saved !== 'false' // Default to true
  })
  const messagesContainerRef = useRef(null)
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const lastMessageTimeRef = useRef(0)
  const prevMessagesLengthRef = useRef(0)
  const abortControllerRef = useRef(null)
  const initialScrollDoneRef = useRef(false)
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

  // Message feedback handler
  const handleFeedback = useCallback((messageId, type) => {
    setMessageFeedback(prev => {
      const current = prev[messageId]
      // Toggle off if same, otherwise set new value
      if (current === type) {
        const { [messageId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [messageId]: type }
    })
    showToast(type === 'up' ? 'Thanks for the feedback!' : 'We\'ll improve our responses')
  }, [showToast])

  // Export chat as text file
  const exportChat = useCallback(() => {
    if (messages.length === 0) {
      showToast('No messages to export', 'error')
      return
    }

    const chatText = messages.map(m => {
      const role = m.role === 'user' ? 'You' : 'Concierge'
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : ''
      return `[${time}] ${role}:\n${m.content}\n`
    }).join('\n')

    const header = `Cincinnati Hotel Chat Export\nExported: ${new Date().toLocaleString()}\n${'='.repeat(40)}\n\n`
    const blob = new Blob([header + chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Chat exported successfully')
  }, [messages, showToast])

  // Voice input handlers
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light')
      return newValue
    })
  }, [])

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev
      localStorage.setItem(SOUND_KEY, newValue ? 'true' : 'false')
      showToast(newValue ? 'Sound notifications enabled' : 'Sound notifications disabled')
      return newValue
    })
  }, [showToast])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  }, [soundEnabled])

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const query = searchQuery.toLowerCase()
    return messages.filter(m => m.content.toLowerCase().includes(query))
  }, [messages, searchQuery])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(filteredMessages)
  }, [filteredMessages])

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

  // Scroll to bottom on initial load (only when multiple messages restored from localStorage)
  useLayoutEffect(() => {
    if (!initialScrollDoneRef.current && messages.length > 1 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      initialScrollDoneRef.current = true
    }
    // Mark as done even for single message to enable future scrolls
    if (messages.length === 1) {
      initialScrollDoneRef.current = true
    }
  }, [messages])

  // Scroll to bottom when new messages added
  useLayoutEffect(() => {
    if (initialScrollDoneRef.current && messages.length > prevMessagesLengthRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages])

  // Initialize voice recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setVoiceSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputValue(prev => prev + transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    // Create audio element for notification sound
    const audio = new Audio()
    audio.src = 'data:audio/wav;base64,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'
    audioRef.current = audio

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // Play sound when new assistant message arrives
  useEffect(() => {
    if (messages.length > 1) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant' && !lastMessage.isError) {
        playNotificationSound()
      }
    }
  }, [messages.length, playNotificationSound])

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
    initialScrollDoneRef.current = false
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
    <div className={`fixed inset-0 flex flex-col overflow-hidden animate-page-enter ${
      isDarkMode ? 'bg-hotel-dark' : 'bg-hotel-cream'
    }`}>
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
            toast.type === 'error'
              ? 'bg-rose-500 text-white'
              : isDarkMode
                ? 'bg-white text-hotel-charcoal'
                : 'bg-hotel-charcoal text-white'
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
          {/* Header action buttons */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-all ${
                showSearch ? 'text-hotel-gold bg-white/10' : 'text-white/40 hover:text-white/80 hover:bg-white/10'
              }`}
              aria-label="Search messages"
              aria-expanded={showSearch}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Export chat */}
            {messages.length > 1 && (
              <button
                onClick={exportChat}
                className="p-2 text-white/40 hover:text-white/80 active:scale-95 transition-all rounded-lg hover:bg-white/10"
                aria-label="Export chat"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg transition-all ${
                soundEnabled ? 'text-white/40 hover:text-white/80' : 'text-white/40 hover:text-white/80'
              } hover:bg-white/10`}
              aria-label={soundEnabled ? 'Disable sound notifications' : 'Enable sound notifications'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-white/40 hover:text-white/80 active:scale-95 transition-all rounded-lg hover:bg-white/10"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Moon className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            {/* Clear chat button */}
            {messages.length > 1 && (
              <button
                onClick={clearChat}
                className="p-2 text-white/40 hover:text-white/80 active:scale-95 transition-all rounded-lg hover:bg-white/10"
                aria-label="Clear chat history"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>

          <div className="px-2 md:px-2.5 py-1 bg-emerald-500/20 rounded-lg flex-shrink-0">
            <span className="text-emerald-400 text-xs md:text-sm font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true"></span>
              <span className="hidden sm:inline">Online</span>
            </span>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="px-4 md:px-6 pb-3 animate-fadeInUp">
            <div className="relative max-w-4xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-white/10 border border-white/10 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-hotel-gold/30 focus:border-hotel-gold/50"
                aria-label="Search messages"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-white/40 mt-2 max-w-4xl mx-auto">
                Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto min-h-0">
        {/* Messages with live region for screen readers */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 md:space-y-6 min-h-0"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {/* Welcome message when no messages */}
          {filteredMessages.length === 0 && !searchQuery && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fadeIn">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg shadow-hotel-gold/20 mb-6">
                <img src="/hotel-logo.png" alt="" className="w-full h-full object-cover" />
              </div>
              <h2 className={`text-xl md:text-2xl font-display mb-2 ${isDarkMode ? 'text-white' : 'text-hotel-charcoal'}`}>
                Welcome to Cincinnati Hotel
              </h2>
              <p className={`text-sm md:text-base max-w-sm mb-6 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                I'm your virtual concierge. Ask me anything about our rooms, amenities, dining, or services.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_SUGGESTIONS.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => sendMessage(suggestion.text)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all duration-200 shadow-sm active:scale-[0.98] ${
                      isDarkMode
                        ? 'bg-white/10 border border-white/10 text-white hover:border-hotel-gold hover:bg-hotel-gold/10'
                        : 'bg-white border border-gray-200 text-hotel-charcoal hover:border-hotel-gold hover:bg-hotel-gold/5'
                    }`}
                  >
                    <suggestion.icon className="w-3.5 h-3.5 text-hotel-gold" aria-hidden="true" />
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results message for search */}
          {filteredMessages.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fadeIn">
              <Search className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-white/30' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                No messages found for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-hotel-gold hover:text-hotel-gold-dark transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {groupedMessages.map((group, groupIndex) => (
            <div key={group.label} className="space-y-4 md:space-y-6">
              {/* Date separator */}
              {groupedMessages.length > 1 && (
                <div className="flex items-center gap-3 py-2">
                  <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {group.label}
                  </span>
                  <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                </div>
              )}

              {group.messages.map((message, messageIndex) => {
                const isLastAssistantMessage =
                  message.role === 'assistant' &&
                  groupIndex === groupedMessages.length - 1 &&
                  messageIndex === group.messages.length - 1 &&
                  !isLoading &&
                  !message.isError

                return (
                  <div key={message.id}>
                    <div
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
                              : isDarkMode
                                ? 'bg-white/10 text-white rounded-bl-md border border-white/10'
                                : 'bg-white text-hotel-charcoal rounded-bl-md border border-gray-100'
                          }`}
                        >
                          {/* Highlight search matches */}
                          {searchQuery ? (
                            <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                              {message.content.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                                part.toLowerCase() === searchQuery.toLowerCase() ? (
                                  <mark key={i} className="bg-yellow-300 text-hotel-charcoal rounded px-0.5">{part}</mark>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          ) : (
                            <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 mt-1 px-1 ${message.role === 'user' ? 'justify-end' : ''}`}>
                          {message.timestamp && (
                            <time
                              dateTime={message.timestamp.toISOString()}
                              className={`text-xs md:text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}
                              aria-label={`Sent at ${formatTime(message.timestamp).absolute}`}
                            >
                              {formatTime(message.timestamp).relative}
                            </time>
                          )}
                          {/* Copy button for assistant messages */}
                          {message.role === 'assistant' && !message.isError && (
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className={`opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 transition-all touch-target ${
                                isDarkMode ? 'text-white/40 hover:text-hotel-gold' : 'text-gray-400 hover:text-hotel-gold'
                              } active:text-hotel-gold active:scale-95`}
                              aria-label="Copy message"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          {/* Feedback buttons for assistant messages */}
                          {message.role === 'assistant' && !message.isError && messages.indexOf(message) > 0 && (
                            <>
                              <button
                                onClick={() => handleFeedback(message.id, 'up')}
                                className={`opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 transition-all touch-target ${
                                  messageFeedback[message.id] === 'up'
                                    ? 'text-emerald-500'
                                    : isDarkMode ? 'text-white/40 hover:text-emerald-500' : 'text-gray-400 hover:text-emerald-500'
                                } active:scale-95`}
                                aria-label="Helpful response"
                                aria-pressed={messageFeedback[message.id] === 'up'}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'down')}
                                className={`opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 transition-all touch-target ${
                                  messageFeedback[message.id] === 'down'
                                    ? 'text-rose-500'
                                    : isDarkMode ? 'text-white/40 hover:text-rose-500' : 'text-gray-400 hover:text-rose-500'
                                } active:scale-95`}
                                aria-label="Not helpful response"
                                aria-pressed={messageFeedback[message.id] === 'down'}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </>
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

                    {/* Suggested follow-ups after last assistant message */}
                    {isLastAssistantMessage && messages.length > 2 && (
                      <div className="ml-10 md:ml-12 mt-3 animate-fadeInUp">
                        <p className={`text-xs mb-2 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                          Suggested follow-ups:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => sendMessage(suggestion)}
                              className={`px-3 py-1.5 text-sm rounded-full transition-all active:scale-[0.98] ${
                                isDarkMode
                                  ? 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                                  : 'bg-white text-hotel-charcoal hover:bg-hotel-gold/10 border border-gray-200 hover:border-hotel-gold'
                              }`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Quick Suggestions */}
          {showSuggestions && filteredMessages.length === 1 && !isLoading && !searchQuery && (
            <div className="animate-fadeInUp">
              <p className={`text-xs md:text-sm mb-2.5 md:mb-3 text-center uppercase tracking-wider ${
                isDarkMode ? 'text-white/50' : 'text-gray-500'
              }`}>Quick questions</p>
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl
                               text-sm md:text-base transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] ${
                      isDarkMode
                        ? 'bg-white/10 border border-white/10 text-white hover:border-hotel-gold hover:bg-hotel-gold/10'
                        : 'bg-white border border-gray-200 text-hotel-charcoal hover:border-hotel-gold hover:bg-hotel-gold/5'
                    }`}
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
              <div className={`rounded-2xl rounded-bl-md px-4 py-2.5 md:px-5 md:py-3 shadow-sm ${
                isDarkMode ? 'bg-white/10 border border-white/10' : 'bg-white border border-gray-100'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-hotel-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-hotel-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-hotel-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Typing...</span>
                </div>
              </div>
            </div>
          )}

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
        <div className={`border-t flex-shrink-0 safe-area-pb ${
          isDarkMode ? 'border-white/10 bg-hotel-dark' : 'border-gray-200 bg-white'
        }`}>
          {/* Quick Suggestions Panel */}
          <div className={`overflow-hidden transition-all duration-300 ${showQuickPanel ? 'max-h-48' : 'max-h-0'}`}>
            <div className={`p-3 md:p-4 pb-0 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => {
                      handleSuggestionClick(suggestion.text)
                      setShowQuickPanel(false)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 active:scale-[0.98] ${
                      isDarkMode
                        ? 'bg-white/10 border border-white/10 text-white hover:border-hotel-gold hover:bg-hotel-gold/10'
                        : 'bg-gray-50 border border-gray-200 text-hotel-charcoal hover:border-hotel-gold hover:bg-hotel-gold/5'
                    }`}
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
              <div className="flex gap-2 md:gap-3 items-center">
                {/* Quick questions toggle button */}
                <button
                  type="button"
                  onClick={() => setShowQuickPanel(!showQuickPanel)}
                  className={`p-2.5 md:p-3 rounded-xl transition-all flex-shrink-0 ${
                    showQuickPanel
                      ? 'bg-hotel-gold/10 text-hotel-gold'
                      : isDarkMode
                        ? 'text-white/40 hover:text-hotel-gold hover:bg-white/10'
                        : 'text-gray-400 hover:text-hotel-gold hover:bg-gray-100'
                  }`}
                  aria-expanded={showQuickPanel}
                  aria-label="Quick questions"
                >
                  <HelpCircle className="w-5 h-5" aria-hidden="true" />
                </button>

                {/* Voice input button */}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2.5 md:p-3 rounded-xl transition-all flex-shrink-0 ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-500 animate-pulse'
                        : isDarkMode
                          ? 'text-white/40 hover:text-hotel-gold hover:bg-white/10'
                          : 'text-gray-400 hover:text-hotel-gold hover:bg-gray-100'
                    }`}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    aria-pressed={isListening}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Mic className="w-5 h-5" aria-hidden="true" />
                    )}
                  </button>
                )}

                {/* Input field */}
                <div className="flex-1 relative">
                  <input
                    id="chat-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.slice(0, MAX_CHARS))}
                    placeholder={isListening ? 'Listening...' : 'Ask me anything...'}
                    maxLength={MAX_CHARS}
                    autoComplete="off"
                    aria-label="Type your message to the concierge"
                    className={`w-full rounded-full px-5 py-3 md:py-3.5 text-base transition-all
                               focus:outline-none focus:ring-2 focus:ring-hotel-gold/30 focus:border-hotel-gold/50 ${
                      isDarkMode
                        ? 'bg-white/10 border border-white/10 text-white placeholder-white/40 focus:bg-white/15'
                        : 'bg-gray-50 border border-gray-200 text-hotel-charcoal placeholder-gray-400 focus:bg-white'
                    }`}
                    disabled={isLoading || isListening}
                  />
                  {/* Character count - only show when approaching limit */}
                  {inputValue.length >= MAX_CHARS * 0.8 && (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${
                      inputValue.length >= MAX_CHARS * 0.9 ? 'text-rose-500' : isDarkMode ? 'text-white/40' : 'text-gray-400'
                    }`}>
                      {MAX_CHARS - inputValue.length}
                    </span>
                  )}
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-gradient-to-br from-hotel-gold to-hotel-gold-dark text-white p-3 md:p-3.5 rounded-full
                             hover:shadow-lg hover:shadow-hotel-gold/30 transition-all duration-200
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                             shadow-md shadow-hotel-gold/20
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
        </div>
      </main>
    </div>
  )
}

export default ChatInterface
