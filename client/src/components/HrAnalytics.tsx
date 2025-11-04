import './HrAnalytics.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function HrAnalytics() {
  const { t } = useTranslation()
  // Mock data for visuals
  const categoryToCount = [
    { label: 'Benefits', value: 142 },
    { label: 'PTO', value: 118 },
    { label: 'Payroll', value: 96 },
    { label: 'Eligibility', value: 63 },
    { label: 'Remote work', value: 54 },
  ]

  const maxCategory = Math.max(...categoryToCount.map(c => c.value)) || 1

  const frequentUsers = [
    { user: 'alex.smith@petiq.com', sessions: 14, avgMinutes: 6.2 },
    { user: 'jordan.lee@petiq.com', sessions: 12, avgMinutes: 5.1 },
    { user: 'morgan.kim@petiq.com', sessions: 11, avgMinutes: 4.7 },
    { user: 'riley.chen@petiq.com', sessions: 9, avgMinutes: 7.0 },
    { user: 'taylor.hughes@petiq.com', sessions: 8, avgMinutes: 5.6 },
  ]

  const kpis = [
    { label: 'Total sessions (30d)', value: '1,284' },
    { label: 'Unique users', value: '512' },
    { label: 'Avg time per session', value: '5m 32s' },
    { label: 'Escalations to HR', value: '73' },
    { label: 'Resolution rate', value: '86%' },
  ]

  const sessionsOverTime = [4, 6, 5, 7, 8, 9, 7, 6, 8, 10, 11, 9, 8, 12, 13, 12, 11, 9, 10, 14, 16, 15, 13, 12, 14, 18, 17, 16, 15, 19]
  const maxSessions = Math.max(...sessionsOverTime)

  type Recommendation = { title: string; body: string }
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      title: 'Clarify PTO carryover limits',
      body: 'High volume of questions about year-end carryover. Add examples and a quick reference table to the PTO policy.'
    },
    {
      title: 'Add decision tree to Benefits Summary',
      body: 'Users compare PPO vs HSA frequently. Provide a simple decision tree and premium comparison by tier.'
    },
    {
      title: 'Improve remote work eligibility section',
      body: 'Confusion on tenure requirement and core hours. Add a checklist and request workflow diagram.'
    }
  ])

  const generateMoreRecommendations = () => {
    // random helpers
    const shuffled = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)
    const pick = <T,>(arr: T[], n: number) => shuffled(arr).slice(0, n)

    // choose 3 categories (weighted-ish by sorting then shuffling top slice)
    const top = [...categoryToCount].sort((a, b) => b.value - a.value)
    const candidates = top.slice(0, Math.max(3, Math.min(5, top.length)))
    const chosen = pick(candidates, Math.min(3, candidates.length))

    // choose a high-traffic day index
    const dayIndices = sessionsOverTime.map((v, i) => ({ v, i }))
    const highDays = dayIndices.sort((a, b) => b.v - a.v).slice(0, 7)
    const randomHighDay = highDays[Math.floor(Math.random() * highDays.length)]?.i ?? 0

    const titleTemplates = [
      (c: { label: string }) => `Create quick guide for ${c.label}`,
      (c: { label: string }) => `Expand FAQ coverage: ${c.label}`,
      (c: { label: string }) => `Improve policy examples for ${c.label}`,
      (c: { label: string }) => `Add Scout follow-ups for ${c.label} edge cases`,
      (c: { label: string }) => `Launch micro-learning on ${c.label}`
    ]

    const bodyTemplates = [
      (c: { label: string }) => `Publish a 1-page guide with scenarios and visuals for ${c.label}. Link it directly in Scout's top answers.`,
      (c: { label: string }) => `Add concise Q&A examples and clarify exceptions in the ${c.label} section to reduce escalations.`,
      (c: { label: string }) => `Introduce a short checklist and decision flow for ${c.label} to streamline self-service.`,
      (c: { label: string }) => `Tune Scout prompts to collect key details for ${c.label} so answers land on first try.`,
      (c: { label: string }) => `Embed quick tips for ${c.label} in relevant pages and Scout responses during peak periods.`
    ]

    const recs: Recommendation[] = chosen.map(c => {
      const t = titleTemplates[Math.floor(Math.random() * titleTemplates.length)](c)
      const b = bodyTemplates[Math.floor(Math.random() * bodyTemplates.length)](c)
      return { title: t, body: b }
    })

    // add a traffic-based nudge if fewer than 3 chosen
    while (recs.length < 3) {
      recs.push({
        title: `Proactive comms around day ${randomHighDay + 1} spikes`,
        body: `Traffic spikes suggest targeted reminders and a Scout tip the day before to deflect routine questions.`
      })
    }

    setRecommendations(recs)
  }

  const buildCsv = () => {
    const rows: string[] = []
    const push = (r: (string | number)[]) => rows.push(r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

    push(['Section', 'Metric', 'Value'])
    kpis.forEach(k => push(['KPIs', k.label, k.value]))
    rows.push('')

    push(['Section', 'Category', 'Count'])
    categoryToCount.forEach(c => push(['Top Categories', c.label, c.value]))
    rows.push('')

    push(['Section', 'Day', 'Sessions'])
    sessionsOverTime.forEach((v, i) => push(['Sessions (30d)', i + 1, v]))
    rows.push('')

    push(['Section', 'User', 'Sessions', 'Avg Minutes'])
    frequentUsers.forEach(u => push(['Frequent Users', u.user, u.sessions, u.avgMinutes]))

    return rows.join('\n')
  }

  const downloadCsv = (filename: string) => {
    const blob = new Blob([buildCsv()], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const draftEmailWithCsv = () => {
    const filename = 'scout-hr-analytics.csv'
    downloadCsv(filename)
    const subject = encodeURIComponent('Scout HR Analytics export')
    const body = encodeURIComponent(
      'Attached is the latest Scout HR Analytics CSV export.\n\nIf not attached automatically, please attach the downloaded file: ' + filename + '\n\n– Generated by Scout HR Analytics (demo)'
    )
    window.location.href = `mailto:hr@petiq.com?subject=${subject}&body=${body}`
  }

  const handleBack = () => {
    window.location.hash = ''
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div>
          <h2>{t('analytics.title')}</h2>
          <p className="muted">{t('analytics.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="secondary" onClick={() => downloadCsv('scout-hr-analytics.csv')}>{t('analytics.exportCsv')}</button>
          <button className="secondary" onClick={draftEmailWithCsv}>{t('analytics.draftEmailCsv')}</button>
          <button className="back-btn" onClick={handleBack}>{t('analytics.back')}</button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid">
        <div className="panel">
          <div className="panel-title">{t('analytics.topCategories')}</div>
          <div className="bar-list">
            {categoryToCount.map((c) => (
              <div className="bar-row" key={c.label}>
                <div className="bar-label">{c.label}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(c.value / maxCategory) * 100}%` }} />
                </div>
                <div className="bar-value">{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">{t('analytics.escalationRate')}</div>
          <div className="donut">
            <div className="donut-chart" aria-label="Escalation rate 14%" />
            <div className="donut-center">
              <div className="donut-value">14%</div>
              <div className="donut-sub">{t('analytics.escalated')}</div>
            </div>
          </div>
          <div className="legend">
            <span className="legend-dot green" /> {t('analytics.resolvedByScout')}
            <span className="legend-dot orange" /> {t('analytics.escalatedToHr')}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">{t('analytics.sessions30d')}</div>
          <svg className="line-chart" viewBox="0 0 300 120" role="img" aria-label="Sessions over time">
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              points={sessionsOverTime
                .map((v, i) => {
                  const x = (i / (sessionsOverTime.length - 1)) * 300
                  const y = 110 - (v / maxSessions) * 100
                  return `${x},${y}`
                })
                .join(' ')}
            />
          </svg>
          <div className="chart-hint muted">{t('analytics.chartHint')}</div>
        </div>

        <div className="panel panel-span-2">
          <div className="panel-title">{t('analytics.frequentUsers')}</div>
          <div className="table-wrap">
            <table className="table">
              <colgroup>
                <col style={{ width: '60%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>{t('analytics.user')}</th>
                  <th>{t('analytics.sessions')}</th>
                  <th>{t('analytics.avgTime')}</th>
                </tr>
              </thead>
              <tbody>
                {frequentUsers.map((u, i) => (
                  <tr key={i}>
                    <td className="mono">{u.user}</td>
                    <td>{u.sessions}</td>
                    <td>{u.avgMinutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel recommendations">
        <div className="recommendations-header">
          <div className="panel-title">{t('analytics.aiRecs')}</div>
          <button className="primary-green" onClick={generateMoreRecommendations}>{t('analytics.genMoreRecs')}</button>
        </div>
        <div className="recommendations-grid">
          {recommendations.map((r, i) => (
            <div className="rec-card" key={i}>
              <div className="rec-title">{r.title}</div>
              <div className="rec-body">{r.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


