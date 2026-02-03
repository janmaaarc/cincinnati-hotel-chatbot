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

    req.db.prepare('DELETE FROM pdf_documents').run()

    const stmt = req.db.prepare(
      'INSERT INTO pdf_documents (filename, content, file_path) VALUES (?, ?, ?)'
    )
    stmt.run(req.file.originalname, pdfContent, filePath)

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

router.get('/pdf-info', (req, res) => {
  try {
    const pdfDoc = req.db.prepare(
      'SELECT filename, uploaded_at FROM pdf_documents ORDER BY uploaded_at DESC LIMIT 1'
    ).get()

    if (!pdfDoc) {
      return res.json({ hasPdf: false })
    }

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

router.get('/pdf-content', (req, res) => {
  try {
    const pdfDoc = req.db.prepare(
      'SELECT content FROM pdf_documents ORDER BY uploaded_at DESC LIMIT 1'
    ).get()

    if (!pdfDoc) {
      return res.json({ content: '' })
    }

    res.json({ content: pdfDoc.content })
  } catch (error) {
    console.error('Error fetching PDF content:', error)
    res.status(500).json({ error: 'Failed to fetch PDF content' })
  }
})

router.get('/stats', (req, res) => {
  try {
    const stats = getStats(req.db)
    res.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
