import { Link } from 'react-router-dom'
import { MessageCircle, Settings, Star, Clock, Shield } from 'lucide-react'

function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-dark via-hotel-charcoal to-hotel-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-hotel-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-hotel-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hotel-gold/5 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center max-w-xl relative z-10 animate-fadeIn">
        {/* 5-Star Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-hotel-gold fill-hotel-gold" />
            ))}
          </div>
          <span className="text-white/80 text-xs font-medium ml-1">Luxury Experience</span>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center shadow-2xl shadow-hotel-gold/30 animate-pulse-gold">
            <span className="text-white font-display text-4xl font-bold">C</span>
          </div>
          <div className="text-left">
            <h1 className="text-white font-display text-3xl md:text-4xl tracking-wider">CINCINNATI</h1>
            <p className="text-hotel-gold text-sm tracking-[0.25em] uppercase font-medium">Hotel & Suites</p>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="font-display text-2xl md:text-3xl text-white/90 mb-3">
          Welcome to Our Virtual Concierge
        </h2>
        <p className="text-white/50 mb-10 text-base max-w-md mx-auto">
          Select your experience to continue
        </p>

        {/* Two Cards */}
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-12">
          {/* Regular User Card */}
          <Link
            to="/chat"
            className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-left transition-all duration-300 hover:border-hotel-gold/50 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-hotel-gold/20"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-hotel-gold/20 flex items-center justify-center">
                <span className="text-hotel-gold text-lg">→</span>
              </div>
            </div>

            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-hotel-gold/30">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-white font-display text-xl mb-2">Regular User</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Chat with our AI concierge to get answers about rooms, amenities, and services
            </p>
          </Link>

          {/* Admin Card */}
          <Link
            to="/admin"
            className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-left transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white/70 text-lg">→</span>
              </div>
            </div>

            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-white/20 transition-all">
              <Settings className="w-7 h-7 text-white/80" />
            </div>

            <h3 className="text-white font-display text-xl mb-2">Admin</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Manage knowledge base, view statistics, and monitor chat activity
            </p>
          </Link>
        </div>

        {/* Features */}
        <div className="flex items-center justify-center gap-6 md:gap-8 text-white/40 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>24/7 Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleLandingPage
