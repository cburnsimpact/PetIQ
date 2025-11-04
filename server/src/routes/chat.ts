import { Router } from 'express'
import { auditService } from '../services/auditService.js'
import { verificationService } from '../services/verificationService.js'
import { v4 as uuidv4 } from 'uuid'
import { getUserType } from '../utils/emailUtils.js'

export const chatRouter = Router()

// Chat endpoint
chatRouter.post('/', async (req, res) => {
  try {
    const { message, email, conversationId, language } = req.body

    if (!message || !email) {
      return res.status(400).json({ error: 'Message and email are required' })
    }

    // Verify user is authenticated
    if (!verificationService.isVerified(email)) {
      return res.status(401).json({ error: 'Email not verified. Please verify your email first.' })
    }

    // Create or use existing conversation ID
    const convId = conversationId || uuidv4()

    const userType = getUserType(email)

    // Log incoming message
    await auditService.log({
      action: 'MESSAGE_RECEIVED',
      email,
      conversationId: convId,
      metadata: { message: message.substring(0, 100), userType }, // Truncate for logging
    })

    // Lazy-load chatService to avoid startup failure if OpenAI env is missing until chat is used
    const { chatService } = await import('../services/chatService.js')

    // Process message through triage and AI service
    const response = await chatService.processMessage({
      message,
      email,
      conversationId: convId,
      userType,
      language,
    })

    // Log response
    await auditService.log({
      action: 'MESSAGE_RESPONDED',
      email,
      conversationId: convId,
      metadata: { 
        responseLength: response.response.length,
        category: response.category,
        status: response.status,
        userType,
      },
    })

    res.json({
      response: response.response,
      conversationId: convId,
      category: response.category,
      status: response.status,
      userType,
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    res.status(500).json({ error: error.message || 'Failed to process message' })
  }
})

