import React, {
	useEffect,
	useState,
} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'


const API_BASE_URL =
	import.meta.env.VITE_API_URL ?? ''

const HISTORIQUE_ENDPOINT =
	`${API_BASE_URL}/retours/getall`

const getCookieValue = (name) => {
	const value = document.cookie
		.split('; ')
		.find((row) =>
			row.startsWith(`${name}=`)
		)

	return value
		? decodeURIComponent(
				value.split('=')[1]
		  )
		: ''
}

const getToken = () =>
	Cookies.get('auth_token') ||
	getCookieValue('auth_token')

const normalizeHistorique = (retours) => {
	return retours
		.map((retour) => {
			const etat =
				retour.etatTraitement ||
				'EN_COURS'

			let action = 'Retour en cours'

			if (etat === 'TRAITE') {
				action = 'Retour traité'
			} else if (etat === 'REJCTED') {
				action = 'Retour rejeté'
			}

			return {
				id: retour.id,
				retour:
					`Retour #${retour.id}`,
				action,
				employe:
					retour.employe ||
					'Service Qualité',
				date:
					retour.date ||
					retour.dateRetour ||
					retour.createdAt ||
					'',
				etat,
			}
		})
		.sort((a, b) =>
			String(b.date).localeCompare(String(a.date))
		)
}

export default function HistoriqueRetour() {
	const [historique, setHistorique] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const loadHistorique = async () => {
			try {
				setLoading(true)
				setError('')

				const token = getToken()

				if (!token) {
					throw new Error('Vous devez être connecté')
				}

				const response = await axios.get(
					HISTORIQUE_ENDPOINT,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)

				const retours = Array.isArray(response.data)
					? response.data
					: response.data?.data || []

				setHistorique(normalizeHistorique(retours))
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

		loadHistorique()
	}, [])

	return (
		<div className="bg-white rounded-3xl border border-slate-200 p-8">
			<h2 className="text-3xl font-bold text-slate-800 mb-2">
				HistoriqueRetour
			</h2>

			<p className="text-slate-500 mb-8">
				Historique des actions réalisées
				par le Service Qualité.
			</p>

			{loading && (
				<p className="text-slate-500">
					Chargement de l'historique...
				</p>
			)}

			{error && (
				<p className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">
					{error}
				</p>
			)}

			{!loading && !error && historique.length === 0 && (
				<p className="text-slate-500">
					Aucun retour trouvé.
				</p>
			)}

			<div className="space-y-5">
				{historique.map((item) => (
					<div
						key={item.id}
						className="border-l-4 border-sky-500 bg-slate-50 rounded-2xl p-5"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-bold text-slate-800">
									{item.retour}
								</p>

								<p className="text-slate-600 mt-1">
									{item.action}
								</p>

								<p className="text-sm text-slate-500 mt-1">
									Employé:
									{' '}
									{item.employe}
								</p>
							</div>

							<span className="text-sm text-slate-400">
								{item.date}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
