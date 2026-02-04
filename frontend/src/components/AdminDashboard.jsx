import { useState, useEffect, useCallback } from 'react'
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
  HelpCircle
} from 'lucide-react'
import logger from '../utils/logger'

const DEFAULT_STATS = {
  totalSessions: 0,
  totalMessages: 0,
  unansweredCount: 0,
  categoryStats: [],
  unansweredQuestions: []
}

const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB

const DATE_RANGES = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' }
]

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

  useEffect(() => {
    fetchStats()
    fetchPdfInfo()

    const backendUrl = import.meta.env.PROD
      ? window.location.origin
      : 'http://localhost:3001'

    const socket = io(backendUrl, {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      logger.log('Connected to server')
    })

    socket.on('statsUpdate', (newStats) => {
      if (newStats && typeof newStats === 'object') {
        setStats({
          ...DEFAULT_STATS,
          ...newStats,
          categoryStats: Array.isArray(newStats.categoryStats) ? newStats.categoryStats : []
        })
        setLastUpdated(new Date())
      }
    })

    socket.on('connect_error', (error) => {
      logger.log('Socket connection error:', error.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchStats = useCallback(async (showRefreshing = false, range = dateRange) => {
    if (showRefreshing) setIsRefreshing(true)
    try {
      const url = range !== 'all'
        ? `/api/admin/stats?range=${range}`
        : '/api/admin/stats'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data && !data.error) {
          setStats({
            ...DEFAULT_STATS,
            ...data,
            categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : [],
            unansweredQuestions: Array.isArray(data.unansweredQuestions) ? data.unansweredQuestions : []
          })
          setLastUpdated(new Date())
        }
      }
    } catch (error) {
      logger.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [dateRange])

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    setShowDateDropdown(false)
    fetchStats(true, range)
  }

  const fetchPdfInfo = async () => {
    try {
      const response = await fetch('/api/admin/pdf-info')
      if (response.ok) {
        const data = await response.json()
        if (data.hasPdf) {
          setPdfInfo(data)
        }
      }
    } catch (error) {
      logger.error('Error fetching PDF info:', error)
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
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Please upload a PDF file' })
      return
    }

    if (file.size > MAX_PDF_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setUploadStatus({
        type: 'error',
        message: `File too large (${sizeMB}MB). Maximum size is 10MB.`
      })
      return
    }

    setIsUploading(true)
    setUploadStatus(null)

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: `PDF uploaded successfully (${data.pageCount} pages)`
        })
        fetchPdfInfo()
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' })
      }
    } catch (error) {
      logger.error('Error uploading PDF:', error)
      setUploadStatus({ type: 'error', message: 'Failed to upload PDF' })
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

  const handleRefresh = () => {
    fetchStats(true)
    fetchPdfInfo()
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-page-enter">
      {/* Header */}
      <header className="bg-hotel-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4">
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
              <p className="text-[10px] md:text-xs text-hotel-gold tracking-[0.15em] md:tracking-wider uppercase">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Date Range Filter */}
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white text-xs md:text-sm transition-all"
              >
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDateDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 min-w-[140px]">
                  {DATE_RANGES.map(range => (
                    <button
                      key={range.value}
                      onClick={() => handleDateRangeChange(range.value)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        dateRange === range.value ? 'text-hotel-gold font-medium' : 'text-gray-700'
                      }`}
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
              aria-label="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Mobile Last Updated */}
        <div className="sm:hidden flex items-center justify-between mb-4 text-xs">
          <span className="text-gray-500">Last updated: {formatLastUpdated()}</span>
          {isLoading && <Loader2 className="w-4 h-4 text-hotel-gold animate-spin" />}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-hotel-gold/10 rounded-lg md:rounded-xl">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-hotel-gold" />
              </div>
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">Total Sessions</p>
            <p className="text-2xl md:text-3xl font-bold text-hotel-charcoal">{stats.totalSessions || 0}</p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-blue-50 rounded-lg md:rounded-xl">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              </div>
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">Total Questions</p>
            <p className="text-2xl md:text-3xl font-bold text-hotel-charcoal">{stats.totalMessages || 0}</p>
          </div>

          <button
            onClick={() => stats.unansweredCount > 0 && setShowUnanswered(!showUnanswered)}
            className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left w-full ${
              stats.unansweredCount > 0 ? 'cursor-pointer hover:border-rose-200' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-rose-50 rounded-lg md:rounded-xl">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
              </div>
              <span className="text-[10px] md:text-xs font-medium text-rose-500 bg-rose-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                {stats.unansweredCount > 0 ? 'Click to view' : 'Needs Attention'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">Unanswered</p>
            <p className="text-2xl md:text-3xl font-bold text-hotel-charcoal">{stats.unansweredCount || 0}</p>
          </button>
        </div>

        {/* Unanswered Questions List */}
        {showUnanswered && stats.unansweredQuestions?.length > 0 && (
          <div className="mb-6 md:mb-8 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-display text-hotel-charcoal flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                  Unanswered Questions
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Questions that need attention</p>
              </div>
              <button
                onClick={() => setShowUnanswered(false)}
                className="text-xs md:text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Hide
              </button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {stats.unansweredQuestions.map((question, index) => (
                <div key={index} className="px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors">
                  <p className="text-sm md:text-base text-hotel-charcoal mb-1">{question.question}</p>
                  <p className="text-xs text-gray-400">
                    {question.timestamp ? new Date(question.timestamp).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* PDF Upload Section */}
          <section className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-display text-hotel-charcoal flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-hotel-gold" />
                Knowledge Base
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Upload the hotel information PDF</p>
            </div>

            <div className="p-4 md:p-6">
              {pdfInfo && (
                <div className="mb-3 md:mb-4 p-3 md:p-4 bg-emerald-50 border border-emerald-100 rounded-lg md:rounded-xl flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-emerald-100 rounded-md md:rounded-lg flex-shrink-0">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
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
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-hotel-gold animate-spin mb-2 md:mb-3" />
                  ) : (
                    <div className="p-2 md:p-3 bg-hotel-gold/10 rounded-lg md:rounded-xl mb-2 md:mb-3">
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-hotel-gold" />
                    </div>
                  )}
                  <span className="text-sm md:text-base text-hotel-charcoal font-medium mb-0.5 md:mb-1">
                    {isUploading ? 'Uploading...' : 'Drop PDF here or click to upload'}
                  </span>
                  <span className="text-xs md:text-sm text-gray-400">
                    {pdfInfo ? 'This will replace the current file' : 'PDF up to 10MB'}
                  </span>
                </label>
              </div>

              {uploadStatus && (
                <div className={`mt-3 md:mt-4 p-3 md:p-4 rounded-lg md:rounded-xl flex items-center gap-2 md:gap-3 animate-fadeIn
                               ${uploadStatus.type === 'success'
                                 ? 'bg-emerald-50 border border-emerald-100'
                                 : 'bg-rose-50 border border-rose-100'}`}>
                  {uploadStatus.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <span className={`text-xs md:text-sm ${uploadStatus.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {uploadStatus.message}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Category Statistics */}
          <section className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-display text-hotel-charcoal flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-hotel-gold" />
                  Questions by Topic
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Category breakdown</p>
              </div>
              {isLoading && <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-hotel-gold animate-spin" />}
            </div>

            <div className="p-4 md:p-6">
              {categoryStats.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {categoryStats.map((category, index) => (
                    <div key={category.category || index}>
                      <div className="flex items-center justify-between mb-1.5 md:mb-2">
                        <span className="text-xs md:text-sm font-medium text-hotel-charcoal">
                          {category.category || 'Unknown'}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500">
                          {category.count || 0} questions
                        </span>
                      </div>
                      <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getCategoryColor(index)} transition-all duration-500 rounded-full`}
                          style={{
                            width: `${totalCategoryQuestions > 0
                              ? (category.count / totalCategoryQuestions) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="p-3 md:p-4 bg-gray-50 rounded-full w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
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
