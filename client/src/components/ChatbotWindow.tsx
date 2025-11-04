import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './ChatbotWindow.css'
import { EmailPreviewModal } from './EmailPreviewModal'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  feedback?: 'up' | 'down' | null
}

interface ChatbotWindowProps {
  isVerified: boolean
  userEmail: string | null
  openId: string
  onClose: () => void
}

export const ChatbotWindow = ({
  isVerified,
  userEmail,
  openId,
  onClose,
}: ChatbotWindowProps) => {
  const { t } = useTranslation()
  const isInternal = ((userEmail || '').toLowerCase().split('@')[1] || '').endsWith('petiq.com')
  const getWelcomeMessage = () => {
    const followups = (t('chat.welcomeFollowups', { returnObjects: true }) as string[]) || []
    const intro = t('chat.welcomeIntro')
    const pick = followups[Math.floor(Math.random() * (followups.length || 1))] || ''
    return `${intro} ${pick}`.trim()
  }
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string | null>(null)
  const categoriesSeenRef = useRef<Set<string>>(new Set())
  const lastCategoryRef = useRef<string>('general')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{
    subject: string
    body: string
    attachments: { name: string; url: string }[]
  } | null>(null)
  const [shareWithHR, setShareWithHR] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // HR draft flow state
  const lastBotStatusRef = useRef<'answered' | 'escalated' | 'requires_action'>('answered')
  const lastUserQuestionRef = useRef<string>('')
  const lastBotAnswerRef = useRef<string>('')
  const [hrPromptVisible, setHrPromptVisible] = useState(false)
  const [previewTo, setPreviewTo] = useState<string>(userEmail || '')

  const WELCOME_KEY = `petiq_chat_welcome_${openId}`

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // When the user is verified, send a welcome message once per session (avoid React StrictMode double-mount)
  useEffect(() => {
    if (!isVerified) return
    if (sessionStorage.getItem(WELCOME_KEY) === '1') return
    const botMessage: Message = {
      id: (Date.now()).toString(),
      text: getWelcomeMessage(),
      sender: 'bot',
      timestamp: new Date(),
      feedback: null,
    }
    setMessages((prev) => [...prev, botMessage])
    sessionStorage.setItem(WELCOME_KEY, '1')
  }, [isVerified, openId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const shouldOfferHrDraft = (question: string, answer: string): boolean => {
    const q = (question || '').toLowerCase()
    const a = (answer || '').toLowerCase()

    const personalLookupCues = [
      'my last',
      'when was my',
      'what is my',
      "what's my",
      'how many sick',
      'how many vacation',
      'my sick',
      'my vacation',
      'my pto',
      'my balance',
      'my paycheck',
      'my paystub',
      'my manager',
      'my schedule',
      'my address',
      'my benefits enrollment',
    ]

    const hrEscalationCues = [
      'contact hr',
      'reach out to hr',
      'email hr',
      'speak with hr',
      'get in touch with hr',
    ]

    const limitationCues = [
      'cannot access personal',
      "can't access personal",
      'do not have access to personal',
      "don't have access to personal",
      "can't look up",
      'cannot look up',
      "i can't check",
      'i cannot check',
      'no access to your',
      'not able to see your',
      'for security reasons',
      'privacy reasons',
    ]

    const qPersonal = personalLookupCues.some(c => q.includes(c))
    const aSuggestsHr = hrEscalationCues.some(c => a.includes(c))
    const aShowsLimitation = limitationCues.some(c => a.includes(c))

    return aSuggestsHr || aShowsLimitation || qPersonal
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !isVerified) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        message: inputText,
        email: userEmail,
        conversationId: conversationIdRef.current,
        language: i18n.language === 'es' ? 'es' : 'en',
      })

      if (!conversationIdRef.current) {
        conversationIdRef.current = response.data.conversationId
      }
      if (response.data?.category) {
        lastCategoryRef.current = response.data.category || 'general'
        categoriesSeenRef.current.add(lastCategoryRef.current)
      }
      
      // Track context for HR draft flow
      lastUserQuestionRef.current = userMessage.text
      lastBotAnswerRef.current = response.data.response || ''
      lastBotStatusRef.current = (response.data.status as ('answered' | 'escalated' | 'requires_action')) || 'answered'
      if (lastBotStatusRef.current !== 'answered' || shouldOfferHrDraft(userMessage.text, lastBotAnswerRef.current)) {
        setHrPromptVisible(true)
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        feedback: null,
      }

      setMessages((prev) => {
        const updated = [...prev]
        const lastUserMsg = updated[updated.length - 1]
        if (lastUserMsg.sender === 'user') {
          lastUserMsg.status = 'sent'
        }
        return [...updated, botMessage]
      })
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('chat.error'),
        sender: 'bot',
        timestamp: new Date(),
        feedback: null,
      }
      setMessages((prev) => {
        const updated = [...prev]
        const lastUserMsg = updated[updated.length - 1]
        if (lastUserMsg.sender === 'user') {
          lastUserMsg.status = 'error'
        }
        return [...updated, errorMessage]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage()
    }
  }

  const setMessageFeedback = (id: string, value: 'up' | 'down') => {
    setMessages(prev =>
      prev.map(m =>
        m.id === id ? { ...m, feedback: m.feedback === value ? null : value } : m
      )
    )
  }

  const buildTranscript = () => {
    return messages.map(m => {
      const who = m.sender === 'user' ? 'You' : 'Scout'
      const when = m.timestamp.toLocaleString()
      return `[${when}] ${who}: ${m.text}`
    }).join('\n')
  }

  const extractDocLinksFromMessages = () => {
    const links = new Map<string, string>()
    const regex = /(?:https?:\/\/[^\s)]+)?\/docs\/([^\s)]+?)(?=[\s\).,]|$)/gi
    for (const m of messages) {
      if (m.sender !== 'bot') continue
      let match: RegExpExecArray | null
      while ((match = regex.exec(m.text))) {
        const name = decodeURIComponent(match[1])
        links.set(name, `/docs/${encodeURIComponent(name)}`)
      }
    }
    return Array.from(links, ([name, url]) => ({ name, url }))
  }

  const openEmailPreview = async () => {
    if (!userEmail) return
    const subject = 'Your chat transcript'
    const body = buildTranscript()
    const isInternalUser = isInternal ? 'internal' : 'external'

    let attachments = extractDocLinksFromMessages()

    try {
      const categories = Array.from(new Set<string>([
        'general',
        lastCategoryRef.current || 'general',
        ...Array.from(categoriesSeenRef.current.values()),
      ]))

      const results = await Promise.all(categories.map(category =>
        axios.get('/api/docs/suggest', { params: { category, userType: isInternalUser } })
          .then(r => r.data?.attachments as { name: string; url: string }[] || [])
          .catch(() => [])
      ))

      const suggested: { name: string; url: string }[] = results.flat()
      const byName = new Map(attachments.map(a => [a.name, a]))
      for (const s of suggested) {
        if (!byName.has(s.name)) byName.set(s.name, s)
      }
      attachments = Array.from(byName.values())
    } catch {
      // ignore suggestion errors; preview will still render
    }

    setPreviewTo(userEmail || '')
    setPreviewData({ subject, body, attachments })
    setIsPreviewOpen(true)
  }

  // Visual-only: draft an email to HR when the bot cannot fully answer
  const openHrDraftPreview = () => {
    const cat = lastCategoryRef.current || 'general'
    const subject = `Assistance request: ${cat}`

    const userLine = `From: ${userEmail || 'Guest user'}`
    const questionLine = `Question: ${lastUserQuestionRef.current}`
    const assistantSummary = (lastBotAnswerRef.current || '').trim()
    const assistantLine = assistantSummary
      ? `Assistant summary: ${assistantSummary}`
      : 'Assistant summary: (not available)'

    const body = [
      'Hello HR Team,',
      '',
      "I'm reaching out because I need help with the following:",
      questionLine,
      '',
      'Scout (our HR assistant) provided guidance, but it did not fully address my specific situation.',
      assistantLine,
      '',
      'For your convenience, I\'ve attached the chat transcript to provide additional context.',
      '',
      'Thank you!',
      userLine,
    ].join('\n')

    // Visual-only attachment: generate a Blob URL for the transcript
    const transcript = buildTranscript()
    const transcriptBlob = new Blob([transcript], { type: 'text/plain' })
    const transcriptUrl = URL.createObjectURL(transcriptBlob)
    const attachments = [
      { name: 'chat-transcript.txt', url: transcriptUrl },
    ]

    setPreviewTo('hr@petiq.com')
    setPreviewData({ subject, body, attachments })
    setIsPreviewOpen(true)
    setHrPromptVisible(false)
  }

  return (
    <div className={`chatbot-window ${isExpanded ? 'expanded' : ''}`}>
        <div className="chatbot-header">
        <div>
          <h3>{t('chat.headerTitle')}</h3>
          <div className="user-ident">
            <p className="user-email">{userEmail}</p>
          </div>
          {!isInternal && (
            <p className="capability-note">
              {t('chat.guestNote')}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? t('chat.shrink') : t('chat.expand')}
            aria-label={isExpanded ? t('chat.shrink') : t('chat.expand')}
          >
            {isExpanded ? '⤡' : '⤢'}
          </button>
          <button
            className="email-button"
            onClick={openEmailPreview}
            disabled={!messages.length}
            title={t('chat.emailTranscript')}
            aria-label={t('chat.emailTranscript')}
          >
            📧
          </button>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="chatbot-body">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {message.sender === 'bot' && (
                <div className="feedback-bar" role="group" aria-label="Rate this answer">
                  <button
                    className={`thumb up ${message.feedback === 'up' ? 'selected' : ''}`}
                    onClick={() => setMessageFeedback(message.id, 'up')}
                  title={t('chat.helpful')}
                    aria-pressed={message.feedback === 'up'}
                  >
                    👍
                  </button>
                  <button
                    className={`thumb down ${message.feedback === 'down' ? 'selected' : ''}`}
                    onClick={() => setMessageFeedback(message.id, 'down')}
                  title={t('chat.notHelpful')}
                    aria-pressed={message.feedback === 'down'}
                  >
                    👎
                  </button>
                  {message.feedback && (
                  <span className="feedback-thanks">{t('chat.thanksFeedback')}</span>
                  )}
                </div>
              )}

              {message.status === 'sending' && (
              <div className="message-status">{t('chat.typing')}</div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          {hrPromptVisible && (
            <div className="message bot-message">
              <div className="message-content hr-escalation-card">
                <p>{t('chat.hrPrompt')}</p>
                <div className="hr-actions">
                  <button className="send-button" onClick={openHrDraftPreview}>{t('chat.hrDraft')}</button>
                  <button className="secondary-button" onClick={() => setHrPromptVisible(false)}>{t('chat.noThanks')}</button>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-input">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="send-button"
          >
            {t('chat.send')}
          </button>
        </div>
      </div>
      {isPreviewOpen && previewData && previewTo && (
        <EmailPreviewModal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          to={previewTo}
          subject={previewData.subject}
          body={previewData.body}
          attachments={previewData.attachments}
          shareWithHR={shareWithHR}
          onShareWithHRChange={setShareWithHR}
        />
      )}
    </div>
  )
}

