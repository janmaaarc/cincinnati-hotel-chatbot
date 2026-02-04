function HotelLogo({ className = "w-10 h-10" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Building base */}
      <rect x="8" y="16" width="32" height="28" rx="2" fill="currentColor" fillOpacity="0.9" />

      {/* Roof/top accent */}
      <path d="M6 16L24 6L42 16H6Z" fill="currentColor" />

      {/* Windows - left column */}
      <rect x="12" y="20" width="4" height="5" rx="0.5" fill="white" fillOpacity="0.3" />
      <rect x="12" y="28" width="4" height="5" rx="0.5" fill="white" fillOpacity="0.3" />

      {/* Windows - right column */}
      <rect x="32" y="20" width="4" height="5" rx="0.5" fill="white" fillOpacity="0.3" />
      <rect x="32" y="28" width="4" height="5" rx="0.5" fill="white" fillOpacity="0.3" />

      {/* Center door */}
      <rect x="20" y="32" width="8" height="12" rx="1" fill="white" fillOpacity="0.25" />
      <circle cx="26" cy="38" r="0.8" fill="white" fillOpacity="0.5" />

      {/* Top window/balcony */}
      <rect x="20" y="20" width="8" height="8" rx="1" fill="white" fillOpacity="0.2" />

      {/* Star accent */}
      <circle cx="24" y="11" r="2" fill="white" fillOpacity="0.8" />
    </svg>
  )
}

export default HotelLogo
