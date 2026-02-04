import { Component } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-hotel-cream flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <h1 className="font-display text-2xl md:text-3xl text-hotel-charcoal mb-4">
              Something Went Wrong
            </h1>

            <p className="text-gray-600 mb-8 leading-relaxed">
              We apologize for the inconvenience. An unexpected error has occurred.
              Please try refreshing the page or return to the home page.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={this.handleRefresh}
                className="inline-flex items-center gap-2 bg-hotel-gold hover:bg-hotel-gold-dark text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-hotel-gold/25 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh Page</span>
              </button>

              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-2 text-hotel-charcoal hover:text-hotel-gold font-medium transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Error Details (Dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 p-4 bg-gray-100 rounded-xl text-left">
                <p className="text-xs text-gray-500 font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Decorative Element */}
            <div className="mt-12 flex items-center justify-center gap-3" aria-hidden="true">
              <div className="w-12 h-px bg-hotel-gold/30"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
              <div className="w-12 h-px bg-hotel-gold/30"></div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Cincinnati Hotel & Suites
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
