import { useState } from 'react'
import axios from 'axios'
import './VerificationFlow.css'

interface VerificationFlowProps {
  onVerificationComplete: (email: string) => void
}

export const VerificationFlow = ({ onVerificationComplete }: VerificationFlowProps) => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      await axios.post('/api/verification/initiate', { email })
      setStep(2)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code')
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
        setError('Invalid verification code. Please try again.')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="verification-flow">
      <div className="verification-header">
        <h3>Identity Verification</h3>
        <p>We need to verify your identity to ensure secure access to HR information.</p>
      </div>

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="email">Enter your email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={isLoading}
              autoFocus
            />
            <p className="form-hint">
              This can be your personal email if you don't have a PetIQ email address.
            </p>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleCodeVerify} className="verification-form">
          <div className="form-group">
            <label htmlFor="code">Enter verification code</label>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              disabled={isLoading}
              autoFocus
              maxLength={6}
            />
            <p className="form-hint">
              We sent a 6-digit code to {email}. Please check your inbox.
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
              Back
            </button>
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

