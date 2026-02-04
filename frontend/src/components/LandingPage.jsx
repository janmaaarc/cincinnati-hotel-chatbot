import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Star, MapPin, Phone, Mail,
  Wifi, Car, Coffee, Utensils, Dumbbell, Waves,
  Clock, Shield, ChevronDown, ChevronUp, Menu, X,
  Facebook, Instagram, Twitter,
  Quote, Music, Landmark, ShoppingBag, TreePine
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
    price: 'From $199',
    width: 800,
    height: 600
  },
  {
    name: 'Executive Suite',
    desc: 'Spacious luxury featuring a separate living area and work desk',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    size: '550 sq ft',
    price: 'From $349',
    width: 800,
    height: 600
  },
  {
    name: 'Presidential Suite',
    desc: 'Ultimate luxury with panoramic views and exclusive butler service',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    size: '900 sq ft',
    price: 'From $599',
    width: 800,
    height: 600
  }
]

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Business Traveler',
    content: 'Exceptional service from start to finish. The concierge went above and beyond to make my stay memorable. Will definitely return!',
    rating: 5
  },
  {
    name: 'James & Emily Chen',
    role: 'Anniversary Trip',
    content: 'We celebrated our 10th anniversary here and it was perfect. The room was stunning, the restaurant exquisite, and the staff made us feel like royalty.',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Family Vacation',
    content: 'Great location for exploring Cincinnati with kids. The pool was a hit, and the staff were incredibly accommodating with our family needs.',
    rating: 5
  }
]

const FAQS = [
  {
    question: 'What time is check-in and check-out?',
    answer: 'Check-in begins at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability.'
  },
  {
    question: 'Is parking available at the hotel?',
    answer: 'Yes, we offer complimentary valet parking for all guests. Self-parking is also available in our secure underground garage for $25/night.'
  },
  {
    question: 'Do you allow pets?',
    answer: 'We welcome pets under 50 lbs in select rooms. A pet fee of $75 per stay applies. Please notify us in advance to ensure a pet-friendly room.'
  },
  {
    question: 'Is breakfast included with my stay?',
    answer: 'Breakfast is included with select room packages. Our restaurant offers a full breakfast menu from 6:30 AM to 10:30 AM daily.'
  },
  {
    question: 'Do you offer airport transportation?',
    answer: 'Yes, we provide complimentary shuttle service to and from Cincinnati/Northern Kentucky International Airport. Please schedule at least 24 hours in advance.'
  }
]

const ATTRACTIONS = [
  {
    icon: Music,
    name: 'Cincinnati Music Hall',
    distance: '0.5 miles',
    desc: 'Historic concert venue and home to the Cincinnati Symphony Orchestra'
  },
  {
    icon: Landmark,
    name: 'Fountain Square',
    distance: '0.3 miles',
    desc: 'The heart of downtown with shops, restaurants, and events'
  },
  {
    icon: ShoppingBag,
    name: 'Findlay Market',
    distance: '0.8 miles',
    desc: "Ohio's oldest public market with local vendors and fresh produce"
  },
  {
    icon: TreePine,
    name: 'Eden Park',
    distance: '2.1 miles',
    desc: 'Scenic park featuring gardens, trails, and the Cincinnati Art Museum'
  }
]

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const scrollTimeoutRef = useRef(null)
  const debounceRef = useRef(null)
  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY

    // Skip if scroll position hasn't changed significantly (within 5px)
    if (Math.abs(scrollY - lastScrollY.current) < 5) return
    lastScrollY.current = scrollY

    setIsScrolled(scrollY > 50)
    setShowBackToTop(scrollY > 500)
    setIsNavVisible(true)

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (window.scrollY > 100) {
        setIsNavVisible(false)
      }
    }, 2000)
  }, [])

  useEffect(() => {
    const debouncedScroll = () => {
      if (debounceRef.current) {
        cancelAnimationFrame(debounceRef.current)
      }
      debounceRef.current = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', debouncedScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (debounceRef.current) {
        cancelAnimationFrame(debounceRef.current)
      }
    }
  }, [handleScroll])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-hotel-gold focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

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
              <p className="text-hotel-gold text-[10px] md:text-xs tracking-[0.15em] uppercase">Hotel & Suites</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main navigation">
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

          <div className="hidden lg:flex items-center gap-6">
            <a
              href="tel:+15135550123"
              className="flex items-center gap-2 text-white/80 hover:text-hotel-gold text-sm transition-colors"
              aria-label="Call us at +1 (513) 555-0123"
            >
              <Phone className="w-4 h-4 text-hotel-gold" aria-hidden="true" />
              <span>+1 (513) 555-0123</span>
            </a>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-white/80 hover:text-hotel-gold text-sm transition-colors"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-white/80 hover:text-hotel-gold transition-colors"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="absolute right-0 top-0 h-full w-72 bg-hotel-dark shadow-2xl animate-slideInRight"
            aria-label="Mobile navigation"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="text-white font-display text-lg">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <ul className="space-y-4">
                {['About', 'Amenities', 'Rooms', 'Contact'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="w-full text-left text-white/80 hover:text-hotel-gold text-lg font-medium py-2 transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                <a
                  href="tel:+15135550123"
                  className="flex items-center gap-3 text-white/80 hover:text-hotel-gold transition-colors"
                >
                  <Phone className="w-5 h-5 text-hotel-gold" />
                  <span>+1 (513) 555-0123</span>
                </a>
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-white/80 hover:text-hotel-gold transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col" aria-label="Welcome">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(26, 26, 26, 0.4), rgba(26, 26, 26, 0.6)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
            }}
            role="img"
            aria-label="Luxury hotel exterior at sunset"
          />

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-6 pt-20">
            <div className="animate-fadeInUp max-w-4xl w-full text-center">
              <div className="flex items-center justify-center gap-1.5 mb-6">
                <div className="flex items-center gap-0.5" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-hotel-gold text-hotel-gold" aria-hidden="true" />
                  ))}
                </div>
                <span className="ml-2 text-white/80 text-sm md:text-base">Luxury 5-Star Experience</span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-3 tracking-wide">
                Welcome to
              </h2>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-hotel-gold mb-6 tracking-wide">
                Cincinnati Hotel
              </h1>

              <div className="flex items-center justify-center gap-4 mb-8" aria-hidden="true">
                <div className="w-12 md:w-20 h-px bg-gradient-to-r from-transparent to-hotel-gold/60"></div>
                <div className="w-2 h-2 rotate-45 bg-hotel-gold"></div>
                <div className="w-12 md:w-20 h-px bg-gradient-to-l from-transparent to-hotel-gold/60"></div>
              </div>

              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-normal leading-relaxed">
                Experience timeless elegance and exceptional hospitality in the heart of the Queen City
              </p>
            </div>
          </div>

          <div className="relative z-10 pb-10 flex justify-center">
            <button
              onClick={() => scrollToSection('about')}
              className="text-white/50 hover:text-hotel-gold transition-colors animate-bounce"
              aria-label="Scroll to about section"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-28 px-4 md:px-6 bg-white" aria-labelledby="about-heading">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="relative order-2 md:order-1">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Elegant hotel lobby with chandelier and marble floors"
                    className="rounded-2xl shadow-2xl w-full h-72 md:h-[400px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-hotel-gold text-white p-5 md:p-6 rounded-2xl shadow-xl">
                    <p className="font-display text-3xl md:text-4xl font-bold">25+</p>
                    <p className="text-sm text-white/90">Years of Excellence</p>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">About Us</p>
                <h2 id="about-heading" className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-6 leading-tight">
                  A Legacy of Luxury & Comfort
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
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
                        <item.icon className="w-5 h-5 text-hotel-gold" aria-hidden="true" />
                      </div>
                      <span className="text-sm md:text-base font-medium text-hotel-charcoal">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Amenities Section */}
        <section id="amenities" className="py-20 md:py-28 px-4 md:px-6 bg-hotel-cream" aria-labelledby="amenities-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">Our Amenities</p>
              <h2 id="amenities-heading" className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-4">
                Everything You Need
              </h2>
              <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
                <div className="w-12 h-px bg-hotel-gold/30"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
                <div className="w-12 h-px bg-hotel-gold/30"></div>
              </div>
              <p className="text-gray-700 max-w-lg mx-auto text-lg">
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
                    <amenity.icon className="w-7 h-7 text-hotel-gold" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl text-hotel-charcoal mb-2">{amenity.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{amenity.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rooms Section */}
        <section id="rooms" className="py-20 md:py-28 px-4 md:px-6 bg-white" aria-labelledby="rooms-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">Accommodations</p>
              <h2 id="rooms-heading" className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-4">
                Our Rooms & Suites
              </h2>
              <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
                <div className="w-12 h-px bg-hotel-gold/30"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
                <div className="w-12 h-px bg-hotel-gold/30"></div>
              </div>
              <p className="text-gray-700 max-w-lg mx-auto text-lg">
                Thoughtfully designed for maximum comfort and relaxation
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {ROOMS.map((room, index) => (
                <article
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-hotel-gold/30 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative h-52 md:h-56 overflow-hidden">
                    <img
                      src={room.image}
                      alt={`${room.name} - ${room.desc}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
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
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">{room.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 bg-hotel-cream" aria-labelledby="testimonials-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">Guest Reviews</p>
              <h2 id="testimonials-heading" className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-4">
                What Our Guests Say
              </h2>
              <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
                <div className="w-12 h-px bg-hotel-gold/30"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
                <div className="w-12 h-px bg-hotel-gold/30"></div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, index) => (
                <blockquote
                  key={index}
                  className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <Quote className="w-10 h-10 text-hotel-gold/20 mb-4" aria-hidden="true" />
                  <p className="text-gray-700 leading-relaxed mb-6">{testimonial.content}</p>
                  <div className="flex items-center gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-hotel-gold text-hotel-gold" aria-hidden="true" />
                    ))}
                  </div>
                  <footer>
                    <cite className="not-italic">
                      <p className="font-semibold text-hotel-charcoal">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </cite>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Local Attractions Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 bg-white" aria-labelledby="attractions-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">Explore Cincinnati</p>
              <h2 id="attractions-heading" className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-4">
                Nearby Attractions
              </h2>
              <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
                <div className="w-12 h-px bg-hotel-gold/30"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
                <div className="w-12 h-px bg-hotel-gold/30"></div>
              </div>
              <p className="text-gray-700 max-w-lg mx-auto text-lg">
                Discover the best of the Queen City, all within easy reach
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ATTRACTIONS.map((attraction, index) => (
                <div
                  key={index}
                  className="bg-hotel-cream rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-hotel-gold/10 flex items-center justify-center mb-4 group-hover:bg-hotel-gold/20 transition-colors">
                    <attraction.icon className="w-6 h-6 text-hotel-gold" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg text-hotel-charcoal mb-1">{attraction.name}</h3>
                  <p className="text-hotel-gold text-sm font-medium mb-2">{attraction.distance}</p>
                  <p className="text-gray-600 text-sm">{attraction.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-28 px-4 md:px-6 bg-hotel-cream" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-hotel-gold text-sm font-semibold tracking-widest uppercase mb-3">FAQ</p>
              <h2 id="faq-heading" className="font-display text-3xl md:text-4xl lg:text-5xl text-hotel-charcoal mb-4">
                Frequently Asked Questions
              </h2>
              <div className="flex items-center justify-center gap-3 mb-6" aria-hidden="true">
                <div className="w-12 h-px bg-hotel-gold/30"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-hotel-gold"></div>
                <div className="w-12 h-px bg-hotel-gold/30"></div>
              </div>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-50 transition-colors"
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="font-semibold text-hotel-charcoal pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-hotel-gold flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div
                      id={`faq-answer-${index}`}
                      className="px-5 md:px-6 pb-5 md:pb-6 text-gray-600 leading-relaxed animate-fadeIn"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-hotel-dark" role="contentinfo">
        {/* CTA Banner */}
        <div className="relative bg-hotel-cream py-20 md:py-24 px-4 md:px-6 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-50" aria-hidden="true">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-hotel-gold/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-hotel-gold/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-hotel-gold text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Ready to Experience Luxury?
            </p>

            <h3 className="font-display text-4xl md:text-5xl text-hotel-charcoal mb-6 leading-tight">
              Your Perfect Stay Awaits
            </h3>

            <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Book directly for the best rates, exclusive amenities, and personalized service
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="tel:+15135550123"
                className="group inline-flex items-center gap-3 bg-hotel-gold hover:bg-hotel-gold-dark text-white px-12 py-5 rounded-full font-semibold text-lg transition-all duration-300 shadow-xl shadow-hotel-gold/30 hover:shadow-2xl hover:shadow-hotel-gold/40 hover:scale-105"
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span>Call to Reserve</span>
              </a>
              <Link
                to="/chat"
                className="group inline-flex items-center gap-2 text-hotel-charcoal hover:text-hotel-gold font-medium transition-all duration-300"
              >
                <span>Chat with Concierge</span>
                <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Footer Content - Enhanced */}
        <div className="pt-14 md:pt-20 pb-8 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-14">
              {/* Brand Column - Larger */}
              <div className="md:col-span-4 lg:col-span-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hotel-gold to-hotel-gold-dark flex items-center justify-center shadow-lg shadow-hotel-gold/20">
                    <span className="text-white font-display text-2xl font-bold">C</span>
                  </div>
                  <div>
                    <h3 className="text-white font-display text-xl tracking-wider">CINCINNATI</h3>
                    <p className="text-hotel-gold text-xs tracking-[0.2em] uppercase">Hotel & Suites</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed mb-6 max-w-sm">
                  Experience timeless elegance and exceptional hospitality in the heart of downtown Cincinnati since 1998.
                </p>

                {/* Social Links - Enhanced */}
                <div className="flex items-center gap-3">
                  {[
                    { Icon: Facebook, label: 'Facebook' },
                    { Icon: Instagram, label: 'Instagram' },
                    { Icon: Twitter, label: 'Twitter' }
                  ].map(({ Icon, label }, index) => (
                    <a
                      key={index}
                      href="#"
                      className="group w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-hotel-gold hover:border-hotel-gold hover:text-white transition-all duration-300 hover:scale-110"
                      aria-label={`Follow us on ${label}`}
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="md:col-span-2">
                <h4 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
                  <span className="w-1 h-4 bg-hotel-gold rounded-full"></span>
                  Explore
                </h4>
                <ul className="space-y-3">
                  {['About', 'Amenities', 'Rooms', 'FAQ', 'Contact'].map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => scrollToSection(item.toLowerCase())}
                        className="text-white/60 hover:text-hotel-gold text-sm transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1 group"
                      >
                        <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div className="md:col-span-3">
                <h4 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
                  <span className="w-1 h-4 bg-hotel-gold rounded-full"></span>
                  Contact
                </h4>
                <ul className="space-y-4">
                  <li>
                    <a href="tel:+15135550123" className="flex items-start gap-3 text-white/60 hover:text-hotel-gold text-sm transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-hotel-gold/30 group-hover:bg-hotel-gold/10 transition-colors">
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-0.5">Phone</p>
                        <p className="text-white/80 group-hover:text-hotel-gold transition-colors">+1 (513) 555-0123</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@cincinnatihotel.com" className="flex items-start gap-3 text-white/60 hover:text-hotel-gold text-sm transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-hotel-gold/30 group-hover:bg-hotel-gold/10 transition-colors">
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-0.5">Email</p>
                        <p className="text-white/80 group-hover:text-hotel-gold transition-colors">info@cincinnatihotel.com</p>
                      </div>
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-white/60" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-0.5">Address</p>
                      <p className="text-white/80">123 Main Street<br />Cincinnati, OH 45202</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Hours */}
              <div className="md:col-span-3 lg:col-span-2">
                <h4 className="text-white font-semibold text-base mb-5 flex items-center gap-2">
                  <span className="w-1 h-4 bg-hotel-gold rounded-full"></span>
                  Hours
                </h4>
                <table className="w-full">
                  <tbody className="text-sm">
                    <tr>
                      <td className="text-white/50 py-2">Check-in</td>
                      <td className="text-white font-medium py-2 text-right">3:00 PM</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-0"><div className="h-px bg-white/10"></div></td>
                    </tr>
                    <tr>
                      <td className="text-white/50 py-2">Check-out</td>
                      <td className="text-white font-medium py-2 text-right">11:00 AM</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-0"><div className="h-px bg-white/10"></div></td>
                    </tr>
                    <tr>
                      <td className="text-white/50 py-2">Front Desk</td>
                      <td className="text-hotel-gold font-semibold py-2 text-right">24/7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Bar - Enhanced */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <p className="text-white/40 text-sm">
                    &copy; {new Date().getFullYear()} Cincinnati Hotel & Suites
                  </p>
                  <div className="hidden sm:block w-1 h-1 bg-white/20 rounded-full"></div>
                  <p className="text-white/40 text-sm">All rights reserved</p>
                </div>
                <div className="flex items-center gap-1">
                  {['Privacy Policy', 'Terms of Service', 'Accessibility'].map((item, index) => (
                    <a
                      key={item}
                      href="#"
                      className="text-white/40 hover:text-hotel-gold text-sm transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-hotel-gold hover:bg-hotel-gold-dark text-white rounded-full shadow-lg shadow-hotel-gold/30 flex items-center justify-center transition-all duration-300 hover:scale-110 animate-fadeIn"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

export default LandingPage
