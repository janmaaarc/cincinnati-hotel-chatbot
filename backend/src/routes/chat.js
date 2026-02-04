import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { sendToN8n } from '../services/n8nService.js'
import { getStats } from '../services/statsService.js'

const router = Router()

router.post('/session', async (req, res) => {
  try {
    const sessionId = uuidv4()
    await req.db.execute({
      sql: 'INSERT INTO chat_sessions (id) VALUES (?)',
      args: [sessionId]
    })

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

    const sessionResult = await req.db.execute({
      sql: 'SELECT * FROM chat_sessions WHERE id = ?',
      args: [sessionId]
    })
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    await req.db.execute({
      sql: 'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)',
      args: [sessionId, 'user', message]
    })

    const pdfResult = await req.db.execute(
      'SELECT content FROM pdf_documents ORDER BY uploaded_at DESC LIMIT 1'
    )
    const pdfContent = pdfResult.rows[0]?.content || ''

    const n8nResponse = await sendToN8n({
      message,
      pdfContent,
      sessionId
    })

    const { answer, category, answerFound } = n8nResponse

    await req.db.execute({
      sql: 'INSERT INTO messages (session_id, role, content, category, answer_found) VALUES (?, ?, ?, ?, ?)',
      args: [sessionId, 'assistant', answer, category, answerFound ? 1 : 0]
    })

    const stats = await getStats(req.db)
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

router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    const result = await req.db.execute({
      sql: 'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      args: [sessionId]
    })

    res.json({ messages: result.rows })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router
