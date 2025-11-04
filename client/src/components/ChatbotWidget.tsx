import { useState } from 'react'
import { ChatbotWindow } from './ChatbotWindow'
import './ChatbotWidget.css'

interface ChatbotWidgetProps {
	isVerified: boolean
	userEmail: string
}

const ChatbotWidget = ({ isVerified, userEmail }: ChatbotWidgetProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [openId, setOpenId] = useState<string | null>(null)

	const toggleChatbot = () => {
		if (!isOpen) {
			setOpenId(Date.now().toString())
		}
		setIsOpen(!isOpen)
	}

	return (
		<>
			<button
				className="chatbot-toggle"
				onClick={toggleChatbot}
				aria-label="Toggle chatbot"
			>
				{isOpen ? '✕' : '💬'}
			</button>
			{isOpen && openId && (
				<ChatbotWindow
					isVerified={isVerified}
					userEmail={userEmail}
					openId={openId}
					onClose={() => setIsOpen(false)}
				/>
			)}
		</>
	)
}

export default ChatbotWidget

