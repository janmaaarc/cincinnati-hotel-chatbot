import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pdfParse from 'pdf-parse'
import { getStats } from '../services/statsService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, 'hotel-info.pdf')
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    const filePath = req.file.path
    const fileBuffer = fs.readFileSync(filePath)
    const pdfData = await pdfParse(fileBuffer)
    const pdfContent = pdfData.text

    await req.db.execute('DELETE FROM pdf_documents')

    await req.db.execute({
      sql: 'INSERT INTO pdf_documents (filename, content, file_path) VALUES (?, ?, ?)',
      args: [req.file.originalname, pdfContent, filePath]
    })

    res.json({
      success: true,
      message: 'PDF uploaded successfully',
      filename: req.file.originalname,
      pageCount: pdfData.numpages
    })
  } catch (error) {
    console.error('Error uploading PDF:', error)
    res.status(500).json({ error: 'Failed to upload PDF' })
  }
})

router.get('/pdf-info', async (req, res) => {
  try {
    const result = await req.db.execute(
      'SELECT filename, uploaded_at FROM pdf_documents ORDER BY uploaded_at DESC LIMIT 1'
    )

    if (result.rows.length === 0) {
      return res.json({ hasPdf: false })
    }

    const pdfDoc = result.rows[0]
    res.json({
      hasPdf: true,
      filename: pdfDoc.filename,
      uploadedAt: pdfDoc.uploaded_at
    })
  } catch (error) {
    console.error('Error fetching PDF info:', error)
    res.status(500).json({ error: 'Failed to fetch PDF info' })
  }
})

router.get('/pdf-content', async (req, res) => {
  try {
    const result = await req.db.execute(
      'SELECT content FROM pdf_documents ORDER BY uploaded_at DESC LIMIT 1'
    )

    if (result.rows.length === 0) {
      return res.json({ content: '' })
    }

    res.json({ content: result.rows[0].content })
  } catch (error) {
    console.error('Error fetching PDF content:', error)
    res.status(500).json({ error: 'Failed to fetch PDF content' })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats(req.db)
    res.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Delete single contact submission
router.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params
    await req.db.execute({
      sql: 'DELETE FROM contact_submissions WHERE id = ?',
      args: [parseInt(id)]
    })
    res.json({ success: true, message: 'Contact deleted' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    res.status(500).json({ error: 'Failed to delete contact' })
  }
})

// Bulk delete contact submissions
router.delete('/contacts', async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' })
    }

    const placeholders = ids.map(() => '?').join(',')
    await req.db.execute({
      sql: `DELETE FROM contact_submissions WHERE id IN (${placeholders})`,
      args: ids.map(id => parseInt(id))
    })

    res.json({ success: true, message: `${ids.length} contacts deleted` })
  } catch (error) {
    console.error('Error bulk deleting contacts:', error)
    res.status(500).json({ error: 'Failed to delete contacts' })
  }
})

// Get contact form submissions
router.get('/contacts', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const result = await req.db.execute({
      sql: `SELECT id, session_id, name, phone, email, unanswered_question, created_at
            FROM contact_submissions
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
      args: [parseInt(limit), parseInt(offset)]
    })

    const countResult = await req.db.execute('SELECT COUNT(*) as count FROM contact_submissions')
    const total = countResult.rows[0]?.count || 0

    res.json({
      contacts: result.rows,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

// Get chat sessions with message counts
router.get('/sessions', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const result = await req.db.execute({
      sql: `SELECT
              s.id,
              s.created_at,
              COUNT(m.id) as message_count,
              (SELECT content FROM messages WHERE session_id = s.id AND role = 'user' ORDER BY created_at LIMIT 1) as first_message,
              MAX(m.created_at) as last_activity
            FROM chat_sessions s
            LEFT JOIN messages m ON s.id = m.session_id
            GROUP BY s.id
            ORDER BY s.created_at DESC
            LIMIT ? OFFSET ?`,
      args: [parseInt(limit), parseInt(offset)]
    })

    const countResult = await req.db.execute('SELECT COUNT(*) as count FROM chat_sessions')
    const total = countResult.rows[0]?.count || 0

    res.json({
      sessions: result.rows,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// Get full conversation for a session
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const messagesResult = await req.db.execute({
      sql: `SELECT id, role, content, category, answer_found, created_at
            FROM messages
            WHERE session_id = ?
            ORDER BY created_at ASC`,
      args: [sessionId]
    })

    const sessionResult = await req.db.execute({
      sql: 'SELECT id, created_at FROM chat_sessions WHERE id = ?',
      args: [sessionId]
    })

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})

// Delete single session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    // Delete messages first (foreign key constraint)
    await req.db.execute({
      sql: 'DELETE FROM messages WHERE session_id = ?',
      args: [sessionId]
    })
    // Delete the session
    await req.db.execute({
      sql: 'DELETE FROM chat_sessions WHERE id = ?',
      args: [sessionId]
    })
    res.json({ success: true, message: 'Session deleted' })
  } catch (error) {
    console.error('Error deleting session:', error)
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

// Bulk delete sessions
router.delete('/sessions', async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' })
    }

    const placeholders = ids.map(() => '?').join(',')
    // Delete messages first
    await req.db.execute({
      sql: `DELETE FROM messages WHERE session_id IN (${placeholders})`,
      args: ids
    })
    // Delete sessions
    await req.db.execute({
      sql: `DELETE FROM chat_sessions WHERE id IN (${placeholders})`,
      args: ids
    })

    res.json({ success: true, message: `${ids.length} sessions deleted` })
  } catch (error) {
    console.error('Error bulk deleting sessions:', error)
    res.status(500).json({ error: 'Failed to delete sessions' })
  }
})

// Get popular questions (most frequently asked)
router.get('/popular-questions', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const result = await req.db.execute({
      sql: `SELECT content, COUNT(*) as count
            FROM messages
            WHERE role = 'user'
            GROUP BY LOWER(TRIM(content))
            HAVING COUNT(*) > 1
            ORDER BY count DESC
            LIMIT ?`,
      args: [parseInt(limit)]
    })

    res.json({ questions: result.rows })
  } catch (error) {
    console.error('Error fetching popular questions:', error)
    res.status(500).json({ error: 'Failed to fetch popular questions' })
  }
})

// Get daily stats for trends chart
router.get('/daily-stats', async (req, res) => {
  try {
    const { days = 30 } = req.query
    const result = await req.db.execute({
      sql: `SELECT
              DATE(created_at) as date,
              COUNT(DISTINCT session_id) as sessions,
              COUNT(*) as messages
            FROM messages
            WHERE created_at >= datetime('now', '-' || ? || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC`,
      args: [parseInt(days)]
    })

    res.json({ dailyStats: result.rows })
  } catch (error) {
    console.error('Error fetching daily stats:', error)
    res.status(500).json({ error: 'Failed to fetch daily stats' })
  }
})

// Export all sessions as CSV
router.get('/export/sessions', async (req, res) => {
  try {
    const result = await req.db.execute(`
      SELECT
        s.id,
        s.created_at,
        COUNT(m.id) as message_count,
        SUM(CASE WHEN m.answer_found = 0 THEN 1 ELSE 0 END) as unanswered_count
      FROM chat_sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `)

    const csv = [
      'Session ID,Created At,Message Count,Unanswered Count',
      ...result.rows.map(r =>
        `"${r.id}","${r.created_at}",${r.message_count || 0},${r.unanswered_count || 0}`
      )
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=sessions.csv')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting sessions:', error)
    res.status(500).json({ error: 'Failed to export sessions' })
  }
})

// Export all contacts as CSV
router.get('/export/contacts', async (req, res) => {
  try {
    const result = await req.db.execute(`
      SELECT id, name, phone, email, unanswered_question, created_at
      FROM contact_submissions
      ORDER BY created_at DESC
    `)

    const csv = [
      'ID,Name,Phone,Email,Question,Created At',
      ...result.rows.map(r =>
        `${r.id},"${(r.name || '').replace(/"/g, '""')}","${r.phone || ''}","${r.email || ''}","${(r.unanswered_question || '').replace(/"/g, '""')}","${r.created_at}"`
      )
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting contacts:', error)
    res.status(500).json({ error: 'Failed to export contacts' })
  }
})

// Export all messages as CSV
router.get('/export/messages', async (req, res) => {
  try {
    const result = await req.db.execute(`
      SELECT m.id, m.session_id, m.role, m.content, m.category, m.answer_found, m.created_at
      FROM messages m
      ORDER BY m.created_at DESC
    `)

    const csv = [
      'ID,Session ID,Role,Content,Category,Answer Found,Created At',
      ...result.rows.map(r =>
        `${r.id},"${r.session_id}","${r.role}","${(r.content || '').replace(/"/g, '""')}","${r.category || ''}",${r.answer_found},"${r.created_at}"`
      )
    ].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=messages.csv')
    res.send(csv)
  } catch (error) {
    console.error('Error exporting messages:', error)
    res.status(500).json({ error: 'Failed to export messages' })
  }
})

export default router
