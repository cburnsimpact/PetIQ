import { Router } from 'express'
import { verificationService } from '../services/verificationService.js'
import { auditService } from '../services/auditService.js'
import { getUserType } from '../utils/emailUtils.js'

export const verificationRouter = Router()

// Initiate verification - send code to email
verificationRouter.post('/initiate', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const result = await verificationService.initiateVerification(email)
    
    // Log verification initiation
    await auditService.log({
      action: 'VERIFICATION_INITIATED',
      email,
      metadata: { email },
    })

    res.json({ success: true, message: 'Verification code sent to email' })
  } catch (error: any) {
    console.error('Verification initiation error:', error)
    res.status(500).json({ error: error.message || 'Failed to initiate verification' })
  }
})

// Verify code
verificationRouter.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' })
    }

    const verified = await verificationService.verifyCode(email, code)

    // Log verification attempt
    await auditService.log({
      action: verified ? 'VERIFICATION_SUCCESS' : 'VERIFICATION_FAILED',
      email,
      metadata: { email, success: verified },
    })

    if (verified) {
      const userType = getUserType(email)
      res.json({ verified: true, userType, message: 'Email verified successfully' })
    } else {
      res.status(401).json({ verified: false, error: 'Invalid verification code' })
    }
  } catch (error: any) {
    console.error('Verification error:', error)
    res.status(500).json({ error: error.message || 'Verification failed' })
  }
})

