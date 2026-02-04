import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import {
  ArrowLeft,
  Upload,
  FileText,
  MessageSquare,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Calendar,
  ChevronDown,
  HelpCircle,
  X,
  Download,
  Search,
  Copy,
  Check
} from 'lucide-react'
import logger from '../utils/logger'
import { API_BASE_URL, getApiUrl } from '../config'

const DEFAULT_STATS = {
  totalSessions: 0,
  totalMessages: 0,
  unansweredCount: 0,
  categoryStats: [],
  unansweredQuestions: []
}

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB
const REFRESH_COOLDOWN_MS = 2000

const DATE_RANGES = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' }
]

// Generate unique ID for questions
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Simple debounce function
const debounce = (fn, ms) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}

// Memoized stat card component
const StatCard = memo(function StatCard({ icon: Icon, iconBg, iconColor, trendIcon: TrendIcon, trendColor, label, value, onClick, badge, ariaLabel }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left w-full ${onClick ? 'cursor-pointer hover:border-rose-200' : ''}`}
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2 md:p-3 ${iconBg} rounded-lg md:rounded-xl`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
        </div>
        {badge ? (
          <span className="text-[10px] md:text-xs font-medium text-rose-500 bg-rose-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
            {badge}
          </span>
        ) : TrendIcon ? (
          <TrendIcon className={`w-4 h-4 md:w-5 md:h-5 ${trendColor}`} />
        ) : null}
      </div>
      <p className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-hotel-charcoal">{value}</p>
    </Component>
  )
})

// Memoized category bar component
const CategoryBar = memo(function CategoryBar({ category, count, total, colorClass }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 md:mb-2">
        <span className="text-xs md:text-sm font-medium text-hotel-charcoal">
          {category || 'Unknown'}
        </span>
        <span className="text-xs md:text-sm text-gray-500">
          {count || 0} questions
        </span>
      </div>
      <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${category}: ${count} questions, ${percentage.toFixed(0)}%`}
        />
      </div>
    </div>
  )
})

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [pdfInfo, setPdfInfo] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dateRange, setDateRange] = useState('all')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showUnanswered, setShowUnanswered] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPdfConfirm, setShowPdfConfirm] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [dismissedQuestions, setDismissedQuestions] = useState(new Set())
  const [copiedExport, setCopiedExport] = useState(false)
  const [focusedDropdownIndex, setFocusedDropdownIndex] = useState(-1)

  const dropdownRef = useRef(null)
  const dropdownButtonRef = useRef(null)
  const lastRefreshRef = useRef(0)
  const socketRef = useRef(null)
  const reconnectAttemptRef = useRef(0)

  // Toast notification helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDateDropdown(false)
        setFocusedDropdownIndex(-1)
      }
    }

    if (showDateDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDateDropdown])

  // Keyboard navigation for dropdown
  const handleDropdownKeyDown = (e) => {
    if (!showDateDropdown) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setShowDateDropdown(true)
        setFocusedDropdownIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        setShowDateDropdown(false)
        setFocusedDropdownIndex(-1)
        dropdownButtonRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedDropdownIndex(prev => Math.min(prev + 1, DATE_RANGES.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedDropdownIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedDropdownIndex >= 0) {
          handleDateRangeChange(DATE_RANGES[focusedDropdownIndex].value)
        }
        break
      case 'Tab':
        setShowDateDropdown(false)
        setFocusedDropdownIndex(-1)
        break
    }
  }

  // Socket connection with reconnection logic
  useEffect(() => {
    const connectSocket = () => {
      const backendUrl = API_BASE_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001')

      socketRef.current = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      })

      socketRef.current.on('connect', () => {
        logger.log('Connected to server')
        reconnectAttemptRef.current = 0
        setError(null)
      })

      socketRef.current.on('statsUpdate', (newStats) => {
        if (newStats && typeof newStats === 'object') {
          const questionsWithIds = Array.isArray(newStats.unansweredQuestions)
            ? newStats.unansweredQuestions.map(q => ({ ...q, id: q.id || generateId() }))
            : []

          setStats({
            ...DEFAULT_STATS,
            ...newStats,
            categoryStats: Array.isArray(newStats.categoryStats) ? newStats.categoryStats : [],
            unansweredQuestions: questionsWithIds
          })
          setLastUpdated(new Date())
        }
      })

      socketRef.current.on('connect_error', (err) => {
        logger.log('Socket connection error:', err.message)
        reconnectAttemptRef.current += 1
        if (reconnectAttemptRef.current >= 5) {
          setError('Unable to connect to server. Please refresh the page.')
        }
      })

      socketRef.current.on('disconnect', (reason) => {
        logger.log('Socket disconnected:', reason)
        if (reason === 'io server disconnect') {
          socketRef.current.connect()
        }
      })
    }

    fetchStats()
    fetchPdfInfo()
    connectSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const fetchStats = useCallback(async (showRefreshing = false, range = dateRange) => {
    if (showRefreshing) setIsRefreshing(true)
    setError(null)

    try {
      const url = range !== 'all'
        ? getApiUrl(`/api/admin/stats?range=${range}`)
        : getApiUrl('/api/admin/stats')
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()
      if (data && !data.error) {
        const questionsWithIds = Array.isArray(data.unansweredQuestions)
          ? data.unansweredQuestions.map(q => ({ ...q, id: q.id || generateId() }))
          : []

        setStats({
          ...DEFAULT_STATS,
          ...data,
          categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : [],
          unansweredQuestions: questionsWithIds
        })
        setLastUpdated(new Date())
      }
    } catch (err) {
      logger.error('Error fetching stats:', err)
      setError('Failed to load statistics. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [dateRange])

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    setShowDateDropdown(false)
    setFocusedDropdownIndex(-1)
    fetchStats(true, range)
    dropdownButtonRef.current?.focus()
  }

  const fetchPdfInfo = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/pdf-info'))
      if (response.ok) {
        const data = await response.json()
        if (data.hasPdf) {
          setPdfInfo(data)
        }
      }
    } catch (err) {
      logger.error('Error fetching PDF info:', err)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (pdfInfo) {
        setPendingFile(file)
        setShowPdfConfirm(true)
      } else {
        handleFileUpload(file)
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (pdfInfo) {
        setPendingFile(file)
        setShowPdfConfirm(true)
      } else {
        handleFileUpload(file)
      }
    }
  }

  const confirmPdfReplace = () => {
    if (pendingFile) {
      handleFileUpload(pendingFile)
    }
    setShowPdfConfirm(false)
    setPendingFile(null)
  }

  const cancelPdfReplace = () => {
    setShowPdfConfirm(false)
    setPendingFile(null)
  }

  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Please upload a PDF file' })
      showToast('Please upload a PDF file', 'error')
      return
    }

    if (file.size > MAX_PDF_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      const message = `File too large (${sizeMB}MB). Maximum size is 10MB.`
      setUploadStatus({ type: 'error', message })
      showToast(message, 'error')
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const response = await fetch(getApiUrl('/api/admin/upload-pdf'), {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        const message = `PDF uploaded successfully (${data.pageCount} pages)`
        setUploadStatus({ type: 'success', message })
        showToast(message, 'success')
        fetchPdfInfo()
      } else {
        const errorMsg = data.error || 'Upload failed'
        setUploadStatus({ type: 'error', message: errorMsg })
        showToast(errorMsg, 'error')
      }
    } catch (err) {
      logger.error('Error uploading PDF:', err)
      const errorMsg = 'Failed to upload PDF'
      setUploadStatus({ type: 'error', message: errorMsg })
      showToast(errorMsg, 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const getCategoryColor = (index) => {
    const colors = [
      'bg-hotel-gold',
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-rose-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-indigo-500'
    ]
    return colors[index % colors.length]
  }

  const categoryStats = stats.categoryStats || []
  const totalCategoryQuestions = categoryStats.reduce((sum, cat) => sum + (cat.count || 0), 0)

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never'
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Debounced refresh
  const handleRefresh = useCallback(() => {
    const now = Date.now()
    if (now - lastRefreshRef.current < REFRESH_COOLDOWN_MS) {
      return
    }
    lastRefreshRef.current = now
    fetchStats(true)
    fetchPdfInfo()
  }, [fetchStats])

  // Filter unanswered questions
  const filteredQuestions = (stats.unansweredQuestions || []).filter(q => {
    if (dismissedQuestions.has(q.id)) return false
    if (!searchQuery) return true
    return q.question?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Dismiss individual question
  const dismissQuestion = (id) => {
    setDismissedQuestions(prev => new Set([...prev, id]))
    showToast('Question dismissed', 'success')
  }

  // Export unanswered questions
  const exportQuestions = () => {
    const questions = filteredQuestions.map(q => ({
      question: q.question,
      timestamp: q.timestamp ? new Date(q.timestamp).toLocaleString() : 'Unknown'
    }))

    const csv = [
      'Question,Timestamp',
      ...questions.map(q => `"${q.question?.replace(/"/g, '""') || ''}","${q.timestamp}"`)
    ].join('\n')

    navigator.clipboard.writeText(csv)
    setCopiedExport(true)
    setTimeout(() => setCopiedExport(false), 2000)
    showToast('Questions copied to clipboard as CSV', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-page-enter">
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-hotel-gold focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Hidden heading for screen readers */}
      <h1 className="sr-only">Cincinnati Hotel Admin Dashboard</h1>

      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* PDF Replace Confirmation Dialog */}
      {showPdfConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-labelledby="pdf-confirm-title"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-fadeIn">
            <h2 id="pdf-confirm-title" className="text-lg font-display text-hotel-charcoal mb-2">
              Replace Knowledge Base?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              This will replace the current PDF ({pdfInfo?.filename}). The chatbot will use the new file for answering questions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelPdfReplace}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmPdfReplace}
                className="flex-1 px-4 py-2.5 bg-hotel-gold text-white rounded-xl hover:bg-hotel-gold-dark transition-colors text-sm font-medium"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-hotel-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
              <img
                src="/hotel-logo.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-base md:text-lg font-display text-white tracking-wide truncate leading-tight">Cincinnati Hotel</p>
              <p className="text-[10px] md:text-xs text-hotel-gold tracking-[0.15em] md:tracking-wider uppercase">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Date Range Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                ref={dropdownButtonRef}
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                onKeyDown={handleDropdownKeyDown}
                aria-expanded={showDateDropdown}
                aria-haspopup="listbox"
                aria-label={`Date range: ${DATE_RANGES.find(r => r.value === dateRange)?.label}`}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white text-xs md:text-sm transition-all"
              >
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {showDateDropdown && (
                <div
                  role="listbox"
                  aria-label="Select date range"
                  className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 min-w-[140px]"
                >
                  {DATE_RANGES.map((range, index) => (
                    <button
                      key={range.value}
                      role="option"
                      aria-selected={dateRange === range.value}
                      onClick={() => handleDateRangeChange(range.value)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        dateRange === range.value ? 'text-hotel-gold font-medium bg-hotel-gold/5' : 'text-gray-700'
                      } ${focusedDropdownIndex === index ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-end text-[10px] md:text-xs">
              <span className="text-white/50">Last updated</span>
              <span className="text-white/80 font-medium">{formatLastUpdated()}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 md:p-2.5 text-white/60 hover:text-white transition-all rounded-lg hover:bg-white/10 disabled:opacity-50"
              aria-label="Refresh statistics"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 md:mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 animate-fadeIn"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-600 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Mobile Last Updated */}
        <div className="sm:hidden flex items-center justify-between mb-4 text-xs">
          <span className="text-gray-500">Last updated: {formatLastUpdated()}</span>
          {isLoading && (
            <div role="status" aria-live="polite">
              <Loader2 className="w-4 h-4 text-hotel-gold animate-spin" />
              <span className="sr-only">Loading statistics...</span>
            </div>
          )}
        </div>

        {/* Loading State Announcement */}
        {isRefreshing && (
          <div role="status" aria-live="polite" className="sr-only">
            Refreshing statistics...
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard
            icon={Users}
            iconBg="bg-hotel-gold/10"
            iconColor="text-hotel-gold"
            trendIcon={TrendingUp}
            trendColor="text-emerald-500"
            label="Total Sessions"
            value={stats.totalSessions || 0}
            ariaLabel={`Total sessions: ${stats.totalSessions || 0}`}
          />

          <StatCard
            icon={MessageSquare}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            trendIcon={BarChart3}
            trendColor="text-blue-500"
            label="Total Questions"
            value={stats.totalMessages || 0}
            ariaLabel={`Total questions: ${stats.totalMessages || 0}`}
          />

          <StatCard
            icon={AlertCircle}
            iconBg="bg-rose-50"
            iconColor="text-rose-500"
            label="Unanswered"
            value={stats.unansweredCount || 0}
            onClick={() => setShowUnanswered(!showUnanswered)}
            badge={showUnanswered ? 'Click to hide' : 'Click to view'}
            ariaLabel={`Unanswered questions: ${stats.unansweredCount || 0}. ${showUnanswered ? 'Click to hide list' : 'Click to view list'}`}
          />
        </div>

        {/* Unanswered Questions List */}
        {showUnanswered && (
          <div className="mb-6 md:mb-8 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base md:text-lg font-display text-hotel-charcoal flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-500" aria-hidden="true" />
                    Unanswered Questions
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Questions that need attention</p>
                </div>
                <div className="flex items-center gap-2">
                  {filteredQuestions.length > 0 && (
                    <button
                      onClick={exportQuestions}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-hotel-gold hover:bg-hotel-gold/5 rounded-lg transition-colors"
                      aria-label="Export questions as CSV"
                    >
                      {copiedExport ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{copiedExport ? 'Copied!' : 'Export'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowUnanswered(false)}
                    className="text-xs md:text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Hide unanswered questions"
                  >
                    Hide
                  </button>
                </div>
              </div>

              {/* Search filter */}
              {stats.unansweredQuestions?.length > 3 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold/20 focus:border-hotel-gold"
                    aria-label="Search unanswered questions"
                  />
                </div>
              )}
            </div>

            {filteredQuestions.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto" role="list" aria-label="Unanswered questions list">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                    role="listitem"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base text-hotel-charcoal mb-1">{question.question}</p>
                      <p className="text-xs text-gray-400">
                        {question.timestamp ? new Date(question.timestamp).toLocaleString() : 'Unknown time'}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissQuestion(question.id)}
                      className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Dismiss question: ${question.question?.substring(0, 30)}...`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="p-3 bg-emerald-50 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {searchQuery ? 'No matching questions' : 'All questions answered!'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery ? 'Try a different search term' : 'No unanswered questions at the moment'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* PDF Upload Section */}
          <section className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden" aria-labelledby="knowledge-base-heading">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
              <h2 id="knowledge-base-heading" className="text-base md:text-lg font-display text-hotel-charcoal flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-hotel-gold" aria-hidden="true" />
                Knowledge Base
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Upload the hotel information PDF</p>
            </div>

            <div className="p-4 md:p-6">
              {pdfInfo && (
                <div className="mb-3 md:mb-4 p-3 md:p-4 bg-emerald-50 border border-emerald-100 rounded-lg md:rounded-xl flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-emerald-100 rounded-md md:rounded-lg flex-shrink-0">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-emerald-800 truncate">{pdfInfo.filename}</p>
                    <p className="text-[10px] md:text-xs text-emerald-600">
                      Uploaded {new Date(pdfInfo.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg md:rounded-xl p-6 md:p-8 text-center transition-all duration-200 cursor-pointer
                           ${dragActive
                             ? 'border-hotel-gold bg-hotel-gold/5 scale-[1.02]'
                             : 'border-gray-200 hover:border-hotel-gold/50 hover:bg-gray-50'}`}
                role="region"
                aria-label="PDF upload area"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                  aria-describedby="pdf-upload-hint"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-hotel-gold animate-spin mb-2 md:mb-3" aria-hidden="true" />
                  ) : (
                    <div className="p-2 md:p-3 bg-hotel-gold/10 rounded-lg md:rounded-xl mb-2 md:mb-3">
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-hotel-gold" aria-hidden="true" />
                    </div>
                  )}
                  <span className="text-sm md:text-base text-hotel-charcoal font-medium mb-0.5 md:mb-1">
                    {isUploading ? 'Uploading...' : 'Drop PDF here or click to upload'}
                  </span>
                  <span id="pdf-upload-hint" className="text-xs md:text-sm text-gray-400">
                    {pdfInfo ? 'This will replace the current file' : 'PDF up to 10MB'}
                  </span>
                </label>
              </div>

              {uploadStatus && (
                <div
                  role="alert"
                  className={`mt-3 md:mt-4 p-3 md:p-4 rounded-lg md:rounded-xl flex items-center gap-2 md:gap-3 animate-fadeIn
                             ${uploadStatus.type === 'success'
                               ? 'bg-emerald-50 border border-emerald-100'
                               : 'bg-rose-50 border border-rose-100'}`}
                >
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-600 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className={`text-xs md:text-sm ${uploadStatus.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {uploadStatus.message}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Category Statistics */}
          <section className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden" aria-labelledby="category-stats-heading">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 id="category-stats-heading" className="text-base md:text-lg font-display text-hotel-charcoal flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-hotel-gold" aria-hidden="true" />
                  Questions by Topic
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Category breakdown</p>
              </div>
              {isLoading && (
                <div role="status">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-hotel-gold animate-spin" />
                  <span className="sr-only">Loading category statistics...</span>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6">
              {categoryStats.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {categoryStats.map((category, index) => (
                    <CategoryBar
                      key={category.category || index}
                      category={category.category}
                      count={category.count}
                      total={totalCategoryQuestions}
                      colorClass={getCategoryColor(index)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="p-3 md:p-4 bg-gray-50 rounded-full w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-gray-300" aria-hidden="true" />
                  </div>
                  <p className="text-sm md:text-base text-gray-500 font-medium">No chat data yet</p>
                  <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1">
                    Statistics will appear as users chat with the bot
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
