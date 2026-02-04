import { Link } from 'react-router-dom'
import { Sparkles, Building2 } from 'lucide-react'

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-cream to-hotel-warm flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
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
          Choose Your Experience
        </h2>
        <p className="text-gray-600 mb-12 text-lg">
          Select a version to continue
        </p>

        {/* Two Options */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Simple Version */}
          <Link
            to="/simple"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-hotel-gold"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-hotel-charcoal flex items-center justify-center group-hover:bg-hotel-gold transition-colors">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display text-xl text-hotel-charcoal mb-2">Simple Version</h3>
            <p className="text-gray-500 text-sm">
              Two buttons: Admin & User<br />
              <span className="text-hotel-gold font-medium">Per requirements spec</span>
            </p>
          </Link>

          {/* Full Landing Page */}
          <Link
            to="/landing"
            className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-hotel-gold"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-hotel-charcoal flex items-center justify-center group-hover:bg-hotel-gold transition-colors">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display text-xl text-hotel-charcoal mb-2">Full Landing Page</h3>
            <p className="text-gray-500 text-sm">
              Complete hotel website<br />
              <span className="text-hotel-gold font-medium">With all sections</span>
            </p>
          </Link>
        </div>

        {/* Subtitle */}
        <p className="text-gray-400 text-sm mt-12">
          Both versions include Chat & Admin functionality
        </p>
      </div>
    </div>
  )
}

export default HomePage
