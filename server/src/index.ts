import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { verificationRouter } from './routes/verification.js'
import { chatRouter } from './routes/chat.js'
import { auditRouter } from './routes/audit.js'
import { docsRouter } from './routes/docs.js'
import { authRouter } from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/verification', verificationRouter)
app.use('/api/chat', chatRouter)
app.use('/api/audit', auditRouter)
app.use('/api/docs', docsRouter)

// Static policy documents
const docsDir = path.join(process.cwd(), '..', 'PetIQ HR Docs')
app.use('/docs', express.static(docsDir))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

