import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import ChatInterface from './components/ChatInterface'
import AdminDashboard from './components/AdminDashboard'
import FloatingChatButton from './components/FloatingChatButton'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <FloatingChatButton />
    </BrowserRouter>
  )
}

export default App
