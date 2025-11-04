import { Router } from 'express'
import { getWorkEmailFor, listEmployees, getEmployeeByAnyEmail } from '../services/employeeDirectory.js'
import { verificationService } from '../services/verificationService.js'
import { getUserType } from '../utils/emailUtils.js'

export const authRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEMO_MODE = process.env.DEMO_MODE === 'true'

authRouter.post('/login', async (req, res) => {
	try {
		const email = (req.body?.email || '').toString().trim()
		if (!EMAIL_RE.test(email)) {
			return res.status(400).json({ error: 'Valid email is required' })
		}

		const workEmail = getWorkEmailFor(email)
		if (!workEmail) {
			return res.status(401).json({ error: 'Email not recognized. Try your PetIQ email (petiq.com) or your personal email on file.' })
		}

    if (DEMO_MODE) {
      // Demo: auto-verify mapped work email for chat access
      verificationService.markVerified(workEmail, 60 * 24)
    } else {
      // Non-demo: require verification initiation and code submission flow
      const empPending = getEmployeeByAnyEmail(workEmail) || getEmployeeByAnyEmail(email)
      const firstPending = empPending?.first_name || null
      return res.status(202).json({ pendingVerification: true, workEmail, firstName: firstPending })
    }

    const userType = getUserType(workEmail)

    const emp = getEmployeeByAnyEmail(workEmail) || getEmployeeByAnyEmail(email)
    const firstName = emp?.first_name || null

    return res.json({ workEmail, userType, firstName })
	} catch (err: any) {
		console.error('Login error:', err)
		return res.status(500).json({ error: err?.message || 'Login failed' })
	}
})

// Demo-only: list employees loaded from CSV
authRouter.get('/employees', async (_req, res) => {
  if (!DEMO_MODE) {
    return res.status(404).json({ error: 'Not found' })
  }
	try {
		const rows = listEmployees()
		return res.json({ employees: rows })
	} catch (err: any) {
		console.error('List employees error:', err)
		return res.status(500).json({ error: err?.message || 'Failed to list employees' })
	}
})


