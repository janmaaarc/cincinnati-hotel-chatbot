import { useState } from 'react'
import { X, Send, Loader2, Mail, Phone, User } from 'lucide-react'

function ContactForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    const trimmedName = formData.name.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedPhone = formData.phone.trim()

    if (!trimmedName) {
      newErrors.name = 'Name is required'
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email is required'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email'
    } else if (trimmedEmail.length > 254) {
      newErrors.email = 'Email must be less than 254 characters'
    }

    if (trimmedPhone && !/^\+?[\d\s\-().]{7,20}$/.test(trimmedPhone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="mx-3 md:mx-4 mb-3 md:mb-4 animate-fadeInUp">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-hotel-gold/10 border-b border-hotel-gold/20 px-4 md:px-5 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-display text-hotel-charcoal">
                Request a Callback
              </h3>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                Our concierge team will assist you personally
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 md:p-2 text-gray-400 hover:text-hotel-charcoal hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">
              Full Name <span className="text-hotel-gold">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
                maxLength={100}
                autoComplete="name"
                className={`w-full bg-gray-50 border rounded-lg md:rounded-xl pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3
                           text-hotel-charcoal placeholder-gray-400 text-xs md:text-sm
                           focus:outline-none focus:ring-2 transition-all
                           ${errors.name
                             ? 'border-red-300 focus:ring-red-200'
                             : 'border-gray-200 focus:ring-hotel-gold/20 focus:border-hotel-gold'}`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                maxLength={20}
                autoComplete="tel"
                className={`w-full bg-gray-50 border rounded-lg md:rounded-xl pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3
                           text-hotel-charcoal placeholder-gray-400 text-xs md:text-sm
                           focus:outline-none focus:ring-2 transition-all
                           ${errors.phone
                             ? 'border-red-300 focus:ring-red-200'
                             : 'border-gray-200 focus:ring-hotel-gold/20 focus:border-hotel-gold'}`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">
              Email Address <span className="text-hotel-gold">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                maxLength={254}
                autoComplete="email"
                className={`w-full bg-gray-50 border rounded-lg md:rounded-xl pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 md:py-3
                           text-hotel-charcoal placeholder-gray-400 text-xs md:text-sm
                           focus:outline-none focus:ring-2 transition-all
                           ${errors.email
                             ? 'border-red-300 focus:ring-red-200'
                             : 'border-gray-200 focus:ring-hotel-gold/20 focus:border-hotel-gold'}`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 md:gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 md:py-3 text-gray-600 bg-gray-100
                         rounded-xl text-xs md:text-sm font-medium
                         hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-br from-hotel-gold to-hotel-gold-dark text-white rounded-xl
                         text-xs md:text-sm font-medium
                         hover:opacity-90 transition-all
                         shadow-lg shadow-hotel-gold/25
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Request Callback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContactForm
