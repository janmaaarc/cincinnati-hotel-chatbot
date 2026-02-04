import { Link } from 'react-router-dom'
import { MessageCircle, Settings } from 'lucide-react'

function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-cream to-hotel-warm flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center shadow-lg shadow-hotel-gold/20">
            <span className="text-white font-display text-3xl font-bold">C</span>
          </div>
          <div className="text-left">
            <h1 className="text-hotel-charcoal font-display text-2xl tracking-wider">CINCINNATI</h1>
            <p className="text-hotel-gold text-xs tracking-[0.2em] uppercase">Hotel & Suites</p>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="font-display text-3xl md:text-4xl text-hotel-charcoal mb-4">
          Welcome to Our Virtual Concierge
        </h2>
        <p className="text-gray-600 mb-12 text-lg">
          How would you like to proceed?
        </p>

        {/* Two Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/chat"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-br from-hotel-gold to-hotel-gold-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-hotel-gold/30 hover:shadow-xl hover:shadow-hotel-gold/40 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Regular User</span>
          </Link>

          <Link
            to="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-hotel-charcoal text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:bg-hotel-dark"
          >
            <Settings className="w-5 h-5" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm mt-12">
          Powered by AI • Available 24/7
        </p>
      </div>
    </div>
  )
}

export default SimpleLandingPage
