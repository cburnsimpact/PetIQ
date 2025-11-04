import { useState } from 'react'
import axios from 'axios'
import './VerificationFlow.css'
import { useTranslation } from 'react-i18next'

interface VerificationFlowProps {
  onVerificationComplete: (email: string) => void
}

export const VerificationFlow = ({ onVerificationComplete }: VerificationFlowProps) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError(t('verify.errEnterEmail'))
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('verify.errValidEmail'))
      return
    }

    setIsLoading(true)
    try {
      await axios.post('/api/verification/initiate', { email })
      setStep(2)
    } catch (error: any) {
      setError(error.response?.data?.error || t('verify.errSendCode'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!verificationCode.trim()) {
      setError(t('verify.errEnterCode'))
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post('/api/verification/verify', {
        email,
        code: verificationCode,
      })

      if (response.data.verified) {
        onVerificationComplete(email)
      } else {
        setError(t('verify.errInvalid'))
      }
    } catch (error: any) {
      setError(error.response?.data?.error || t('verify.errVerify'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="verification-flow">
      <div className="verification-header">
        <h3>{t('verify.title')}</h3>
        <p>{t('verify.subtitle')}</p>
      </div>

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="email">{t('verify.enterEmail')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('verify.emailPh')}
              disabled={isLoading}
              autoFocus
            />
            <p className="form-hint">
              {t('verify.emailHint')}
            </p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? t('verify.sending') : t('verify.sendCode')}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleCodeVerify} className="verification-form">
          <div className="form-group">
            <label htmlFor="code">{t('verify.enterCode')}</label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('verify.codePh')}
              disabled={isLoading}
              autoFocus
              maxLength={6}
            />
            <p className="form-hint">
              {t('verify.sentHint', { email })}
            </p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="button-group">
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setVerificationCode('')
                setError('')
              }}
              disabled={isLoading}
              className="secondary-button"
            >
              {t('verify.back')}
            </button>
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? t('verify.verifying') : t('verify.verifyCode')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

