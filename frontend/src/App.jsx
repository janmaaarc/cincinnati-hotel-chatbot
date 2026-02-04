import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SimpleLandingPage from './components/SimpleLandingPage'
import ChatInterface from './components/ChatInterface'
import AdminDashboard from './components/AdminDashboard'
import NotFound from './components/NotFound'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleLandingPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
