import { promises as fs } from 'fs'
import * as path from 'path'

interface HRContext {
  category: string
  content: string
}

type Doc = { name: string; content: string }

const DEFAULT_MAX_CHARS = 4000

// Allow override via env var; default to repo-level "PetIQ HR Docs" when server runs from server/ cwd
const DOCS_DIR = process.env.HR_DOCS_DIR || path.resolve(process.cwd(), '..', 'PetIQ HR Docs')

// Public document hints used to filter visible docs for guest users
const PUBLIC_HINTS = (process.env.HR_PUBLIC_DOC_HINTS || 'benefit,enrollment,pto,policy,remote,summary')
  .split(/[;,|]/)
  .map(s => s.trim().toLowerCase())
  .filter(Boolean)

// Lightweight mapping from triage category to likely filename hints
const CATEGORY_FILE_HINTS: Record<string, string[]> = {
  benefits: ['benefit', 'eligibility', 'fsa'],
  enrollment: ['open enrollment', 'enrollment', 'qualifying life', 'qle', 'new hire'],
  pto: ['pto', 'sick', 'time off', 'leave'],
  policies: [
    'policy',
    'remote',
    'remote work',
    'remotework',
    'work from home',
    'wfh',
    'telework',
    'hybrid',
    'pay policy',
    'compensation',
  ],
  payroll: ['payroll', 'pay', 'compensation', 'wage', 'direct deposit'],
  contact: [],
  general: [],
}

let docsCache: Doc[] | null = null

async function loadDocs(): Promise<Doc[]> {
  if (docsCache) return docsCache
  try {
    const names = await fs.readdir(DOCS_DIR)
    const fileNames: string[] = []
    for (const name of names) {
      const full = path.join(DOCS_DIR, name)
      try {
        const stat = await fs.stat(full)
        if (stat.isFile() && name.toLowerCase().endsWith('.txt')) {
          fileNames.push(name)
        }
      } catch {
        // skip entries we cannot stat
      }
    }
    const docs = await Promise.all(
      fileNames.map(async (fname) => {
        const content = await fs.readFile(path.join(DOCS_DIR, fname), 'utf8')
        return { name: fname, content }
      })
    )
    docsCache = docs
  } catch (err) {
    console.error(`Failed to load HR docs from ${DOCS_DIR}:`, err)
    docsCache = []
  }
  return docsCache
}

function buildContextFromDocs(category: string, docs: Doc[], maxChars = DEFAULT_MAX_CHARS): string {
  const hints = CATEGORY_FILE_HINTS[category] || []
  const lower = (s: string) => s.toLowerCase()

  const withScores = (hints.length ? docs.filter(d => hints.some(h => lower(d.name).includes(lower(h)))) : docs)
    .map(d => {
      const n = lower(d.name)
      const score = hints.reduce((acc, h) => acc + (n.includes(lower(h)) ? 1 : 0), 0)
      return { doc: d, score }
    })
    .sort((a, b) => b.score - a.score || a.doc.name.localeCompare(b.doc.name))
    .map(x => x.doc)

  const selected = withScores.length ? withScores : docs
  if (!selected.length) return 'No HR documents are available at this time.'

  let out = ''
  for (const d of selected) {
    const section = `=== ${d.name} ===\n${d.content.trim()}\n\n`
    if (out.length + section.length > maxChars) {
      const remaining = Math.max(0, maxChars - out.length)
      out += section.slice(0, remaining)
      break
    }
    out += section
  }
  return out || 'No HR documents are available at this time.'
}

export const hrDataService = {
  getContextForCategory: async (category: string, userType: 'internal' | 'external' = 'internal'): Promise<string> => {
    const docs = await loadDocs()
    const visibleDocs = userType === 'external'
      ? docs.filter(d => PUBLIC_HINTS.some(h => d.name.toLowerCase().includes(h)))
      : docs
    return buildContextFromDocs(category, visibleDocs)
  },

  // This will be expanded in Phase 2 to query actual HR systems
  getEmployeeInfo: async (email: string): Promise<any> => {
    // Deterministic demo data based on email
    function hashString(s: string): number {
      let h = 0
      for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
      return Math.abs(h)
    }
    function pick<T>(seed: number, arr: T[]): T {
      return arr[seed % arr.length]
    }
    function capWords(s: string) {
      return s.replace(/\b\w/g, c => c.toUpperCase())
    }

    const seed = hashString(email)
    const titles = ['Senior Analyst', 'HR Generalist', 'Operations Coordinator', 'Benefits Specialist', 'Software Engineer', 'Data Analyst']
    const departments = ['HR', 'Benefits', 'Operations', 'IT', 'Finance', 'People Ops']
    const locations = ['Eagle, ID', 'Boise, ID', 'Remote', 'Nampa, ID', 'Meridian, ID']
    const managers = ['Jamie Rivera', 'Chris Thompson', 'Avery Chen', 'Morgan Patel', 'Riley Anderson']
    const medicalPlans = ['PPO Silver', 'PPO Gold', 'HDHP HSA']
    const dentalPlans = ['Dental Basic', 'Dental Premium']
    const visionPlans = ['Vision Standard', 'Vision Plus']

    const localPart = email.split('@')[0].replace(/[._]/g, ' ')
    const name = capWords(localPart)

    return {
      email,
      employeeId: `E${100000 + (seed % 900000)}`,
      name,
      title: pick(seed, titles),
      department: pick(seed + 1, departments),
      location: pick(seed + 2, locations),
      manager: pick(seed + 3, managers),
      status: 'active',
      hireDate: '2022-04-18',
      tenureYears: 3.5,
      benefitsEligible: true,

      // Time off
      ptoBalanceHours: 56,
      ptoBalanceDays: 7,
      ptoAccrualHoursPerPayPeriod: 3.08,
      sickBalanceHours: 24,
      floatingHolidaysRemaining: 2,
      nextCompanyHoliday: '2025-11-27',

      // Benefits snapshot
      benefits: {
        medicalPlan: pick(seed + 4, medicalPlans),
        dentalPlan: pick(seed + 5, dentalPlans),
        visionPlan: pick(seed + 6, visionPlans),
        hsaBalance: 750.25,
        fsaBalance: 125.9,
        retirementContributionPct: 5,
      },

      // Payroll snapshot
      payroll: {
        nextPayDate: '2025-11-15',
        directDepositBank: 'Chase',
        ytdPtoUsedHours: 32,
        ytdSickUsedHours: 8,
      },

      // Quick contacts
      contacts: {
        hrGeneral: 'hr@petiq.com',
        benefits: 'benefits@petiq.com',
      },
    }
  },
}

