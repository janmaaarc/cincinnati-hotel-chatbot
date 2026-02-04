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

export default router
