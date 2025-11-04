import { useEffect, useState } from 'react'
import './EmailHRModal.css'
import { useTranslation } from 'react-i18next'

interface EmailHRModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EmailHRModal = ({ isOpen, onClose }: EmailHRModalProps) => {
  const { t } = useTranslation()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSubject('')
      setMessage('')
      setSent(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    // Fake send
    setSent(true)
    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="emailHrTitle">
      <div className="modal">
        <div className="modal-header">
          <h3 id="emailHrTitle">{t('emailHR.title')}</h3>
          <button className="close-button" onClick={onClose} aria-label={t('emailHR.close')}>✕</button>
        </div>
        <div className="modal-body">
          {!sent ? (
            <form onSubmit={submit} className="email-form">
              <div className="form-row">
                <label htmlFor="emailTo">{t('emailHR.to')}</label>
                <input id="emailTo" type="email" value="hr@petiq.com" readOnly />
              </div>
              <div className="form-row">
                <label htmlFor="emailSubject">{t('emailHR.subject')}</label>
                <input
                  id="emailSubject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('emailHR.subjectPh')}
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="emailMessage">{t('emailHR.message')}</label>
                <textarea
                  id="emailMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('emailHR.messagePh')}
                  rows={6}
                  required
                />
              </div>
              <div className="actions">
                <button type="button" className="secondary" onClick={onClose}>{t('emailHR.cancel')}</button>
                <button type="submit" className="primary">{t('emailHR.send')}</button>
              </div>
            </form>
          ) : (
            <div className="sent-state">
              <div className="sent-icon">✅</div>
              <p>{t('emailHR.sentMsg')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



