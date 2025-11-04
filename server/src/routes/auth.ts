import { Router } from 'express'
import { getWorkEmailFor, listEmployees, getEmployeeByAnyEmail } from '../services/employeeDirectory.js'
import { verificationService } from '../services/verificationService.js'
import { getUserType } from '../utils/emailUtils.js'

export const authRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

    // Mark the mapped work email as verified for chat access
    verificationService.markVerified(workEmail, 60 * 24)
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
	try {
		const rows = listEmployees()
		return res.json({ employees: rows })
	} catch (err: any) {
		console.error('List employees error:', err)
		return res.status(500).json({ error: err?.message || 'Failed to list employees' })
	}
})


