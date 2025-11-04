import { Router } from 'express'
import { auditService } from '../services/auditService.js'

export const auditRouter = Router()

// Get audit logs (with optional filters)
auditRouter.get('/logs', async (req, res) => {
  try {
    const { email, conversationId, action, startDate, endDate } = req.query

    const filters: any = {}
    if (email) filters.email = email as string
    if (conversationId) filters.conversationId = conversationId as string
    if (action) filters.action = action as string
    if (startDate) filters.startDate = new Date(startDate as string)
    if (endDate) filters.endDate = new Date(endDate as string)

    const logs = await auditService.getLogs(filters)

    res.json({ logs, count: logs.length })
  } catch (error: any) {
    console.error('Audit log retrieval error:', error)
    res.status(500).json({ error: error.message || 'Failed to retrieve audit logs' })
  }
})

// Get inquiry status for a conversation
auditRouter.get('/inquiry/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params

    const status = await auditService.getInquiryStatus(conversationId)

    res.json(status)
  } catch (error: any) {
    console.error('Inquiry status retrieval error:', error)
    res.status(500).json({ error: error.message || 'Failed to retrieve inquiry status' })
  }
})

