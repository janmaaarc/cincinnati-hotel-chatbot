import { Router } from 'express'
import { sendContactEmail } from '../services/emailService.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { sessionId, name, phone, email, unansweredQuestion } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' })
    }

    let conversationSummary = ''
    if (sessionId) {
      const messages = req.db.prepare(
        'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC'
      ).all(sessionId)

      conversationSummary = messages
        .map(m => `${m.role === 'user' ? 'Guest' : 'Assistant'}: ${m.content}`)
        .join('\n')
    }

    const stmt = req.db.prepare(`
      INSERT INTO contact_submissions
      (session_id, name, phone, email, unanswered_question, conversation_summary)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    stmt.run(sessionId || null, name, phone || null, email, unansweredQuestion || null, conversationSummary)

    await sendContactEmail({
      name,
      phone,
      email,
      unansweredQuestion,
      conversationSummary
    })

    res.json({ success: true, message: 'Contact form submitted successfully' })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    res.status(500).json({ error: 'Failed to submit contact form' })
  }
})

export default router
