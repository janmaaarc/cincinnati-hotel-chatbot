import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Star, MapPin, Phone, Mail,
  Wifi, Car, Coffee, Utensils, Dumbbell, Waves,
  Clock, Shield, ChevronDown,
  Facebook, Instagram, Twitter
} from 'lucide-react'

const AMENITIES = [
  { icon: Wifi, title: 'Free WiFi', desc: 'High-speed internet' },
  { icon: Car, title: 'Valet Parking', desc: 'Complimentary service' },
  { icon: Utensils, title: 'Fine Dining', desc: 'Award-winning cuisine' },
  { icon: Coffee, title: 'Room Service', desc: '24/7 available' },
  { icon: Dumbbell, title: 'Fitness Center', desc: 'Modern equipment' },
  { icon: Waves, title: 'Indoor Pool', desc: 'Heated pool & spa' }
]

const ROOMS = [
  {
    name: 'Deluxe Room',
    desc: 'Elegant comfort with stunning city views and premium amenities',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    size: '350 sq ft',
    price: 'From $199'
  },
  {
    name: 'Executive Suite',
    desc: 'Spacious luxury featuring a separate living area and work desk',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    size: '550 sq ft',
    price: 'From $349'
  },
  {
    name: 'Presidential Suite',
    desc: 'Ultimate luxury with panoramic views and exclusive butler service',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    size: '900 sq ft',
    price: 'From $599'
  }
]

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const scrollTimeoutRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      setIsNavVisible(true)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (window.scrollY > 100) {
          setIsNavVisible(false)
        }
      }, 2000)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-hotel-dark/95 backdrop-blur-sm shadow-lg py-3' : 'bg-transparent py-4 md:py-6'
        } ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        onMouseEnter={() => setIsNavVisible(true)}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center shadow-lg shadow-hotel-gold/20">
              <span className="text-white font-display text-base md:text-lg font-bold">C</span>
            </div>
            <div>
              <h1 className="text-white font-display text-sm md:text-lg tracking-wider leading-tight">CINCINNATI</h1>
              <p className="text-hotel-gold text-[8px] md:text-[10px] tracking-[0.15em] uppercase">Hotel & Suites</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {['About', 'Amenities', 'Rooms', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-white/80 hover:text-hotel-gold text-sm font-medium transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          <a
            href="tel:+15135550123"
            className="hidden lg:flex items-center gap-2 text-white/80 hover:text-hotel-gold text-sm transition-colors"
          >
            <Phone className="w-4 h-4 text-hotel-gold" />
            <span>+1 (513) 555-0123</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(26, 26, 26, 0.4), rgba(26, 26, 26, 0.6)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-6 pt-20">
          <div className="animate-fadeInUp max-w-4xl w-full text-center">
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-hotel-gold text-hotel-gold" />
                ))}
              </div>
              <span className="ml-2 text-white/70 text-sm">Luxury 5-Star Experience</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-3 tracking-wide">
              Welcome to
            </h2>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-hotel-gold mb-6 tracking-wide">
              Cincinnati Hotel
            </h1>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 md:w-20 h-px bg-gradient-to-r from-transparent to-hotel-gold/60"></div>
              <div className="w-2 h-2 rotate-45 bg-hotel-gold"></div>
              <div className="w-12 md:w-20 h-px bg-gradient-to-l from-transparent to-hotel-gold/60"></div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              Experience timeless elegance and exceptional hospitality in the heart of the Queen City
            </p>
          </div>
        </div>

        <div className="relative z-10 pb-10 flex justify-center">
          <button
            onClick={() => scrollToSection('about')}
            className="text-white/50 hover:text-hotel-gold transition-colors animate-bounce"
            aria-label="Scroll down"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-28 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Hotel Lobby"
                  className="rounded-2xl shadow-2xl w-full h-72 md:h-[400px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-hotel-gold text-white p-5 md:p-6 rounded-2xl shadow-xl">
                  <p className="font-display text-3xl md:text-4xl font-bold">25+</p>
                  <p className="text-sm text-white/90">Years of Excellence</p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">About Us</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-6 leading-tight">
                A Legacy of Luxury & Comfort
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Nestled in the heart of downtown Cincinnati, our hotel has been a beacon of hospitality since 1998.
                We blend timeless elegance with modern amenities to create unforgettable experiences.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Star, text: 'Award-Winning' },
                  { icon: MapPin, text: 'Prime Location' },
                  { icon: Clock, text: '24/7 Concierge' },
                  { icon: Shield, text: 'Safe & Secure' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-hotel-cream/50">
                    <div className="w-10 h-10 rounded-lg bg-hotel-gold/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-hotel-gold" />
                    </div>
                    <span className="text-sm font-medium text-hotel-charcoal">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-20 md:py-28 px-4 md:px-6 bg-hotel-cream">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">Our Amenities</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-4">
              Everything You Need
            </h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-hotel-gold/30"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
              <div className="w-12 h-px bg-hotel-gold/30"></div>
            </div>
            <p className="text-gray-600 max-w-lg mx-auto text-lg">
              World-class amenities designed for your comfort
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {AMENITIES.map((amenity, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 hover:border-hotel-gold/30 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-hotel-gold/10 to-hotel-gold/5 flex items-center justify-center mb-5 group-hover:from-hotel-gold/20 group-hover:to-hotel-gold/10 transition-colors">
                  <amenity.icon className="w-7 h-7 text-hotel-gold" />
                </div>
                <h3 className="font-display text-xl text-hotel-charcoal mb-2">{amenity.title}</h3>
                <p className="text-gray-500">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 md:py-28 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">Accommodations</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-4">
              Our Rooms & Suites
            </h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px bg-hotel-gold/30"></div>
              <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
              <div className="w-12 h-px bg-hotel-gold/30"></div>
            </div>
            <p className="text-gray-600 max-w-lg mx-auto text-lg">
              Thoughtfully designed for maximum comfort and relaxation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ROOMS.map((room, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-hotel-gold/30 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-52 md:h-56 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-hotel-charcoal shadow-sm">
                    {room.size}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-hotel-gold text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    {room.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl md:text-2xl text-hotel-charcoal mb-2">{room.name}</h3>
                  <p className="text-gray-500 leading-relaxed">{room.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-hotel-dark pt-16 md:pt-20 pb-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center">
                  <span className="text-white font-display text-lg font-bold">C</span>
                </div>
                <div>
                  <h3 className="text-white font-display text-base tracking-wider">CINCINNATI</h3>
                  <p className="text-hotel-gold text-[9px] tracking-[0.15em] uppercase">Hotel & Suites</p>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Luxury accommodations in the heart of downtown Cincinnati.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {['About', 'Amenities', 'Rooms'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-white/50 hover:text-hotel-gold text-sm transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-5">Contact</h4>
              <ul className="space-y-4">
                <li>
                  <a href="tel:+15135550123" className="flex items-center gap-3 text-white/50 hover:text-hotel-gold text-sm transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>+1 (513) 555-0123</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:info@cincinnatihotel.com" className="flex items-center gap-3 text-white/50 hover:text-hotel-gold text-sm transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>info@cincinnatihotel.com</span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/50 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>123 Main Street<br />Cincinnati, OH 45202</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-5">Hours</h4>
              <ul className="space-y-3 text-white/50 text-sm">
                <li>Check-in: 3:00 PM</li>
                <li>Check-out: 11:00 AM</li>
                <li className="pt-2 text-hotel-gold font-medium">Front Desk: 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-hotel-gold hover:text-white transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-4 text-white/40 text-sm">
                <p>&copy; {new Date().getFullYear()} Cincinnati Hotel & Suites</p>
                <span className="hidden md:inline">|</span>
                <Link
                  to="/admin"
                  className="hover:text-hotel-gold transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
