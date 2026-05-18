import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	ShieldCheck,
	Pencil,
	Trash2,
	Plus,
	Filter,
	Calendar,
	Link2,
	X,
} from 'lucide-react'



const GET_NON_CONFORMITES = `/api/NonConformite/getall`
const GET_NON_CONFORMITES_BY_GRAVITY = `/api/NonConformite/findByGravity`
const GET_NON_CONFORMITES_BY_DATE = `/api/NonConformite/findByDate`
const GET_NON_CONFORMITES_BY_RETOUR = `/api/NonConformite/findByRetour`
const ADD_NON_CONFORMITE = `/api/NonConformite/add`
const UPDATE_NON_CONFORMITE = `/api/NonConformite/update`
const DELETE_NON_CONFORMITE = `/api/NonConformite/delete`

const GRAVITY_LEVELS = ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE']

const normalizeGraviteValue = (value) => {
	const normalized = String(value ?? '')
		.trim()
		.toUpperCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')

	if (!normalized) {
		return 'FAIBLE'
	}

	if (normalized === 'LOW' || normalized === 'FAIBLE') {
		return 'FAIBLE'
	}

	if (
		normalized === 'MEDIUM' ||
		normalized === 'MOYEN' ||
		normalized === 'MOYENNE'
	) {
		return 'MOYENNE'
	}

	if (
		normalized === 'HIGH' ||
		normalized === 'ELEVEE' ||
		normalized === 'ELEVATED'
	) {
		return 'ELEVEE'
	}

	if (normalized === 'CRITICAL' || normalized === 'CRITIQUE') {
		return 'CRITIQUE'
	}

	return GRAVITY_LEVELS.includes(normalized)
		? normalized
		: 'FAIBLE'
}

const normalizeNonConformite = (payload) => {
	const list = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.data)
			? payload.data
			: []

	return list
		.map((item) => ({
			id: item.id,
			description: item.description ?? '',
			commentaires: item.commentaires ?? '',
			gravite: normalizeGraviteValue(
				item.gravite ??
					item.gravity ??
					item.niveauGravite ??
					item.severity
			),
			retourProduitId:
				item.retourProduitId ??
				item.retourProduit?.id ??
				'',
			retourProduit: item.retourProduit?.id
				? `Retour #${item.retourProduit.id}`
				: `Retour #${item.retourProduitId ?? item.id}`,
			dateConstatation:
				item.dateConstatation ??
				item.date ??
				item.createdAt ??
				'',
		}))
		.sort((left, right) =>
			String(right.dateConstatation).localeCompare(
				String(left.dateConstatation)
			)
		)
}

const getGraviteStyle = (gravite) => {
	switch (gravite) {
		case 'CRITIQUE':
			return 'bg-rose-100 text-rose-700'

		case 'ELEVEE':
			return 'bg-orange-100 text-orange-700'

		case 'MOYENNE':
			return 'bg-amber-100 text-amber-700'

		case 'FAIBLE':
		default:
			return 'bg-emerald-100 text-emerald-700'
	}
}

const emptyForm = {
	description: '',
	commentaires: '',
	gravite: 'FAIBLE',
	retourProduitId: '',
	dateConstatation: '',
}

export default function NonConformitePage() {
	const [allItems, setAllItems] = useState([])
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [editingId, setEditingId] = useState(null)
	const [filterMode, setFilterMode] = useState('ALL')
	const [filterValue, setFilterValue] = useState('')
	const [search, setSearch] = useState('')
	const [showModal, setShowModal] = useState(false)

	const [form, setForm] = useState(emptyForm)

	const authHeaders = {
		headers: {
			Authorization: `Bearer ${Cookies.get('auth_token')}`,
			'Content-Type': 'application/json',
		},
	}

	const loadAllItems = async () => {
		const response = await axios.get(
			GET_NON_CONFORMITES,
			authHeaders
		)

		const normalized = normalizeNonConformite(
			response.data
		)

		setAllItems(normalized)
		setItems(normalized)

		return normalized
	}

	const applyFilter = async () => {
		try {
			setLoading(true)
			setError('')

			if (filterMode === 'ALL') {
				const normalized = await loadAllItems()
				setItems(normalized)
				return
			}

			if (!filterValue.trim()) {
				alert('Please provide a filter value')
				return
			}

			let endpoint = GET_NON_CONFORMITES_BY_GRAVITY

			if (filterMode === 'RETOUR') {
				endpoint = GET_NON_CONFORMITES_BY_RETOUR
			} else if (filterMode === 'DATE') {
				endpoint = GET_NON_CONFORMITES_BY_DATE
			}

			const response = await axios.get(
				`${endpoint}/${filterValue.trim()}`,
				authHeaders
			)

			setItems(normalizeNonConformite(response.data))
		} catch (err) {
			setError(
				err.response?.data?.message ||
					err.message ||
					'Erreur lors du filtrage des non-conformités'
			)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const bootstrap = async () => {
			try {
				setLoading(true)
				setError('')
				await loadAllItems()
			} catch (err) {
				setError(
					err.response?.data?.message ||
						err.message ||
						'Erreur lors du chargement des non-conformités'
				)
			} finally {
				setLoading(false)
			}
		}

		bootstrap()
	}, [])

	const filteredItems = useMemo(() => {
		const query = search.trim().toLowerCase()

		if (!query) {
			return items
		}

		return items.filter((item) => {
			return [
				item.description,
				item.commentaires,
				item.gravite,
				item.retourProduit,
				String(item.retourProduitId),
				String(item.id),
			]
				.join(' ')
				.toLowerCase()
				.includes(query)
		})
	}, [items, search])

	const stats = useMemo(() => {
		const retourIds = new Set()

		return allItems.reduce(
			(accumulator, item) => {
				accumulator.total += 1

				if (item.retourProduitId !== '' && item.retourProduitId !== null && item.retourProduitId !== undefined) {
					retourIds.add(String(item.retourProduitId))
				}

				if (item.gravite === 'FAIBLE')
					accumulator.faible += 1

				if (item.gravite === 'MOYENNE')
					accumulator.moyenne += 1

				if (item.gravite === 'ELEVEE')
					accumulator.elevee += 1

				if (item.gravite === 'CRITIQUE')
					accumulator.critique += 1

				return accumulator
			},
			{
				total: 0,
				faible: 0,
				moyenne: 0,
				elevee: 0,
				critique: 0,
				retours: 0,
			}
		)

		return {
			total: allItems.length,
			faible: allItems.filter((item) => item.gravite === 'FAIBLE').length,
			moyenne: allItems.filter((item) => item.gravite === 'MOYENNE').length,
			elevee: allItems.filter((item) => item.gravite === 'ELEVEE').length,
			critique: allItems.filter((item) => item.gravite === 'CRITIQUE').length,
			retours: retourIds.size,
		}
	}, [allItems])

	const handleChange = (event) => {
		const { name, value } = event.target

		setForm((previous) => ({
			...previous,
			[name]: value,
		}))
	}

	const resetForm = () => {
		setEditingId(null)
		setShowModal(false)
		setForm(emptyForm)
	}

	const editItem = (item) => {
		setEditingId(item.id)

		setForm({
			description: item.description,
			commentaires: item.commentaires || '',
			gravite: item.gravite,
			retourProduitId: item.retourProduitId,
			dateConstatation:
				item.dateConstatation?.slice?.(0, 10) ||
				item.dateConstatation ||
				'',
		})

		setShowModal(true)
	}

	const saveItem = async () => {
		if (
			!form.description ||
			!form.retourProduitId ||
			!form.dateConstatation
		) {
			alert('Please fill all required fields')
			return
		}

		const payload = {
			description: form.description,
			commentaires: form.commentaires,
			gravite: form.gravite,
			retourProduitId: Number(form.retourProduitId),
			dateConstatation: form.dateConstatation,
		}

		try {
			setSaving(true)

			if (editingId) {
				await axios.put(
					`${UPDATE_NON_CONFORMITE}/${editingId}`,
					payload,
					authHeaders
				)

				alert('Non-conformité updated successfully')
			} else {
				await axios.post(
					ADD_NON_CONFORMITE,
					payload,
					authHeaders
				)

				alert('Non-conformité created successfully')
			}

			resetForm()

			await loadAllItems()
			await applyFilter()
		} catch (err) {
			console.error(err)

			alert(
				err.response?.data?.message ||
					'Error saving non-conformité'
			)
		} finally {
			setSaving(false)
		}
	}

	const deleteItem = async (id) => {
		const confirmDelete = window.confirm(
			'Delete this non-conformité ?'
		)

		if (!confirmDelete) return

		try {
			await axios.delete(
				`${DELETE_NON_CONFORMITE}/${id}`,
				authHeaders
			)

			alert('Non-conformité deleted successfully')

			await loadAllItems()
			await applyFilter()
		} catch (err) {
			console.error(err)

			alert(
				err.response?.data?.message ||
					'Error deleting non-conformité'
			)
		}
	}

	const applySelectedFilter = () => {
		if (filterMode === 'ALL') {
			setItems(allItems)
			return
		}

		applyFilter()
	}

	useEffect(() => {
		if (filterMode === 'ALL') {
			setFilterValue('')
			setItems(allItems)
		}
	}, [filterMode, allItems])

	return (
		<div style={pageStyle}>
			<div style={headerStyle}>
				<ShieldCheck size={34} color="#2563eb" />

				<div>
					<h1 style={titleStyle}>
						Gestion des non-conformités
					</h1>

					<p style={subtitleStyle}>
						Suivre les anomalies liées aux retours produits
					</p>
				</div>
			</div>

			<div style={statsGridStyle}>
				<StatCard
					title="Total"
					value={stats.total}
					hint="Non-conformités enregistrées"
					accent="#1d4ed8"
				/>

				<StatCard
					title="Faibles"
					value={stats.faible}
					hint="Anomalies légères"
					accent="#10b981"
				/>

				<StatCard
					title="Moyennes"
					value={stats.moyenne}
					hint="Anomalies modérées"
					accent="#f59e0b"
				/>

				<StatCard
					title="Élevées"
					value={stats.elevee}
					hint="Anomalies importantes"
					accent="#f97316"
				/>

				<StatCard
					title="Critiques"
					value={stats.critique}
					hint="Anomalies bloquantes"
					accent="#dc2626"
				/>

				
			</div>

			{showModal && (
				<div style={modalOverlayStyle}>
					<div style={modalStyle}>
						<div style={modalHeaderStyle}>
							<div>
								<h2 style={sectionTitle}>
									{editingId
										? 'Update Non-Conformity'
										: 'Add Non-Conformity'}
								</h2>

								<p style={sectionSubtitle}>
									Associez la non-conformité à un
									retour produit
								</p>
							</div>

							<button
								onClick={resetForm}
								style={closeButtonStyle}
							>
								<X size={18} />
							</button>
						</div>

						<div style={formGrid}>
							<input
								type="text"
								name="description"
								placeholder="Description"
								value={form.description}
								onChange={handleChange}
								style={inputStyle}
							/>

							<textarea
								name="commentaires"
								placeholder="Commentaires"
								value={form.commentaires}
								onChange={handleChange}
								style={textareaStyle}
							/>

							<select
								name="gravite"
								value={form.gravite}
								onChange={handleChange}
								style={inputStyle}
							>
								{GRAVITY_LEVELS.map((level) => (
									<option
										key={level}
										value={level}
									>
										{level}
									</option>
								))}
							</select>

							<input
								type="number"
								name="retourProduitId"
								placeholder="Retour Produit ID"
								value={form.retourProduitId}
								onChange={handleChange}
								style={inputStyle}
							/>

							<input
								type="date"
								name="dateConstatation"
								value={form.dateConstatation}
								onChange={handleChange}
								style={inputStyle}
							/>
						</div>

						<div style={buttonContainer}>
							<button
								onClick={saveItem}
								disabled={saving}
								style={primaryButton}
							>
								<Plus size={18} />

								{editingId
									? 'Update'
									: 'Add Non-Conformity'}
							</button>

							<button
								onClick={resetForm}
								style={secondaryButton}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			<div style={cardStyle}>
				<div style={toolbarStyle}>
					<div>
						<h2 style={sectionTitle}>
							Filtrer les non-conformités
						</h2>

						<p style={sectionSubtitle}>
							Utilise les endpoints de recherche par
							gravité, date ou retour
						</p>
					</div>

					<div style={toolbarActions}>
						<div style={selectWrap}>
							<Filter size={16} color="#64748b" />

							<select
								value={filterMode}
								onChange={(event) =>
									setFilterMode(
										event.target.value
									)
								}
								style={selectStyle}
							>
								<option value="ALL">
									Toutes les non-conformités
								</option>

								<option value="GRAVITY">
									Par gravité
								</option>

								<option value="RETOUR">
									Par retour
								</option>

								<option value="DATE">
									Par date
								</option>
							</select>
						</div>

						{filterMode === 'GRAVITY' && (
							<div style={selectWrap}>
								<ShieldCheck
									size={16}
									color="#64748b"
								/>

								<select
									value={filterValue}
									onChange={(event) =>
										setFilterValue(
											event.target.value
										)
									}
									style={selectStyle}
								>
									<option value="">
										Choisir la gravité
									</option>

									{GRAVITY_LEVELS.map((level) => (
										<option
											key={level}
											value={level}
										>
											{level}
										</option>
									))}
								</select>
							</div>
						)}

						{filterMode === 'RETOUR' && (
							<input
								type="number"
								value={filterValue}
								onChange={(event) =>
									setFilterValue(
										event.target.value
									)
								}
								placeholder="Retour Produit ID"
								style={searchStyle}
							/>
						)}

						{filterMode === 'DATE' && (
							<div style={selectWrap}>
								<Calendar
									size={16}
									color="#64748b"
								/>

								<input
									type="date"
									value={filterValue}
									onChange={(event) =>
										setFilterValue(
											event.target.value
										)
									}
									style={dateStyle}
								/>
							</div>
						)}

						<button
							onClick={applySelectedFilter}
							style={primaryButton}
						>
							<Link2 size={18} />
							Apply
						</button>
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
									<th style={thStyle}>
										Description
									</th>
									<th style={thStyle}>
										Commentaires
									</th>
									<th style={thStyle}>Retour</th>
									<th style={thStyle}>Date</th>
									<th style={thStyle}>Gravité</th>
									<th style={thStyle}>Actions</th>
								</tr>
							</thead>

							<tbody>
								{filteredItems.length === 0 ? (
									<tr>
										<td
											colSpan="6"
											style={
												emptyStateStyle
											}
										>
											No non-conformities
											found
										</td>
									</tr>
								) : (
									filteredItems.map((item) => (
										<tr
											key={item.id}
											style={rowStyle}
										>
											<td style={tdStyle}>
												{item.description}
											</td>

											<td style={tdStyle}>
												{
													item.commentaires
												}
											</td>

											<td style={tdStyle}>
												{
													item.retourProduit
												}
											</td>

											<td style={tdStyle}>
												{item.dateConstatation?.slice?.(
													0,
													10
												) ||
													item.dateConstatation}
											</td>

											<td style={tdStyle}>
												<span
													style={{
														...statusChipStyle,
														...graviteStyles[
															getGraviteStyle(
																item.gravite
															)
														],
													}}
												>
													{item.gravite}
												</span>
											</td>

											<td style={tdStyle}>
												<div
													style={
														actionGroupStyle
													}
												>
													<button
														onClick={() =>
															editItem(
																item
															)
														}
														style={
															editButton
														}
													>
														<Pencil
															size={
																16
															}
														/>
													</button>

													<button
														onClick={() =>
															deleteItem(
																item.id
															)
														}
														style={
															deleteButton
														}
													>
														<Trash2
															size={
																16
															}
														/>
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
	gridTemplateColumns:
		'repeat(auto-fit, minmax(180px, 1fr))',
	gap: '16px',
	marginBottom: '24px',
}

const statCardStyle = {
	borderRadius: '18px',
	padding: '20px',
	color: 'white',
	boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
}

const statTitleStyle = {
	margin: 0,
	opacity: 0.85,
	fontSize: '14px',
}

const statValueStyle = {
	margin: '8px 0 4px',
	fontSize: '34px',
	fontWeight: 800,
}

const statHintStyle = {
	margin: 0,
	opacity: 0.9,
	fontSize: '13px',
}

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

const textareaStyle = {
	padding: '12px',
	borderRadius: '10px',
	border: '1px solid #cbd5e1',
	outline: 'none',
	fontSize: '14px',
	minHeight: '120px',
	resize: 'vertical',
	gridColumn: '1 / -1',
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

const dateStyle = {
	border: 'none',
	outline: 'none',
	background: 'transparent',
	padding: '12px 4px',
	minWidth: '180px',
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

const loadingStyle = {
	padding: '20px',
	color: '#64748b',
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

const statusChipStyle = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '8px 12px',
	borderRadius: '999px',
	fontSize: '12px',
	fontWeight: 700,
}

const graviteStyles = {
	'bg-rose-100 text-rose-700': {
		background: '#ffe4e6',
		color: '#be123c',
	},

	'bg-orange-100 text-orange-700': {
		background: '#ffedd5',
		color: '#c2410c',
	},

	'bg-amber-100 text-amber-700': {
		background: '#fef3c7',
		color: '#b45309',
	},

	'bg-emerald-100 text-emerald-700': {
		background: '#d1fae5',
		color: '#047857',
	},

	'bg-slate-100 text-slate-700': {
		background: '#e2e8f0',
		color: '#334155',
	},
}

const modalOverlayStyle = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	background: 'rgba(15, 23, 42, 0.55)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	zIndex: 999,
	padding: '20px',
}

const modalStyle = {
	background: 'white',
	borderRadius: '20px',
	padding: '25px',
	width: '100%',
	maxWidth: '700px',
	boxShadow: '0 20px 45px rgba(0,0,0,0.2)',
	maxHeight: '90vh',
	overflowY: 'auto',
}

const modalHeaderStyle = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'flex-start',
	marginBottom: '20px',
}

const closeButtonStyle = {
	border: 'none',
	background: '#fee2e2',
	color: '#b91c1c',
	width: '36px',
	height: '36px',
	borderRadius: '10px',
	cursor: 'pointer',
	fontWeight: 'bold',
}