import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

function FloatingChatButton() {
  const navigate = useNavigate()
  const location = useLocation()

  // Hide on chat page and admin page
  if (location.pathname === '/chat' || location.pathname === '/admin') {
    return null
  }

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50
                 w-12 h-12 md:w-14 md:h-14
                 bg-gradient-to-br from-hotel-gold to-hotel-gold-dark
                 rounded-full shadow-xl shadow-hotel-gold/30
                 flex items-center justify-center
                 hover:scale-110 hover:shadow-2xl hover:shadow-hotel-gold/40
                 active:scale-95
                 transition-all duration-300
                 animate-pulse-gold
                 group"
      aria-label="Open chat"
    >
      <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
    </button>
  )
}

export default FloatingChatButton
