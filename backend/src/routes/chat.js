import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { sendToN8n } from '../services/n8nService.js'
import { getStats } from '../services/statsService.js'

const router = Router()

router.post('/session', (req, res) => {
  try {
    const sessionId = uuidv4()
    const stmt = req.db.prepare('INSERT INTO chat_sessions (id) VALUES (?)')
    stmt.run(sessionId)

    res.json({ sessionId })
  } catch (error) {
    console.error('Error creating session:', error)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' })
    }

    const session = req.db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const insertUserMsg = req.db.prepare(
      'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)'
    )
    insertUserMsg.run(sessionId, 'user', message)

    const pdfDoc = req.db.prepare(
      'SELECT content FROM pdf_documents ORDER BY uploaded_at DESC LIMIT 1'
    ).get()

    const pdfContent = pdfDoc?.content || ''

    const n8nResponse = await sendToN8n({
      message,
      pdfContent,
      sessionId
    })

    const { answer, category, answerFound } = n8nResponse

    const insertAssistantMsg = req.db.prepare(
      'INSERT INTO messages (session_id, role, content, category, answer_found) VALUES (?, ?, ?, ?, ?)'
    )
    insertAssistantMsg.run(sessionId, 'assistant', answer, category, answerFound ? 1 : 0)

    const stats = getStats(req.db)
    req.io.emit('statsUpdate', stats)

    res.json({
      answer,
      category,
      answerFound
    })
  } catch (error) {
    console.error('Error processing message:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params

    const messages = req.db.prepare(
      'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC'
    ).all(sessionId)

    res.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router
