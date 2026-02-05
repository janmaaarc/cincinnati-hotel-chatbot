import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SimpleLandingPage from './components/SimpleLandingPage'
import ChatInterface from './components/ChatInterface'
import AdminDashboard from './components/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleLandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
