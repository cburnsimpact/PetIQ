import { useEffect, useState } from 'react'
import './EmailHRModal.css'

interface EmailHRModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EmailHRModal = ({ isOpen, onClose }: EmailHRModalProps) => {
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
          <h3 id="emailHrTitle">Email HR</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          {!sent ? (
            <form onSubmit={submit} className="email-form">
              <div className="form-row">
                <label htmlFor="emailTo">To</label>
                <input id="emailTo" type="email" value="hr@petiq.com" readOnly />
              </div>
              <div className="form-row">
                <label htmlFor="emailSubject">Subject</label>
                <input
                  id="emailSubject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Question about benefits, PTO, payroll, etc."
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="emailMessage">Message</label>
                <textarea
                  id="emailMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details so HR can help you quickly."
                  rows={6}
                  required
                />
              </div>
              <div className="actions">
                <button type="button" className="secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="primary">Send Email</button>
              </div>
            </form>
          ) : (
            <div className="sent-state">
              <div className="sent-icon">✅</div>
              <p>Your message was sent to hr@petiq.com. We will reply shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



