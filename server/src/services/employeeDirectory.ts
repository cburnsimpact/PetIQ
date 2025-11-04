import fs from 'fs'
import path from 'path'

interface EmployeeRow {
	first_name: string
	last_name: string
	personal_email: string
	work_email: string
}

const csvPath = path.join(process.cwd(), '..', 'petiq_employee_contacts.csv')

function parseCsv(raw: string): EmployeeRow[] {
	const lines = raw.split(/\r?\n/).filter(Boolean)
	const rows: EmployeeRow[] = []
	// Expect header: first_name,last_name,personal_email,work_email
	for (let i = 1; i < lines.length; i++) {
		const parts = lines[i].split(',').map(s => s.trim())
		if (parts.length < 4) continue
		const [first_name, last_name, personal_email, work_email] = parts
		if (!personal_email || !work_email) continue
		rows.push({ first_name, last_name, personal_email: personal_email.toLowerCase(), work_email: work_email.toLowerCase() })
	}
	return rows
}

const personalToWork = new Map<string, string>()
const workToWork = new Map<string, string>()
let employees: EmployeeRow[] = []

try {
	const raw = fs.readFileSync(csvPath, 'utf8')
	const rows = parseCsv(raw)
	rows.forEach(r => {
		personalToWork.set(r.personal_email, r.work_email)
		workToWork.set(r.work_email, r.work_email)
	})
	employees = rows
	console.log(`[employeeDirectory] Loaded ${rows.length} employees from ${csvPath}`)
} catch (e) {
	console.error(`[employeeDirectory] Failed to load ${csvPath}:`, e)
}

export function getWorkEmailFor(inputEmail: string): string | null {
	if (!inputEmail) return null
	const email = inputEmail.trim().toLowerCase()
	if (personalToWork.has(email)) return personalToWork.get(email) || null
	if (workToWork.has(email)) return workToWork.get(email) || null
	return null
}

export function listEmployees(): EmployeeRow[] {
	return employees
}

export function getEmployeeByAnyEmail(inputEmail: string): EmployeeRow | null {
	if (!inputEmail) return null
	const email = inputEmail.trim().toLowerCase()
	return (
		employees.find(e => e.personal_email === email) ||
		employees.find(e => e.work_email === email) ||
		null
	)
}


