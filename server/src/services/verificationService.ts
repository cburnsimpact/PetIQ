import { v4 as uuidv4 } from 'uuid'

interface VerificationSession {
  email: string
  code: string
  expiresAt: Date
  attempts: number
}

// In-memory store for verification sessions (in production, use Redis or database)
const verificationSessions = new Map<string, VerificationSession>()

// For POC, we'll use simple 6-digit codes. In production, use actual email sending service
const CODE_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3

export const verificationService = {
  initiateVerification: async (email: string): Promise<void> => {
    const demoMode = process.env.DEMO_MODE === 'true'
    // Demo: use fixed code by default; configurable via VERIFICATION_DEMO_CODE
    const fixed = demoMode ? (process.env.VERIFICATION_DEMO_CODE || '123456').trim() : ''
    const code = fixed && /^\d{6}$/.test(fixed)
      ? fixed
      : Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store verification session
    const session: VerificationSession = {
      email,
      code,
      expiresAt: new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
    }

    verificationSessions.set(email, session)

    // In production, send email via service (SendGrid, AWS SES, etc.)
    // For POC/demo, log the code to console
    if (demoMode) {
      console.log(`[POC] Verification code for ${email}: ${code}`)
      console.log(`[POC] Using fixed demo code (configurable via VERIFICATION_DEMO_CODE)`)    
    }

    // Simulate async email sending
    await new Promise((resolve) => setTimeout(resolve, 500))
  },

  verifyCode: async (email: string, code: string): Promise<boolean> => {
    const session = verificationSessions.get(email)

    if (!session) {
      return false
    }

    // Check expiry
    if (new Date() > session.expiresAt) {
      verificationSessions.delete(email)
      return false
    }

    // Check attempts
    if (session.attempts >= MAX_ATTEMPTS) {
      verificationSessions.delete(email)
      return false
    }

    session.attempts++

    // Verify code
    if (session.code === code) {
      // Successful verification - keep session for authenticated user
      verificationSessions.set(email, {
        ...session,
        attempts: 0, // Reset attempts on success
      })
      return true
    }

    return false
  },

  // Programmatically mark a user as verified (used after CSV-based login)
  markVerified: (email: string, ttlMinutes = 60 * 24): void => {
    const session: VerificationSession = {
      email,
      code: 'ok',
      expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      attempts: 0,
    }
    verificationSessions.set(email, session)
  },

  isVerified: (email: string): boolean => {
    const session = verificationSessions.get(email)
    if (!session) return false
    
    // Check if code was verified (attempts = 0 means successful verification after code check)
    // In a real implementation, you'd have a separate verified flag
    return session.attempts === 0 && session.code !== undefined
  },

  // Clean up expired sessions (call periodically)
  cleanupExpiredSessions: (): void => {
    const now = new Date()
    for (const [email, session] of verificationSessions.entries()) {
      if (now > session.expiresAt) {
        verificationSessions.delete(email)
      }
    }
  },
}

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  verificationService.cleanupExpiredSessions()
}, 5 * 60 * 1000)

