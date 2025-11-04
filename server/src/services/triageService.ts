interface TriageResult {
  category: string
  requiresEscalation: boolean
  requiresAction: boolean
  priority: 'low' | 'medium' | 'high'
}

const HR_KEYWORDS = {
  benefits: ['benefits', 'insurance', 'health', 'dental', 'vision', '401k', 'retirement'],
  enrollment: ['open enrollment', 'enroll', 'enrollment', 'select benefits'],
  pto: ['pto', 'vacation', 'time off', 'leave', 'holiday', 'sick', 'personal time'],
  policies: [
    'policy',
    'policies',
    'handbook',
    'rules',
    'guidelines',
    'code of conduct',
    // Remote/hybrid keywords
    'remote',
    'remote work',
    'work from home',
    'wfh',
    'telework',
    'hybrid',
    'home office',
  ],
  payroll: ['payroll', 'pay', 'salary', 'wage', 'paycheck', 'direct deposit'],
  contact: ['contact', 'reach', 'speak', 'talk to', 'hr contact', 'hr email'],
  general: ['hr', 'human resources', 'help', 'assistance', 'question'],
}

export const triageService = {
  categorize: async (message: string): Promise<TriageResult> => {
    const lowerMessage = message.toLowerCase()
    
    let category = 'general'
    let requiresEscalation = false
    let requiresAction = false
    let priority: 'low' | 'medium' | 'high' = 'medium'

    // Categorize based on keywords
    for (const [cat, keywords] of Object.entries(HR_KEYWORDS)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        category = cat
        break
      }
    }

    // Determine if escalation is needed
    const escalationKeywords = ['complaint', 'harassment', 'discrimination', 'legal', 'urgent', 'emergency']
    if (escalationKeywords.some(keyword => lowerMessage.includes(keyword))) {
      requiresEscalation = true
      priority = 'high'
    }

    // Determine if action is required
    const actionKeywords = ['request', 'update', 'change', 'submit', 'apply', 'file']
    if (actionKeywords.some(keyword => lowerMessage.includes(keyword))) {
      requiresAction = true
      if (category === 'contact') {
        requiresEscalation = true
      }
    }

    // Set priority based on category
    if (category === 'contact' || category === 'policies') {
      priority = 'high'
    } else if (category === 'general') {
      priority = 'low'
    }

    return {
      category,
      requiresEscalation,
      requiresAction,
      priority,
    }
  },
}

