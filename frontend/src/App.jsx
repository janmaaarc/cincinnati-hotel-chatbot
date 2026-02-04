import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import SimpleLandingPage from './components/SimpleLandingPage'
import LandingPage from './components/LandingPage'
import ChatInterface from './components/ChatInterface'
import AdminDashboard from './components/AdminDashboard'
import FloatingChatButton from './components/FloatingChatButton'
import NotFound from './components/NotFound'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/simple" element={<SimpleLandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingChatButton />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
