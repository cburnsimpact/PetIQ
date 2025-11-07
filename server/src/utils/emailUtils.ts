export type UserType = 'internal' | 'external'

const configured = (process.env.INTERNAL_EMAIL_DOMAINS || 'petiq.com')
  .split(/[;,]/)
  .map(s => s.trim().toLowerCase())
  .filter(Boolean)

function matchesDomain(domain: string, allow: string) {
  return domain === allow || domain.endsWith(`.${allow}`)
}

export function getUserType(email: string): UserType {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  return configured.some(d => matchesDomain(domain, d)) ? 'internal' : 'external'
}





