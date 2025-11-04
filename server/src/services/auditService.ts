import { v4 as uuidv4 } from 'uuid'

interface AuditLog {
  id: string
  action: string
  email?: string
  conversationId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

// In-memory audit log (in production, use database)
const auditLogs: AuditLog[] = []

export const auditService = {
  log: async (logEntry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> => {
    // Shallow-redact potentially sensitive fields in metadata for in-memory/console logging
    const safeMetadata: Record<string, any> | undefined = logEntry.metadata
      ? { ...logEntry.metadata, message: logEntry.metadata.message ? '[redacted]' : logEntry.metadata.message }
      : undefined

    const auditLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date(),
      ...logEntry,
      metadata: safeMetadata,
    }

    auditLogs.push(auditLog)

    // In production, persist to database; console logging gated by env
    if (process.env.AUDIT_LOG_CONSOLE === 'true') {
      console.log('[AUDIT]', JSON.stringify(auditLog, null, 2))
    }
  },

  getLogs: async (filters?: {
    email?: string
    conversationId?: string
    action?: string
    startDate?: Date
    endDate?: Date
  }): Promise<AuditLog[]> => {
    let filtered = [...auditLogs]

    if (filters?.email) {
      filtered = filtered.filter(log => log.email === filters.email)
    }

    if (filters?.conversationId) {
      filtered = filtered.filter(log => log.conversationId === filters.conversationId)
    }

    if (filters?.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }

    if (filters?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate!)
    }

    if (filters?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate!)
    }

    // Sort by timestamp descending
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  // Get inquiry status tracking
  getInquiryStatus: async (conversationId: string): Promise<{
    conversationId: string
    status: string
    messages: number
    lastActivity: Date | null
    categories: string[]
  }> => {
    const logs = await auditService.getLogs({ conversationId })

    const messages = logs.filter(log => 
      log.action === 'MESSAGE_RECEIVED' || log.action === 'MESSAGE_RESPONDED'
    )

    const categories = logs
      .map(log => log.metadata?.category)
      .filter((cat): cat is string => Boolean(cat))

    const lastActivity = logs.length > 0 ? logs[0].timestamp : null

    // Determine status
    let status = 'active'
    const lastMessage = logs.find(log => log.action === 'MESSAGE_RECEIVED')
    const lastResponse = logs.find(log => log.action === 'MESSAGE_RESPONDED')
    
    if (lastResponse && lastMessage && lastResponse.timestamp > lastMessage.timestamp) {
      const responseMetadata = logs.find(log => log.action === 'MESSAGE_RESPONDED')?.metadata
      status = responseMetadata?.status || 'answered'
    }

    return {
      conversationId,
      status,
      messages: messages.length,
      lastActivity,
      categories: [...new Set(categories)],
    }
  },
}

