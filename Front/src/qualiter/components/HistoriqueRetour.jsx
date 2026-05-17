
import React, {
	useEffect,
	useState,
} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL =
	import.meta.env.VITE_API_URL

const HISTORIQUE_ENDPOINT = `${API_BASE_URL}/HistoriqueRetour/all`

const getToken = () =>
	Cookies.get('auth_token')

const normalizeHistorique = (
	historiques
) => {
	return historiques
		.map((item) => {
			let actionLabel =
				'Action inconnue'

			switch (item.action) {
				case 'TRAITEMENT':
					actionLabel =
						'Retour traité'
					break

				case 'REJET':
					actionLabel =
						'Retour rejeté'
					break

				case 'CREATION':
					actionLabel =
						'Retour créé'
					break

				case 'MODIFICATION':
					actionLabel =
						'Retour modifié'
					break

				default:
					actionLabel =
						item.action ||
						'Action inconnue'
			}

			const gravityColors = {
				FAIBLE:
					'bg-emerald-100 text-emerald-700',
				MOYENNE:
					'bg-amber-100 text-amber-700',
				ELEVEE:
					'bg-orange-100 text-orange-700',
				CRITIQUE:
					'bg-rose-100 text-rose-700',
			}

			return {

				produitName:
					item.produitName ||
					'Produit inconnu',

				gravite:
					item.gravity ||
					'Non définie',

				graviteColor:
					gravityColors[
						item.gravity
					] ||
					'bg-slate-100 text-slate-700',

				action: actionLabel,

				employe:
					item.employeName ||
					'Service Qualité',

				clientName:
					item.clientName ||
					'Client inconnu',

				date: item.date || '',
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

	const [error, setError] =
		useState('')

	useEffect(() => {
		const loadHistorique =
			async () => {
				try {
					setLoading(true)
					setError('')

					const token =
						getToken()

					if (!token) {
						throw new Error(
							'Vous devez être connecté'
						)
					}

					const response =
						await axios.get(
							HISTORIQUE_ENDPOINT,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							}
						)

					const historiques =
						Array.isArray(
							response.data
						)
							? response.data
							: response.data
									?.data || []

					setHistorique(
						normalizeHistorique(
							historiques
						)
					)
				} catch (err) {
					setError(
						err.response?.data
							?.message ||
							err.message ||
							"Erreur lors du chargement de l'historique"
					)
				} finally {
					setLoading(false)
				}
			}

		loadHistorique()
	}, [])

	return (
		<div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-slate-800">
					Historique des Retours
				</h2>

				<p className="text-slate-500 mt-2">
					Historique des actions
					réalisées par le Service
					Qualité.
				</p>
			</div>

			{loading && (
				<div className="flex items-center justify-center py-10">
					<p className="text-slate-500">
						Chargement de
						l'historique...
					</p>
				</div>
			)}

			{error && (
				<div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-rose-700 mb-6">
					{error}
				</div>
			)}

			{!loading &&
				!error &&
				historique.length ===
					0 && (
					<div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
						<p className="text-slate-500">
							Aucun historique
							trouvé.
						</p>
					</div>
				)}

			<div className="space-y-5">
				{historique.map(
					(item) => (
						<div
							key={item.id}
							className="group border border-slate-200 bg-slate-50 rounded-3xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300"
						>
							<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
								<div className="flex-1">
									<div className="flex flex-wrap items-center gap-3 mb-4">
										<h3 className="text-xl font-bold text-slate-800">
											{
												item.retour
											}
										</h3>

										<span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
											{
												item.action
											}
										</span>
									</div>

									<div className="flex flex-wrap gap-3 mb-5">
										<span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
											Produit :
											{' '}
											{
												item.produitName
											}
										</span>

										<span
											className={`px-4 py-2 rounded-full text-sm font-medium ${item.graviteColor}`}
										>
											Gravité :
											{' '}
											{
												item.gravite
											}
										</span>
									</div>

									<div className="grid sm:grid-cols-2 gap-4 text-sm">
										<div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
											<p className="text-slate-400 text-xs mb-1">
												Employé
											</p>

											<p className="font-semibold text-slate-700">
												{
													item.employe
												}
											</p>
										</div>

										<div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
											<p className="text-slate-400 text-xs mb-1">
												Client
											</p>

											<p className="font-semibold text-slate-700">
												{
													item.clientName
												}
											</p>
										</div>
									</div>
								</div>

								<div className="flex flex-col items-end">
									<span className="text-sm text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-xl">
										{
											item.date
										}
									</span>
								</div>
							</div>
						</div>
					)
				)}
			</div>
		</div>
	)
}

