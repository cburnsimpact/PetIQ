import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Attachment = { name: string; url: string }

interface EmailPreviewModalProps {
  open: boolean
  onClose: () => void
  to: string
  subject: string
  body: string
  attachments: Attachment[]
  shareWithHR: boolean
  onShareWithHRChange: (checked: boolean) => void
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  open,
  onClose,
  to,
  subject,
  body,
  attachments,
  shareWithHR,
  onShareWithHRChange,
}) => {
  if (!open) return null
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isFading, setIsFading] = useState(false)

  const handleSend = () => {
    if (sent) return
    setSent(true)
    setShowToast(true)
    setTimeout(() => {
      setIsFading(true)
      setTimeout(() => {
        setShowToast(false)
        onClose()
        setSent(false)
        setIsFading(false)
      }, 300)
    }, 3000)
  }
  return (
    <div className={`modal-overlay${isFading ? ' fade-out' : ''}`}>
      <div className="modal">
        <div className="modal-header">
          <h4>{t('previewEmail.title')}</h4>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="email-meta">
            <div><strong>{t('previewEmail.to')}:</strong> {to}</div>
            <div><strong>{t('previewEmail.subject')}:</strong> {subject}</div>
          </div>
          <div className="email-body">
            <pre>{body}</pre>
          </div>
          {attachments?.length ? (
            <div className="attachments">
              <div className="attachments-title">{t('previewEmail.attachments')}</div>
              <ul className="attachments-list">
                {attachments.map(a => (
                  <li key={a.name} className="attachment-item">
                    <a href={a.url} target="_blank" rel="noreferrer">{a.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="modal-actions">
          <label style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={shareWithHR}
              onChange={(e) => onShareWithHRChange(e.target.checked)}
            />
            {t('previewEmail.shareWithHr')}
          </label>
          <button className="send-button" onClick={handleSend} disabled={sent}>
            {sent ? t('previewEmail.sent') : t('previewEmail.sendEmail')}
          </button>
          <button className="send-button" onClick={onClose}>{t('previewEmail.close')}</button>
        </div>
      </div>
      {showToast && (
        <div className={`toast${isFading ? ' fade-out' : ''}`}>
          {t('previewEmail.toast', { shared: shareWithHR ? t('previewEmail.toastShared') : '.' })}
        </div>
      )}
    </div>
  )
}


