
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	Users,
	Pencil,
	Trash2,
	Plus,
	RotateCcw,
} from 'lucide-react'

const API_BASE_URL =
	import.meta.env.VITE_API_URL || 'http://localhost:9000'

const REGISTER =
	`${API_BASE_URL}/auth/register`

const GET_USERS =
	`${API_BASE_URL}/users/getall`

const DELETE_USER =
	`${API_BASE_URL}/users/delete`

const UPDATE_USER =
	`${API_BASE_URL}/users/update`

function UsersPage() {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(false)

	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
		role: '',
	})

	const [editingId, setEditingId] = useState(null)

	/* =======================================================
	   TOKEN
	======================================================= */

	const token = Cookies.get('auth_token')

	const authHeaders = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}

	/* =======================================================
	   FETCH USERS
	======================================================= */

	const fetchUsers = async () => {
		try {
			setLoading(true)

			const res = await axios.get(
				GET_USERS,
				authHeaders
			)

			setUsers(res.data)
		} catch (err) {
			console.error(err)
			alert('Error fetching users')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	/* =======================================================
	   FORM CHANGE
	======================================================= */

	const handleChange = (e) => {
		const { name, value } = e.target

		setForm((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	/* =======================================================
	   RESET FORM
	======================================================= */

	const resetForm = () => {
		setEditingId(null)

		setForm({
			name: '',
			email: '',
			password: '',
			role: '',
		})
	}

	/* =======================================================
	   REGISTER OR UPDATE USER
	======================================================= */

	const saveUser = async () => {
		if (
			!form.name ||
			!form.email ||
			!form.role ||
			(!editingId && !form.password)
		) {
			alert('Please fill all required fields')
			return
		}

		try {
			/* =========================
			   UPDATE USER
			========================= */

			if (editingId) {
				await axios.put(
					`${UPDATE_USER}/${editingId}`,
					{
						nom: form.name,
						email: form.email,
						role: form.role,
					},
					authHeaders
				)

				alert('User updated successfully')
			}

			/* =========================
			   REGISTER USER
			========================= */

			else {
				await axios.post(
					REGISTER,
					{
						nom: form.name,
						email: form.email,
						password: form.password,
						role: form.role,
					},
					authHeaders
				)

				alert('User registered successfully')
			}

			resetForm()
			fetchUsers()
		} catch (err) {
			console.error(err)

			alert(
				err.response?.data ||
				'Error saving user'
			)
		}
	}

	/* =======================================================
	   DELETE USER
	======================================================= */

	const deleteUser = async (id) => {
		const confirmDelete =
			window.confirm('Delete this user ?')

		if (!confirmDelete) return

		try {
			await axios.delete(
				`${DELETE_USER}/${id}`,
				authHeaders
			)

			alert('User deleted successfully')

			fetchUsers()
		} catch (err) {
			console.error(err)
			alert('Error deleting user')
		}
	}

	/* =======================================================
	   EDIT USER
	======================================================= */

	const editUser = (user) => {
		setEditingId(user.id)

		setForm({
			name: user.nom || '',
			email: user.email || '',
			password: '',
			role: user.role || '',
		})
	}

	/* =======================================================
	   UI
	======================================================= */

	return (
		<div style={pageStyle}>
			{/* HEADER */}

			<div style={headerStyle}>
				<Users size={34} color="#2563eb" />

				<div>
					<h1 style={titleStyle}>
						Gestion Utilisateurs
					</h1>

					<p style={subtitleStyle}>
						Register new users and manage roles
					</p>
				</div>
			</div>

			{/* FORM */}

			<div style={cardStyle}>
				<h2 style={sectionTitle}>
					{editingId
						? 'Update User'
						: 'Register User'}
				</h2>

				<div style={formGrid}>
					<input
						type="text"
						name="name"
						placeholder="Name"
						value={form.name}
						onChange={handleChange}
						style={inputStyle}
					/>

					<input
						type="email"
						name="email"
						placeholder="Email"
						value={form.email}
						onChange={handleChange}
						style={inputStyle}
					/>

					{!editingId && (
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={form.password}
							onChange={handleChange}
							style={inputStyle}
						/>
					)}

					<select
						name="role"
						value={form.role}
						onChange={handleChange}
						style={inputStyle}
					>
						<option value="">
							Select Role
						</option>

						<option value="ADMIN">
							ADMIN
						</option>

						<option value="CLIENT">
							CLIENT
						</option>

						<option value="QUALITE">
							QUALITE
						</option>
					</select>
				</div>

				<div style={buttonContainer}>
					<button
						onClick={saveUser}
						style={primaryButton}
					>
						<Plus size={18} />

						{editingId
							? 'Update'
							: 'Register'}
					</button>

					<button
						onClick={resetForm}
						style={secondaryButton}
					>
						<RotateCcw size={18} />
						Reset
					</button>
				</div>
			</div>

			{/* USERS TABLE */}

			<div style={tableContainer}>
				{loading ? (
					<p style={{ padding: '20px' }}>
						Loading...
					</p>
				) : (
					<table style={tableStyle}>
						<thead style={theadStyle}>
							<tr>
								<th style={thStyle}>Name</th>
								<th style={thStyle}>Email</th>
								<th style={thStyle}>Role</th>
								<th style={thStyle}>
									Actions
								</th>
							</tr>
						</thead>

						<tbody>
							{users.length === 0 ? (
								<tr>
									<td
										colSpan="4"
										style={emptyStyle}
									>
										No users found
									</td>
								</tr>
							) : (
								users.map((user) => (
									<tr
										key={user.id}
										style={rowStyle}
									>
										<td style={tdStyle}>
											{user.nom}
										</td>

										<td style={tdStyle}>
											{user.email}
										</td>

										<td style={tdStyle}>
											{user.role}
										</td>

										<td style={tdStyle}>
											<div
												style={{
													display:
														'flex',
													gap: '10px',
												}}
											>
												<button
													onClick={() =>
														editUser(
															user
														)
													}
													style={
														editButton
													}
												>
													<Pencil size={16} />
												</button>

												<button
													onClick={() =>
														deleteUser(
															user.id
														)
													}
													style={
														deleteButton
													}
												>
													<Trash2 size={16} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	)
}

/* =======================================================
   STYLES
======================================================= */

const pageStyle = {
	minHeight: '100vh',
	background: '#f4f7fb',
	padding: '30px',
}

const headerStyle = {
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	marginBottom: '30px',
}

const titleStyle = {
	margin: 0,
	color: '#1e293b',
}

const subtitleStyle = {
	margin: 0,
	color: '#64748b',
}

const cardStyle = {
	background: 'white',
	padding: '25px',
	borderRadius: '16px',
	boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
	marginBottom: '30px',
}

const sectionTitle = {
	marginBottom: '20px',
	color: '#1e293b',
}

const formGrid = {
	display: 'grid',
	gridTemplateColumns:
		'repeat(auto-fit, minmax(220px, 1fr))',
	gap: '15px',
}

const inputStyle = {
	padding: '12px',
	borderRadius: '10px',
	border: '1px solid #cbd5e1',
	outline: 'none',
	fontSize: '14px',
}

const buttonContainer = {
	marginTop: '20px',
	display: 'flex',
	gap: '12px',
}

const primaryButton = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	background: '#2563eb',
	color: 'white',
	border: 'none',
	padding: '12px 18px',
	borderRadius: '10px',
	cursor: 'pointer',
	fontWeight: '600',
}

const secondaryButton = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	background: '#e2e8f0',
	color: '#1e293b',
	border: 'none',
	padding: '12px 18px',
	borderRadius: '10px',
	cursor: 'pointer',
	fontWeight: '600',
}

const tableContainer = {
	background: 'white',
	borderRadius: '16px',
	overflow: 'hidden',
	boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

const tableStyle = {
	width: '100%',
	borderCollapse: 'collapse',
}

const theadStyle = {
	background: '#2563eb',
	color: 'white',
}

const thStyle = {
	padding: '16px',
	textAlign: 'left',
}

const tdStyle = {
	padding: '16px',
}

const rowStyle = {
	borderBottom: '1px solid #e2e8f0',
}

const emptyStyle = {
	padding: '20px',
	textAlign: 'center',
}

const editButton = {
	background: '#facc15',
	border: 'none',
	padding: '8px',
	borderRadius: '8px',
	cursor: 'pointer',
	color: 'white',
}

const deleteButton = {
	background: '#ef4444',
	border: 'none',
	padding: '8px',
	borderRadius: '8px',
	cursor: 'pointer',
	color: 'white',
}

export default UsersPage
