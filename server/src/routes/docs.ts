import { Router } from 'express'
import { hrDataService } from '../services/hrDataService.js'
import { UserType } from '../utils/emailUtils.js'

export const docsRouter = Router()

docsRouter.get('/suggest', async (req, res) => {
  try {
    const category = String(req.query.category || 'general')
    const userType = (String(req.query.userType || 'internal') as UserType)

    const context = await hrDataService.getContextForCategory(category, userType)
    const names = Array.from(context.matchAll(/^===\s*(.+?)\s*===/gm)).map(m => m[1]).slice(0, 5)
    const attachments = names.map(name => ({
      name,
      url: `/docs/view/${encodeURIComponent(name)}`,
    }))

    res.json({ attachments })
  } catch (err: any) {
    console.error('docs/suggest error', err)
    res.status(500).json({ error: err?.message || 'Failed to suggest docs' })
  }
})



