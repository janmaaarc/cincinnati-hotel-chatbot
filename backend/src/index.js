import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { initializeDatabase } from './db/database.js'
import chatRoutes from './routes/chat.js'
import adminRoutes from './routes/admin.js'
import contactRoutes from './routes/contact.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

const db = initializeDatabase()

app.use((req, res, next) => {
  req.db = db
  req.io = io
  next()
})

app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/contact', contactRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { io }
