import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	History,
	Search,
	Filter,
	X,
} from 'lucide-react'



const GET_HISTORIQUE = `/api/HistoriqueRetour/all`

const GRAVITY_LEVELS = ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE']
const ACTION_TYPES = ['CREATION', 'MODIFICATION', 'SUPPRESSION', 'VALIDATION']

const normalizeGravityValue = (value) => {
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

	if (normalized === 'MEDIUM' || normalized === 'MOYEN' || normalized === 'MOYENNE') {
		return 'MOYENNE'
	}

	if (normalized === 'HIGH' || normalized === 'ELEVEE' || normalized === 'ELEVATED') {
		return 'ELEVEE'
	}

	if (normalized === 'CRITICAL' || normalized === 'CRITIQUE') {
		return 'CRITIQUE'
	}

	return GRAVITY_LEVELS.includes(normalized) ? normalized : 'FAIBLE'
}

const normalizeHistorique = (payload) => {
	const list = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.data)
			? payload.data
			: []

	return list
		.map((item) => ({
			id: item.id,
			retourId: item.retourId ?? '',
			produitName: item.produitName ?? 'Produit non défini',
			clientName: item.clientName ?? 'Client non défini',
			gravity: normalizeGravityValue(item.gravity),
			action: item.action ?? 'CREATION',
			employeId: item.employeId ?? '',
			employeName: item.employeName ?? 'Employé non défini',
			date: item.date ?? '',
		}))
		.sort((left, right) => String(right.date).localeCompare(String(left.date)))
}

const getGravityStyle = (gravity) => {
	switch (gravity) {
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

const getActionStyle = (action) => {
	switch (action) {
		case 'CREATION':
			return 'bg-blue-100 text-blue-700'
		case 'MODIFICATION':
			return 'bg-yellow-100 text-yellow-700'
		case 'SUPPRESSION':
			return 'bg-red-100 text-red-700'
		case 'VALIDATION':
			return 'bg-green-100 text-green-700'
		default:
			return 'bg-gray-100 text-gray-700'
	}
}

export default function HistoriquePage() {
	const [allItems, setAllItems] = useState([])
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [search, setSearch] = useState('')
	const [filterAction, setFilterAction] = useState('ALL')
	const [filterGravity, setFilterGravity] = useState('ALL')

	const authHeaders = {
		headers: {
			Authorization: `Bearer ${Cookies.get('auth_token')}`,
			'Content-Type': 'application/json',
		},
	}

	const loadHistorique = async () => {
		try {
			setLoading(true)
			setError('')

			const response = await axios.get(GET_HISTORIQUE, authHeaders)

			const normalized = normalizeHistorique(response.data)

			setAllItems(normalized)
			setItems(normalized)
		} catch (err) {
			setError(
				err.response?.data?.message ||
					err.message ||
					'Erreur lors du chargement de l\'historique'
			)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadHistorique()
	}, [])

	const filteredItems = useMemo(() => {
		let result = allItems

		if (filterAction !== 'ALL') {
			result = result.filter((item) => item.action === filterAction)
		}

		if (filterGravity !== 'ALL') {
			result = result.filter((item) => item.gravity === filterGravity)
		}

		const query = search.trim().toLowerCase()

		if (query) {
			result = result.filter((item) => {
				return [
					item.produitName,
					item.clientName,
					item.employeName,
					item.action,
					item.gravity,
					String(item.retourId),
					String(item.id),
				]
					.join(' ')
					.toLowerCase()
					.includes(query)
			})
		}

		return result
	}, [allItems, search, filterAction, filterGravity])

	const stats = useMemo(() => {
		const actions = {}
		const gravities = {}

		allItems.forEach((item) => {
			actions[item.action] = (actions[item.action] ?? 0) + 1
			gravities[item.gravity] = (gravities[item.gravity] ?? 0) + 1
		})

		return {
			total: allItems.length,
			actions,
			gravities,
			displayed: filteredItems.length,
		}
	}, [allItems, filteredItems])

	return (
		<div style={pageStyle}>
			<div style={headerStyle}>
				<History size={34} color="#2563eb" />

				<div>
					<h1 style={titleStyle}>Historique des retours</h1>

					<p style={subtitleStyle}>
						Suivi complet des actions sur les retours produits
					</p>
				</div>
			</div>

			<div style={statsGridStyle}>
				<StatCard
					title="Total"
					value={stats.total}
					hint="Enregistrements totaux"
					accent="#1d4ed8"
				/>

				<StatCard
					title="Affichés"
					value={stats.displayed}
					hint="Résultats filtrés"
					accent="#0f766e"
				/>

				{Object.entries(stats.actions).map(([action, count]) => (
					<StatCard
						key={`action-${action}`}
						title={action}
						value={count}
						hint={`Actions ${action.toLowerCase()}`}
						accent={getColorForAction(action)}
					/>
				))}
			</div>

			<div style={cardStyle}>
				<div style={toolbarStyle}>
					<div>
						<h2 style={sectionTitle}>Filtrer l'historique</h2>

						<p style={sectionSubtitle}>
							Recherchez et filtrez les actions enregistrées
						</p>
					</div>

					<div style={toolbarActions}>
						<div style={searchWrap}>
							<Search size={16} color="#64748b" />

							<input
								type="text"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Recherche par produit, client, employé..."
								style={searchStyle}
							/>
						</div>

						<div style={selectWrap}>
							<Filter size={16} color="#64748b" />

							<select
								value={filterAction}
								onChange={(event) => setFilterAction(event.target.value)}
								style={selectStyle}
							>
								<option value="ALL">Toutes les actions</option>
								{ACTION_TYPES.map((action) => (
									<option key={action} value={action}>
										{action}
									</option>
								))}
							</select>
						</div>

						<div style={selectWrap}>
							<Filter size={16} color="#64748b" />

							<select
								value={filterGravity}
								onChange={(event) => setFilterGravity(event.target.value)}
								style={selectStyle}
							>
								<option value="ALL">Toutes les gravités</option>
								{GRAVITY_LEVELS.map((level) => (
									<option key={level} value={level}>
										{level}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{error ? (
					<p style={errorStyle}>{error}</p>
				) : null}

				<div style={tableWrap}>
					{loading ? (
						<p style={loadingStyle}>Chargement...</p>
					) : (
						<table style={tableStyle}>
							<thead style={theadStyle}>
								<tr>
									<th style={thStyle}>Produit</th>
									<th style={thStyle}>Client</th>
									<th style={thStyle}>Gravité</th>
									<th style={thStyle}>Action</th>
									<th style={thStyle}>Employé</th>
									<th style={thStyle}>Date</th>
								</tr>
							</thead>

							<tbody>
								{filteredItems.length === 0 ? (
									<tr>
										<td colSpan="6" style={emptyStateStyle}>
											Aucun enregistrement trouvé
										</td>
									</tr>
								) : (
									filteredItems.map((item) => (
										<tr key={item.id} style={rowStyle}>


											<td style={tdStyle}>{item.clientName}</td>

											<td style={tdStyle}>
												<span
													style={{
														...statusChipStyle,
														...gravityStyles[
															getGravityStyle(item.gravity)
														],
													}}
												>
													{item.gravity}
												</span>
											</td>

											<td style={tdStyle}>
												<span
													style={{
														...statusChipStyle,
														...actionStyles[
															getActionStyle(item.action)
														],
													}}
												>
													{item.action}
												</span>
											</td>

											<td style={tdStyle}>{item.employeName}</td>

											<td style={tdStyle}>
												{item.date?.slice?.(0, 10) || item.date}
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

function getColorForAction(action) {
	switch (action) {
		case 'CREATION':
			return '#3b82f6'
		case 'MODIFICATION':
			return '#eab308'
		case 'SUPPRESSION':
			return '#ef4444'
		case 'VALIDATION':
			return '#10b981'
		default:
			return '#6b7280'
	}
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

const sectionTitle = {
	margin: 0,
	color: '#1e293b',
	fontSize: '22px',
}

const sectionSubtitle = {
	margin: '6px 0 0',
	color: '#64748b',
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

const searchWrap = {
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
	padding: '0 12px',
	borderRadius: '12px',
	border: '1px solid #cbd5e1',
	background: '#f8fafc',
}

const searchStyle = {
	border: 'none',
	outline: 'none',
	background: 'transparent',
	padding: '12px 4px',
	minWidth: '280px',
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

const statusChipStyle = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '8px 12px',
	borderRadius: '999px',
	fontSize: '12px',
	fontWeight: 700,
}

const gravityStyles = {
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
}

const actionStyles = {
	'bg-blue-100 text-blue-700': {
		background: '#dbeafe',
		color: '#1d4ed8',
	},

	'bg-yellow-100 text-yellow-700': {
		background: '#fef3c7',
		color: '#b45309',
	},

	'bg-red-100 text-red-700': {
		background: '#fee2e2',
		color: '#b91c1c',
	},

	'bg-green-100 text-green-700': {
		background: '#d1fae5',
		color: '#047857',
	},

	'bg-gray-100 text-gray-700': {
		background: '#f3f4f6',
		color: '#374151',
	},
}
