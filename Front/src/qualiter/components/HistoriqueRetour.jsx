import React, {
	useEffect,
	useState,
} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL =import.meta.env.VITE_API_URL 

const HISTORIQUE_ENDPOINT =`${API_BASE_URL}/api/HistoriqueRetour/all`



const getToken = () => Cookies.get('auth_token') 

const normalizeHistorique = (historiques) => {
	return historiques
		.map((item) => {
			let actionLabel = 'Action inconnue'

			switch (item.action) {
				case 'TRAITEMENT':
					actionLabel = 'Retour traité'
					break

				case 'REJET':
					actionLabel = 'Retour rejeté'
					break

				case 'CREATION':
					actionLabel = 'Retour créé'
					break

				case 'MODIFICATION':
					actionLabel = 'Retour modifié'
					break

				default:
					actionLabel =
						item.action || 'Action inconnue'
			}

			return {
				id: item.id,

				retour: item.retour
					? `Retour #${item.retour.id}`
					: 'Retour inconnu',

				produitName:
					item.produitName ||
					'Produit inconnu',

				gravite:
					item.gravite || 'Non définie',

				action: actionLabel,

				employe:
					item.employeName ||
					item.employe?.nom ||
					'Service Qualité',

				date:
					item.date || '',
			}
		})
		.sort((a, b) =>
			String(b.date).localeCompare(
				String(a.date)
			)
		)
}

export default function HistoriqueRetour() {
	const [historique, setHistorique] =
		useState([])

	const [loading, setLoading] =
		useState(true)

	const [error, setError] = useState('')

	useEffect(() => {
		const loadHistorique = async () => {
			try {
				setLoading(true)
				setError('')

				const token = getToken()

				if (!token) {
					throw new Error(
						'Vous devez être connecté'
					)
				}

				const response = await axios.get(
					HISTORIQUE_ENDPOINT,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)

				const historiques = Array.isArray(
					response.data
				)
					? response.data
					: response.data?.data || []

				setHistorique(
					normalizeHistorique(historiques)
				)
			} catch (err) {
				setError(
					err.response?.data?.message ||
						err.message ||
						'Erreur lors du chargement de l’historique'
				)
			} finally {
				setLoading(false)
			}
		}

		loadHistorique()
	}, [])

	return (
		<div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
			<h2 className="text-3xl font-bold text-slate-800 mb-2">
				Historique des Retours
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

			{!loading &&
				!error &&
				historique.length === 0 && (
					<p className="text-slate-500">
						Aucun historique trouvé.
					</p>
				)}

			<div className="space-y-5">
				{historique.map((item) => (
					<div
						key={item.id}
						className="border border-slate-200 bg-slate-50 rounded-2xl p-5 hover:shadow-md transition"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-2">
								<p className="font-bold text-slate-800 text-lg">
									{item.retour}
								</p>

								<p className="text-slate-600">
									{item.action}
								</p>

								<div className="flex flex-wrap gap-3 text-sm">
									<span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
										Produit :
										{' '}
										{item.produitName}
									</span>

									<span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
										Gravité :
										{' '}
										{item.gravite}
									</span>
								</div>

								<p className="text-sm text-slate-500">
									Employé :
									{' '}
									{item.employe}
								</p>
							</div>

							<span className="text-sm text-slate-400 whitespace-nowrap">
								{item.date}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

