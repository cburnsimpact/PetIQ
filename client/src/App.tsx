import { useEffect, useState } from 'react'
import ChatbotWidget from './components/ChatbotWidget'
import { EmailHRModal } from './components/EmailHRModal'
import './App.css'
import { Login } from './components/Login'
import { HrAnalytics } from './components/HrAnalytics'
import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [isAnalytics, setIsAnalytics] = useState<boolean>(window.location.hash === '#/hr-analytics')

  const handleLoginSuccess = (workEmail: string, givenName?: string) => {
    setUserEmail(workEmail)
    setIsAuthenticated(true)
    if (givenName) setFirstName(givenName)
  }

  useEffect(() => {
    const onHashChange = () => setIsAnalytics(window.location.hash === '#/hr-analytics')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="app">
      <a href="/" className="corner-logo" aria-label="PetIQ Home">
        <img src="/petiqlogo.png" alt="PetIQ logo" />
      </a>
      <header className="app-header">
        <div className="brand">
          <h1>{t('app.title')}</h1>
        </div>
        <p>{t('app.subtitle')}</p>
      </header>
      <main className="app-main">
        {isAnalytics ? (
          <div className="welcome-section">
            <HrAnalytics />
          </div>
        ) : !isAuthenticated ? (
          <div className="welcome-section">
            <Login onSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="welcome-section">
            {firstName && (
              <p style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>{t('appHome.welcomeHi', { name: firstName })}</p>
            )}
            <h2>{t('appHome.welcomeTitle')}</h2>
            <p>
              {t('appHome.welcomeBody')}
            </p>
            

            <div className="policy-docs">
            <h3>{t('appHome.policyDocs')}</h3>
            <div className="policy-list">
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/BenefitsSummary2026.txt" target="_blank" rel="noopener noreferrer">Benefits Summary 2026</a></div>
                <div className="policy-desc">Overview of medical, dental, vision and coverage levels for the 2026 plan year.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/CompensationandPayPolicy.txt" target="_blank" rel="noopener noreferrer">Compensation and Pay Policy</a></div>
                <div className="policy-desc">Pay structure, salary bands, overtime, payroll schedules, and adjustments.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/EmployeeEligibilityRequirements.txt" target="_blank" rel="noopener noreferrer">Employee Eligibility Requirements</a></div>
                <div className="policy-desc">Eligibility criteria for employment status and benefits participation.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/FSAEnrollmentGuide.txt" target="_blank" rel="noopener noreferrer">FSA Enrollment Guide</a></div>
                <div className="policy-desc">How to enroll in Flexible Spending Accounts, eligible expenses, and annual limits.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/NewHireBenefitsChecklist.txt" target="_blank" rel="noopener noreferrer">New Hire Benefits Checklist</a></div>
                <div className="policy-desc">Step-by-step checklist for new employees to select and enroll in benefits.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/OpenEnrollmentAnnouncement.txt" target="_blank" rel="noopener noreferrer">Open Enrollment Announcement</a></div>
                <div className="policy-desc">Key dates, deadlines, and instructions for the upcoming open enrollment period.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/PetIQOpenEnrollmentDocuments.txt" target="_blank" rel="noopener noreferrer">Open Enrollment Documents</a></div>
                <div className="policy-desc">Packet of forms and resources needed to complete open enrollment.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/PTOandSickTimePolicy.txt" target="_blank" rel="noopener noreferrer">PTO and Sick Time Policy</a></div>
                <div className="policy-desc">Accrual rules, request process, holiday observances, and sick time usage.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/QualifyingLifeEventsGuide.txt" target="_blank" rel="noopener noreferrer">Qualifying Life Events Guide</a></div>
                <div className="policy-desc">What counts as a QLE and how to make mid-year benefits changes.</div>
              </div>
              <div className="policy-row">
                <div className="policy-name"><a href="https://petiq-client.onrender.com/docs/view/RemoteWorkPolicy.txt" target="_blank" rel="noopener noreferrer">Remote Work Policy</a></div>
                <div className="policy-desc">Expectations, eligibility, equipment, and security guidelines for remote work.</div>
              </div>
            </div>
          </div>

          <div className="faq">
            <h3>Frequently asked questions</h3>
            <div className="faq-list">
              <details className="faq-item">
                <summary>When do my benefits become effective as a new hire?</summary>
                <div>
                  Full-time employees (30+ hours/week) become eligible for all benefits on the first day of the month following 30 days of employment. New hires must complete enrollment within 30 days of hire.
                  See: Eligibility Requirements and New Hire Benefits Checklist.
                </div>
              </details>

              <details className="faq-item">
                <summary>What health plan options and costs are available for 2026?</summary>
                <div>
                  PPO: $150/month employee contribution, $500 deductible. HMO: $75/month, $250 deductible. High Deductible Plan with HSA: $50/month, $1,500 deductible.
                  See: 2026 Benefits Overview.
                </div>
              </details>

              <details className="faq-item">
                <summary>What is the 401(k) match and vesting?</summary>
                <div>
                  PetIQ matches 50% of your contributions up to 6% of salary, with immediate vesting.
                  See: 2026 Benefits Overview.
                </div>
              </details>

              <details className="faq-item">
                <summary>How does PTO accrue and when can I use it?</summary>
                <div>
                  Full-time accrual per year: 0–2 yrs: 15 days; 3–5 yrs: 20; 6–10 yrs: 22; 11+ yrs: 25. PTO accrues from day 1 and can be used after 90 days. Requests should be submitted at least 2 weeks in advance; minimum increment 2 hours.
                  See: PTO and Sick Time Policy.
                </div>
              </details>

              <details className="faq-item">
                <summary>How much PTO can I carry over each year?</summary>
                <div>
                  Up to 80 hours (10 days) may be carried over; any hours above 80 at year-end are forfeited. Unused PTO up to 80 hours is paid out at termination if notice requirements are met.
                  See: PTO and Sick Time Policy.
                </div>
              </details>

              <details className="faq-item">
                <summary>How does sick time work?</summary>
                <div>
                  All employees accrue 1 hour of sick time for every 30 hours worked, up to 56 hours (7 days) per year. Usable after 90 days; no carryover; not paid out at termination.
                  See: PTO and Sick Time Policy.
                </div>
              </details>

              <details className="faq-item">
                <summary>What counts as a Qualifying Life Event (QLE) and what is the deadline?</summary>
                <div>
                  Examples: marriage/divorce, birth/adoption, death of a dependent, child turning 26, spouse employment changes, moving to a new service area, loss of other coverage. You must notify HR within 30 days and provide documentation. Changes must be consistent with the event.
                  See: Qualifying Life Events Guide.
                </div>
              </details>

              <details className="faq-item">
                <summary>When is Open Enrollment and when do new benefits take effect?</summary>
                <div>
                  Open Enrollment for 2026 runs Nov 1–Nov 30, 2025. Benefits fair is Nov 15 (10 AM – 2 PM). New benefits take effect Jan 1, 2026.
                  See: Open Enrollment Announcement.
                </div>
              </details>

              <details className="faq-item">
                <summary>How do FSAs work and what are the limits?</summary>
                <div>
                  Healthcare FSA max: $3,200 (2026), with up to $610 carryover. Dependent Care FSA max: $5,000, no carryover. Enroll during Open Enrollment by Nov 30, 2025.
                  See: FSA Enrollment Guide.
                </div>
              </details>

              <details className="faq-item">
                <summary>Who is eligible for benefits (employees and dependents)?</summary>
                <div>
                  Full-time: eligible for all benefits (effective first day of month after 30 days). Part-time (20–29 hrs): 401(k) immediately, prorated PTO, may purchase healthcare at full cost. Temporary/seasonal: no healthcare; 401(k) after 1 year. Dependents: spouse/domestic partner and children up to age 26.
                  See: Eligibility Requirements.
                </div>
              </details>

              <details className="faq-item">
                <summary>Am I eligible for remote work? What are the expectations?</summary>
                <div>
                  Eligibility generally requires 6+ months of employment, satisfactory performance, and manager approval. Core availability hours are 9:00 AM–4:00 PM local time with timely response expectations. VPN and security practices are required.
                  See: Remote Work Policy.
                </div>
              </details>

              <details className="faq-item">
                <summary>When do I get paid and is direct deposit required?</summary>
                <div>
                  Pay is bi-weekly (26 pay periods). Payday is the Friday after the pay period ends. Direct deposit is required; deposits post by 9:00 AM on payday.
                  See: Compensation and Pay Policy.
                </div>
              </details>

              <details className="faq-item">
                <summary>How does overtime work for non-exempt employees?</summary>
                <div>
                  Overtime is 1.5x the regular rate for hours over 40 in a workweek and must be pre-approved. PTO, sick time, and holidays do not count toward hours worked for overtime purposes.
                  See: Compensation and Pay Policy.
                </div>
              </details>
            </div>
          </div>

          <div className="contact-hr-cta">
            <button className="email-hr-cta" onClick={() => setIsEmailOpen(true)}>
              {t('appHome.contactCta')}
            </button>
				</div>
          </div>
        )}
      </main>
      {!isAnalytics && isAuthenticated && <ChatbotWidget isVerified={true} userEmail={userEmail || ''} />}
      <EmailHRModal isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)} />
    </div>
  )
}

export default App

