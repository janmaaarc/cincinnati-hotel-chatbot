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
      const result = await req.db.execute({
        sql: 'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC',
        args: [sessionId]
      })

      conversationSummary = result.rows
        .map(m => `${m.role === 'user' ? 'Guest' : 'Assistant'}: ${m.content}`)
        .join('\n')
    }

    await req.db.execute({
      sql: `INSERT INTO contact_submissions
        (session_id, name, phone, email, unanswered_question, conversation_summary)
        VALUES (?, ?, ?, ?, ?, ?)`,
      args: [sessionId || null, name, phone || null, email, unansweredQuestion || null, conversationSummary]
    })

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
