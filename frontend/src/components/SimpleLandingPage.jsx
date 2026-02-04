import { Link } from 'react-router-dom'
import { MessageCircle, Settings, Star, Clock, Shield, Sparkles, ArrowRight } from 'lucide-react'

function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-hotel-dark flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-hotel-gold/8 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-hotel-gold/6 rounded-full blur-[80px]"></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          {/* 5-Star Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-hotel-gold/20 to-hotel-gold/10 backdrop-blur-sm px-5 py-2.5 rounded-full mb-8 border border-hotel-gold/20">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-hotel-gold fill-hotel-gold" />
              ))}
            </div>
            <span className="text-hotel-gold/90 text-xs font-semibold tracking-wide uppercase">Five Star Luxury</span>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-4 md:gap-5 mb-8">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-hotel-gold via-hotel-gold to-hotel-gold-dark flex items-center justify-center shadow-2xl shadow-hotel-gold/40">
                <span className="text-white font-display text-4xl md:text-5xl font-bold">C</span>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-hotel-gold/30 blur-xl -z-10"></div>
            </div>
            <div className="text-left">
              <h1 className="text-white font-display text-3xl md:text-4xl lg:text-5xl tracking-wide">CINCINNATI</h1>
              <p className="text-hotel-gold text-sm md:text-base tracking-[0.3em] uppercase font-medium mt-1">Hotel & Suites</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-white">
              Virtual Concierge
            </h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto">
              How may we assist you today?
            </p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-12">
          {/* Regular User Card */}
          <Link
            to="/chat"
            className="group relative overflow-hidden bg-gradient-to-br from-hotel-gold/20 via-hotel-gold/10 to-transparent backdrop-blur-sm border border-hotel-gold/30 rounded-3xl p-6 md:p-8 text-left transition-all duration-500 hover:border-hotel-gold/60 hover:shadow-2xl hover:shadow-hotel-gold/20 hover:-translate-y-1"
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center shadow-lg shadow-hotel-gold/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-hotel-dark">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-white font-display text-xl md:text-2xl mb-2 group-hover:text-hotel-gold transition-colors">
                Guest Chat
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed mb-4">
                Ask questions about rooms, dining, amenities, and local attractions
              </p>

              {/* CTA */}
              <div className="inline-flex items-center gap-2 text-hotel-gold font-medium text-sm group-hover:gap-3 transition-all">
                <span>Start chatting</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            to="/admin"
            className="group relative overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 text-left transition-all duration-500 hover:border-white/30 hover:shadow-2xl hover:-translate-y-1"
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            {/* Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Settings className="w-8 h-8 text-white/80" />
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-white font-display text-xl md:text-2xl mb-2 group-hover:text-white transition-colors">
                Admin Panel
              </h3>
              <p className="text-white/50 text-sm md:text-base leading-relaxed mb-4">
                Upload knowledge base, view analytics, and manage chatbot settings
              </p>

              {/* CTA */}
              <div className="inline-flex items-center gap-2 text-white/70 font-medium text-sm group-hover:text-white group-hover:gap-3 transition-all">
                <span>Open dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span>24/7 Available</span>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span>AI Powered</span>
          </div>
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Instant Answers</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleLandingPage
