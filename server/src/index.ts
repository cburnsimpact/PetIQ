import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { verificationRouter } from './routes/verification.js'
import { chatRouter } from './routes/chat.js'
import { auditRouter } from './routes/audit.js'
import { publicDocsRouter } from './routes/publicDocs.js'
import { docsRouter } from './routes/docs.js'
import { authRouter } from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Trust reverse proxy (Render) and hide implementation details
app.set('trust proxy', 1)
app.disable('x-powered-by')

// Security headers (CSP disabled for now; can be tuned later)
app.use(helmet({ contentSecurityPolicy: false }))

// Optional HTTPS enforcement behind TLS-terminating proxy
if (process.env.ENFORCE_HTTPS === 'true') {
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next()
    res.redirect(301, `https://${req.headers.host}${req.url}`)
  })
}

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: false,
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json({ limit: '100kb' }))

// Basic rate limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(globalLimiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/verification', rateLimit({ windowMs: 10 * 60 * 1000, max: 20 }), verificationRouter)
app.use('/api/chat', rateLimit({ windowMs: 60 * 1000, max: 30 }), chatRouter)
app.use('/api/audit', auditRouter)
app.use('/api/docs', docsRouter)

// Public document viewer and static policy documents
const docsDir = process.env.HR_DOCS_DIR || path.join(process.cwd(), 'docs')
app.use('/docs', publicDocsRouter)
if (DEMO_MODE) {
  app.use('/docs', express.static(docsDir))
}

// Friendly root route
app.get('/', (req, res) => {
  res.json({
    service: 'PetIQ API',
    status: 'ok',
    health: '/api/health',
    docs: '/docs',
  })
})

// Generic error handler (do not leak internals)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err?.message || err)
  res.status(500).json({ error: 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

