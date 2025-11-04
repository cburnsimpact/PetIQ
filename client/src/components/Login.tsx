import { useState } from 'react'
import axios from 'axios'
import './Login.css'
import { useTranslation } from 'react-i18next'

interface LoginProps {
	onSuccess: (workEmail: string, firstName?: string) => void
}

export const Login = ({ onSuccess }: LoginProps) => {
	const { t, i18n } = useTranslation()
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>('')
	const [showList, setShowList] = useState(false)
	const [employees, setEmployees] = useState<Array<{ first_name: string; last_name: string; personal_email: string; work_email: string }>>([])
	const [listLoading, setListLoading] = useState(false)

	const changeLanguage = (lng: 'en' | 'es') => {
		i18n.changeLanguage(lng)
		try { localStorage.setItem('petiq_lang', lng) } catch {}
	}

	const emailHR = () => {
		const subject = 'Help with sign-in: email not recognized'
		const body = `Hello HR Team,\n\nI'm trying to sign in to the PetIQ HR Center, but my email isn't recognized.\n\nEmail I tried: ${email}\n\nCould you please confirm my PetIQ email address or the personal email address associated with my account?\n\nThank you.`
		window.location.href = `mailto:hr@petiq.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
	}

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		if (!email.trim()) {
			setError(t('login.pleaseEnterEmail'))
			return
		}
		setLoading(true)
		try {
			const res = await axios.post('/api/auth/login', { email })
			onSuccess(res.data.workEmail, res.data.firstName)
		} catch (err: any) {
			setError(err?.response?.data?.error || t('login.loginFailed'))
		} finally {
			setLoading(false)
		}
	}

	const toggleEmployeeList = async () => {
		if (!showList && employees.length === 0) {
			setListLoading(true)
			try {
				const res = await axios.get('/api/auth/employees')
				setEmployees(res.data?.employees || [])
			} catch (err) {
				// ignore demo list fetch errors
			} finally {
				setListLoading(false)
			}
		}
		setShowList(!showList)
	}

	return (
		<div className="login-page">
			<div className="login-container">
				<h2>{t('login.title')}</h2>
				<form onSubmit={submit} className="login-form">
				<label htmlFor="email">{t('login.label')}</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder={t('login.placeholder')}
					disabled={loading}
					autoFocus
				/>
				{error && <div className="login-error">{error}</div>}
				{error?.toLowerCase().includes('email not recognized') && (
					<button type="button" className="login-secondary" onClick={emailHR}>
						{t('login.emailHr')}
					</button>
				)}
				<button type="submit" disabled={loading}>{loading ? t('login.signingIn') : t('login.signIn')}</button>
				</form>

				<button type="button" className="login-secondary" onClick={toggleEmployeeList}>
					{showList ? t('login.hideList') : t('login.showList')}
				</button>
				<button
					type="button"
					className="hr-analytics-btn"
					onClick={() => { window.location.hash = '#/hr-analytics' }}
				>
					{t('login.hrAnalytics')}
				</button>
			</div>

			{showList && (
				<div className="employee-list-wide">
					<div className="employee-list">
					<h3>{t('login.directory')}</h3>
						{listLoading ? (
						<p>{t('login.loading')}</p>
						) : (
							<table>
								<thead>
									<tr>
									<th>{t('login.first')}</th>
									<th>{t('login.last')}</th>
									<th>{t('login.personalEmail')}</th>
									<th>{t('login.workEmail')}</th>
									</tr>
								</thead>
								<tbody>
									{employees.map((e, i) => (
										<tr key={i}>
											<td>{e.first_name}</td>
											<td>{e.last_name}</td>
											<td>{e.personal_email}</td>
											<td>{e.work_email}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			)}

		{/* Language toggle at the bottom */}
		<div style={{ marginTop: 16, textAlign: 'center' }}>
			<button className="login-secondary" type="button" onClick={() => changeLanguage('en')}>
				{t('language.english')}
			</button>
			<span style={{ padding: '0 8px' }}>|</span>
			<button className="login-secondary" type="button" onClick={() => changeLanguage('es')}>
				{t('language.spanish')}
			</button>
		</div>
		</div>
	)
}


