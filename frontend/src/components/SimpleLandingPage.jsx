import { Link } from 'react-router-dom'
import { MessageCircle, Settings, Star, Phone, MapPin } from 'lucide-react'

function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-hotel-dark relative overflow-hidden animate-page-enter">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hotel-dark/80 via-hotel-dark/90 to-hotel-dark"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-hotel-gold/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-hotel-gold/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            {/* 5-Star Rating */}
            <div className="inline-flex items-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-hotel-gold fill-hotel-gold" />
              ))}
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden">
                <img
                  src="/hotel-logo.png"
                  alt="Cincinnati Hotel Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="text-white font-display text-2xl md:text-3xl tracking-wider">CINCINNATI</h1>
                <p className="text-hotel-gold text-xs md:text-sm tracking-[0.25em] uppercase">Hotel & Suites</p>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="space-y-2">
              <p className="text-hotel-gold/80 text-sm uppercase tracking-widest">Welcome</p>
              <h2 className="font-display text-2xl md:text-4xl text-white leading-tight">
                How May We<br className="md:hidden" /> Assist You?
              </h2>
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-4 mb-12">
            {/* Guest Chat - Primary CTA */}
            <Link
              to="/chat"
              className="group block bg-gradient-to-r from-hotel-gold to-hotel-gold-dark p-[1px] rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-hotel-gold/30 hover:-translate-y-0.5"
            >
              <div className="bg-hotel-dark/90 backdrop-blur-sm rounded-2xl p-5 md:p-6 flex items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-white font-display text-lg md:text-xl mb-0.5">Guest Services</h3>
                  <p className="text-white/60 text-sm">Chat with our AI concierge</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-hotel-gold/20 flex items-center justify-center group-hover:bg-hotel-gold/30 transition-colors">
                  <span className="text-hotel-gold text-lg group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Admin - Secondary CTA */}
            <Link
              to="/admin"
              className="group block border border-white/10 rounded-2xl p-5 md:p-6 flex items-center gap-4 md:gap-5 transition-all duration-300 hover:border-white/20 hover:bg-white/5 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                <Settings className="w-7 h-7 md:w-8 md:h-8 text-white/70" />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-white font-display text-lg md:text-xl mb-0.5">Admin Panel</h3>
                <p className="text-white/50 text-sm">Manage knowledge base & analytics</p>
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <span className="text-white/50 text-lg group-hover:text-white/70 group-hover:translate-x-0.5 transition-all">→</span>
              </div>
            </Link>
          </div>

          {/* Footer Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>24/7 Service</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Cincinnati, OH</span>
              </div>
            </div>

            <p className="text-white/30 text-xs">
              Experience luxury hospitality since 1998
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleLandingPage
