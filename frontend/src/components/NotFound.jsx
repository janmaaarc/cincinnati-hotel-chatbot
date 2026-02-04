import { Link } from 'react-router-dom'
import { Home, ArrowLeft, MessageCircle } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen bg-hotel-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center shadow-lg shadow-hotel-gold/20">
            <span className="text-white font-display text-2xl font-bold">C</span>
          </div>
        </div>

        {/* 404 Display */}
        <h1 className="font-display text-8xl md:text-9xl text-hotel-gold mb-4">404</h1>

        <h2 className="font-display text-2xl md:text-3xl text-hotel-charcoal mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8 leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-hotel-gold hover:bg-hotel-gold-dark text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-hotel-gold/25 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <Link
            to="/chat"
            className="inline-flex items-center gap-2 text-hotel-charcoal hover:text-hotel-gold font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat with Us</span>
          </Link>
        </div>

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

export default NotFound
