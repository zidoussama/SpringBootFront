import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	FileText,
	Pencil,
	Trash2,
	Plus,
	RotateCcw,
	Filter,
	Users,
	X,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL 

const GET_RETOURS = `${API_BASE_URL}/retours/getall`
const GET_RETOURS_BY_STATE = `${API_BASE_URL}/retours/getbyetat`
const ADD_RETOUR = `${API_BASE_URL}/retours/add`
const UPDATE_RETOUR = `${API_BASE_URL}/retours/update`
const DELETE_RETOUR = `${API_BASE_URL}/retours/delete`
const GET_PRODUCTS = `${API_BASE_URL}/produits/getall`
const GET_USERS = `${API_BASE_URL}/users/getall`

const RETURN_STATES = ['EN_COURS', 'TRAITE', 'REJCTED']

const getTodayDate = () => new Date().toISOString().slice(0, 10)

const normalizeRetour = (payload) => {
	const list = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.data)
			? payload.data
			: []

	return list
		.map((item) => ({
			id: item.id,
			produitId: item.produitId ?? item.produit?.id ?? '',
			utilisateurId: item.utilisateurId ?? item.client?.id ?? item.utilisateurId ?? '',
			produit: item.NomProduit ?? item.produit?.nom ?? item.produit?.name ?? 'Produit non défini',
			client: item.NomClient ?? item.client?.nom ?? item.client?.name ?? item.utilisateur?.nom ?? 'Client non défini',
			quantite: item.quantite ?? 1,
			raison: item.raison ?? '',
			date: item.date ?? item.date ?? item.createdAt ?? '',
			etatTraitement: item.etatTraitement ?? 'EN_COURS',
		}))
		.sort((left, right) => String(right.date).localeCompare(String(left.date)))
}

const getStatusStyle = (etat) => {
	switch (etat) {
		case 'TRAITE':
			return 'bg-emerald-100 text-emerald-700'
		case 'REJCTED':
		case 'REJECT':
			return 'bg-rose-100 text-rose-700'
		case 'EN_COURS':
			return 'bg-amber-100 text-amber-700'
		default:
			return 'bg-slate-100 text-slate-700'
	}
}

const emptyForm = {
	produitId: '',
	utilisateurId: '',
	quantite: '',
	raison: '',
	date: getTodayDate(),
	etatTraitement: 'EN_COURS',
}

export default function RetoursPage() {
	const [allRetours, setAllRetours] = useState([])
	const [retours, setRetours] = useState([])
	const [products, setProducts] = useState([])
	const [clients, setClients] = useState([])
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [editingId, setEditingId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedState, setSelectedState] = useState('EN_COURS')
	const [search, setSearch] = useState('')
	const [form, setForm] = useState(emptyForm)

	const authHeaders = {
		headers: {
			Authorization: `Bearer ${Cookies.get('auth_token')}`,
			'Content-Type': 'application/json',
		},
	}

	const loadRetours = async (state = selectedState) => {
		try {
			setLoading(true)
			setError('')

			const response =
				state === 'ALL'
					? await axios.get(GET_RETOURS, authHeaders)
					: await axios.get(`${GET_RETOURS_BY_STATE}/${state}`, authHeaders)

			const normalized = normalizeRetour(response.data)

			if (state === 'ALL') {
				setAllRetours(normalized)
				setRetours(normalized)
			} else {
				setRetours(normalized)
			}
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des retours')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadRetours('EN_COURS')
	}, [])

	useEffect(() => {
		const loadOptions = async () => {
			try {
				const [productsResponse, usersResponse] = await Promise.all([
					axios.get(GET_PRODUCTS, authHeaders),
					axios.get(GET_USERS, authHeaders),
				])

				const productList = Array.isArray(productsResponse.data)
					? productsResponse.data
					: productsResponse.data?.data ?? []

				const usersList = Array.isArray(usersResponse.data)
					? usersResponse.data
					: usersResponse.data?.data ?? []

				setProducts(productList)
				setClients(usersList)
			} catch (err) {
				console.error(err)
			}
		}

		loadOptions()
	}, [])

	useEffect(() => {
		if (selectedState === 'ALL') {
			setRetours(allRetours)
			return
		}

		loadRetours(selectedState)
	}, [selectedState])

	const filteredRetours = useMemo(() => {
		const query = search.trim().toLowerCase()

		if (!query) {
			return retours
		}

		return retours.filter((retour) => {
			return [
				retour.produit,
				retour.client,
				retour.raison,
				retour.etatTraitement,
				String(retour.id),
			]
				.join(' ')
				.toLowerCase()
				.includes(query)
		})
	}, [retours, search])

	const stats = useMemo(() => {
		return allRetours.reduce(
			(accumulator, retour) => {
				accumulator.total += 1

				if (retour.etatTraitement === 'EN_COURS') accumulator.waiting += 1
				if (retour.etatTraitement === 'TRAITE') accumulator.done += 1
				if (retour.etatTraitement === 'REJCTED' || retour.etatTraitement === 'REJECT') {
					accumulator.rejected += 1
				}

				return accumulator
			},
			{ total: 0, waiting: 0, done: 0, rejected: 0 }
		)
	}, [allRetours])

	const handleChange = (event) => {
		const { name, value } = event.target

		setForm((previous) => ({
			...previous,
			[name]: value,
		}))
	}

	const resetForm = () => {
		setEditingId(null)
		setForm({
			...emptyForm,
			date: getTodayDate(),
		})
	}

	const openCreateModal = () => {
		resetForm()
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		resetForm()
	}

	const editRetour = (retour) => {
		setEditingId(retour.id)
		setForm({
			produitId: retour.produitId,
			utilisateurId: retour.utilisateurId,
			quantite: retour.quantite,
			raison: retour.raison,
			date: retour.date?.slice?.(0, 10) || retour.date || '',
			etatTraitement: retour.etatTraitement || 'EN_COURS',
		})
		setIsModalOpen(true)
	}

	const saveRetour = async () => {
		if (!form.produitId || !form.utilisateurId || !form.quantite || !form.raison || !form.date) {
			alert('Please fill all required fields')
			return
		}

		const payload = {
			produitId: Number(form.produitId),
			utilisateurId: Number(form.utilisateurId),
			quantite: Number(form.quantite),
			raison: form.raison,
			date: form.date,
			etatTraitement: form.etatTraitement,
		}

		try {
			setSaving(true)

			if (editingId) {
				await axios.put(`${UPDATE_RETOUR}/${editingId}`, payload, authHeaders)
				alert('Retour updated successfully')
			} else {
				await axios.post(ADD_RETOUR, payload, authHeaders)
				alert('Retour created successfully')
			}

			closeModal()
			await loadRetours('ALL')

			if (selectedState !== 'ALL') {
				await loadRetours(selectedState)
			}
		} catch (err) {
			console.error(err)
			alert(err.response?.data?.message || 'Error saving retour')
		} finally {
			setSaving(false)
		}
	}

	const deleteRetour = async (id) => {
		const confirmDelete = window.confirm('Delete this retour ?')

		if (!confirmDelete) return

		try {
			await axios.delete(`${DELETE_RETOUR}/${id}`, authHeaders)
			alert('Retour deleted successfully')
			await loadRetours('ALL')

			if (selectedState !== 'ALL') {
				await loadRetours(selectedState)
			}
		} catch (err) {
			console.error(err)
			alert(err.response?.data?.message || 'Error deleting retour')
		}
	}

	return (
		<div style={pageStyle}>
			<div style={headerStyle}>
				<FileText size={34} color="#2563eb" />

				<div>
					<h1 style={titleStyle}>Gestion des retours</h1>
					<p style={subtitleStyle}>Créer, modifier et suivre les retours produits</p>
				</div>
			</div>

			<div style={statsGridStyle}>
				<StatCard title="Total" value={stats.total} hint="Retours enregistrés" accent="#1d4ed8" />
				<StatCard title="En attente" value={stats.waiting} hint="Demandes à traiter" accent="#f59e0b" />
				<StatCard title="Traités" value={stats.done} hint="Retours finalisés" accent="#059669" />
				<StatCard title="Rejetés" value={stats.rejected} hint="Retours refusés" accent="#ea580c" />
			</div>

			<div style={cardStyle}>
				<div style={sectionHeaderStyle}>
					<div>
						<h2 style={sectionTitle}>Gestion des retours</h2>
						<p style={sectionSubtitle}>Ajouter un retour depuis le bouton, modifier depuis la liste</p>
					</div>

					<button onClick={openCreateModal} style={primaryButton}>
						<Plus size={18} /> Add Return
					</button>
				</div>
			</div>

			<div style={cardStyle}>
				<div style={toolbarStyle}>
					<div>
						<h2 style={sectionTitle}>Retours en cours</h2>
						<p style={sectionSubtitle}>Retours en cours de traitement</p>
					</div>

					<div style={toolbarActions}>
						<input
							type="text"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Recherche par produit, client ou raison"
							style={searchStyle}
						/>
					</div>
				</div>

				{error ? (
					<p style={errorStyle}>{error}</p>
				) : null}

				<div style={tableWrap}>
					{loading ? (
						<p style={loadingStyle}>Loading...</p>
					) : (
						<table style={tableStyle}>
							<thead style={theadStyle}>
								<tr>
									<th style={thStyle}>Produit</th>
									<th style={thStyle}>Client</th>
									<th style={thStyle}>Quantité</th>
									<th style={thStyle}>Raison</th>
									<th style={thStyle}>Date</th>
									<th style={thStyle}>Etat</th>
									<th style={thStyle}>Actions</th>
								</tr>
							</thead>

							<tbody>
								{filteredRetours.length === 0 ? (
									<tr>
										<td colSpan="7" style={emptyStateStyle}>No retours found</td>
									</tr>
								) : (
									filteredRetours.map((retour) => (
										<tr key={retour.id} style={rowStyle}>
											<td style={tdStyle}>{retour.produit}</td>
											<td style={tdStyle}><span style={chipStyle}><Users size={14} /> {retour.client}</span></td>
											<td style={tdStyle}>{retour.quantite}</td>
											<td style={tdStyle}>{retour.raison}</td>
											<td style={tdStyle}>{retour.date?.slice?.(0, 10) || retour.date}</td>
											<td style={tdStyle}>
												<span style={{ ...statusChipStyle, ...statusColorStyles[getStatusStyle(retour.etatTraitement)] }}>
													{retour.etatTraitement}
												</span>
											</td>
											<td style={tdStyle}>
												<div style={actionGroupStyle}>
													<button onClick={() => editRetour(retour)} style={editButton}>
														<Pencil size={16} />
													</button>
													<button onClick={() => deleteRetour(retour.id)} style={deleteButton}>
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

			{isModalOpen && (
				<div style={modalOverlayStyle}>
					<div style={modalCardStyle}>
						<div style={modalHeaderStyle}>
							<h3 style={modalTitleStyle}>{editingId ? 'Update Return' : 'Add Return'}</h3>

							<button onClick={closeModal} style={modalCloseButtonStyle}>
								<X size={18} />
							</button>
						</div>

						<div style={formGrid}>
							<select name="produitId" value={form.produitId} onChange={handleChange} style={inputStyle}>
								<option value="">Choisir un produit</option>
								{products.map((product) => (
									<option key={product.id} value={product.id}>
										{product.nom || product.name || 'Produit'}
									</option>
								))}
							</select>

							<select name="utilisateurId" value={form.utilisateurId} onChange={handleChange} style={inputStyle}>
								<option value="">Choisir un client</option>
								{clients.map((client) => (
									<option key={client.id} value={client.id}>
										{client.nom || client.name || client.email || 'Client'}
									</option>
								))}
							</select>

							<input type="number" name="quantite" placeholder="Quantité" value={form.quantite} onChange={handleChange} style={inputStyle} />

							<input type="date" name="date" value={form.date} onChange={handleChange} style={inputStyle} />

							<select name="etatTraitement" value={form.etatTraitement} onChange={handleChange} style={inputStyle}>
								{RETURN_STATES.map((state) => (
									<option key={state} value={state}>{state}</option>
								))}
							</select>

							<input type="text" name="raison" placeholder="Raison du retour" value={form.raison} onChange={handleChange} style={inputStyle} />
						</div>

						<div style={buttonContainer}>
							<button onClick={saveRetour} disabled={saving} style={primaryButton}>
								<Plus size={18} />
								{editingId ? 'Update' : 'Add Return'}
							</button>

							<button onClick={resetForm} style={secondaryButton}>
								<RotateCcw size={18} /> Reset
							</button>

							<button onClick={closeModal} style={secondaryButton}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function StatCard({ title, value, hint, accent }) {
	return (
		<div style={{ ...statCardStyle, background: accent }}>
			<p style={statTitleStyle}>{title}</p>
			<h2 style={statValueStyle}>{value}</h2>
			<p style={statHintStyle}>{hint}</p>
		</div>
	)
}

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

const statsGridStyle = {
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
	gap: '16px',
	marginBottom: '24px',
}

const statCardStyle = {
	borderRadius: '18px',
	padding: '20px',
	color: 'white',
	boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
}

const statTitleStyle = { margin: 0, opacity: 0.85, fontSize: '14px' }
const statValueStyle = { margin: '8px 0 4px', fontSize: '34px', fontWeight: 800 }
const statHintStyle = { margin: 0, opacity: 0.9, fontSize: '13px' }

const cardStyle = {
	background: 'white',
	padding: '25px',
	borderRadius: '16px',
	boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
	marginBottom: '24px',
}

const sectionHeaderStyle = {
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: '16px',
	marginBottom: '18px',
	flexWrap: 'wrap',
}

const sectionTitle = {
	margin: 0,
	color: '#1e293b',
	fontSize: '22px',
}

const sectionSubtitle = {
	margin: '6px 0 0',
	color: '#64748b',
}

const formGrid = {
	display: 'grid',
	gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
	display: 'inline-flex',
	alignItems: 'center',
	gap: '8px',
	border: 'none',
	background: '#2563eb',
	color: 'white',
	padding: '12px 16px',
	borderRadius: '10px',
	cursor: 'pointer',
	fontWeight: 600,
}

const secondaryButton = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: '8px',
	border: 'none',
	background: '#e2e8f0',
	color: '#1e293b',
	padding: '12px 16px',
	borderRadius: '10px',
	cursor: 'pointer',
	fontWeight: 600,
}

const toolbarStyle = {
	display: 'flex',
	justifyContent: 'space-between',
	gap: '16px',
	alignItems: 'flex-end',
	marginBottom: '18px',
	flexWrap: 'wrap',
}

const toolbarActions = {
	display: 'flex',
	gap: '12px',
	flexWrap: 'wrap',
	alignItems: 'center',
}

const selectWrap = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	padding: '0 12px',
	borderRadius: '12px',
	border: '1px solid #cbd5e1',
	background: '#f8fafc',
}

const selectStyle = {
	border: 'none',
	outline: 'none',
	background: 'transparent',
	padding: '12px 4px',
	minWidth: '160px',
}

const searchStyle = {
	padding: '12px 14px',
	borderRadius: '12px',
	border: '1px solid #cbd5e1',
	outline: 'none',
	minWidth: '280px',
	fontSize: '14px',
}

const errorStyle = {
	marginBottom: '16px',
	background: '#fff1f2',
	color: '#be123c',
	padding: '12px 14px',
	borderRadius: '12px',
}

const tableWrap = {
	overflowX: 'auto',
	borderRadius: '16px',
	border: '1px solid #e2e8f0',
}

const loadingStyle = { padding: '20px', color: '#64748b' }

const tableStyle = {
	width: '100%',
	borderCollapse: 'collapse',
}

const theadStyle = {
	background: '#2563eb',
	color: 'white',
}

const thStyle = {
	padding: '14px 12px',
	textAlign: 'left',
	fontSize: '14px',
	whiteSpace: 'nowrap',
}

const rowStyle = {
	borderBottom: '1px solid #e2e8f0',
}

const tdStyle = {
	padding: '14px 12px',
	color: '#334155',
	verticalAlign: 'middle',
}

const emptyStateStyle = {
	padding: '24px',
	textAlign: 'center',
	color: '#64748b',
}

const actionGroupStyle = {
	display: 'flex',
	gap: '10px',
}

const editButton = {
	width: '36px',
	height: '36px',
	borderRadius: '10px',
	border: 'none',
	background: '#dbeafe',
	color: '#1d4ed8',
	cursor: 'pointer',
}

const deleteButton = {
	width: '36px',
	height: '36px',
	borderRadius: '10px',
	border: 'none',
	background: '#fee2e2',
	color: '#b91c1c',
	cursor: 'pointer',
}

const chipStyle = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: '6px',
}

const statusChipStyle = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '8px 12px',
	borderRadius: '999px',
	fontSize: '12px',
	fontWeight: 700,
}

const statusColorStyles = {
	'bg-emerald-100 text-emerald-700': {
		background: '#d1fae5',
		color: '#047857',
	},
	'bg-rose-100 text-rose-700': {
		background: '#ffe4e6',
		color: '#be123c',
	},
	'bg-amber-100 text-amber-700': {
		background: '#fef3c7',
		color: '#b45309',
	},
	'bg-slate-100 text-slate-700': {
		background: '#e2e8f0',
		color: '#334155',
	},
}

const modalOverlayStyle = {
	position: 'fixed',
	inset: 0,
	background: 'rgba(15, 23, 42, 0.35)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '20px',
	zIndex: 50,
}

const modalCardStyle = {
	width: '100%',
	maxWidth: '900px',
	background: '#ffffff',
	borderRadius: '18px',
	padding: '24px',
	boxShadow: '0 20px 40px rgba(2, 6, 23, 0.25)',
}

const modalHeaderStyle = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	marginBottom: '18px',
}

const modalTitleStyle = {
	margin: 0,
	fontSize: '22px',
	color: '#1e293b',
}

const modalCloseButtonStyle = {
	border: 'none',
	background: '#f1f5f9',
	color: '#334155',
	borderRadius: '10px',
	width: '36px',
	height: '36px',
	cursor: 'pointer',
}
