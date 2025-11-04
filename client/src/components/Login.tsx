import { useState } from 'react'
import axios from 'axios'
import './Login.css'

interface LoginProps {
	onSuccess: (workEmail: string, firstName?: string) => void
}

export const Login = ({ onSuccess }: LoginProps) => {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>('')
	const [showList, setShowList] = useState(false)
	const [employees, setEmployees] = useState<Array<{ first_name: string; last_name: string; personal_email: string; work_email: string }>>([])
	const [listLoading, setListLoading] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		if (!email.trim()) {
			setError('Please enter your personal email')
			return
		}
		setLoading(true)
		try {
			const res = await axios.post('/api/auth/login', { email })
			onSuccess(res.data.workEmail, res.data.firstName)
		} catch (err: any) {
			setError(err?.response?.data?.error || 'Login failed')
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
				<h2>Sign in to PetIQ HR Center</h2>
				<form onSubmit={submit} className="login-form">
				<label htmlFor="email">Personal or PetIQ email</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder="you@example.com or you@petiq.com"
					disabled={loading}
					autoFocus
				/>
				{error && <div className="login-error">{error}</div>}
				<button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
				</form>

				<button type="button" className="login-secondary" onClick={toggleEmployeeList}>
					{showList ? 'Hide employee list' : 'Show employee list'}
				</button>
			</div>

			{showList && (
				<div className="employee-list-wide">
					<div className="employee-list">
						<h3>Employee directory</h3>
						{listLoading ? (
							<p>Loading…</p>
						) : (
							<table>
								<thead>
									<tr>
										<th>First</th>
										<th>Last</th>
										<th>Personal email</th>
										<th>PetIQ email</th>
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
		</div>
	)
}


