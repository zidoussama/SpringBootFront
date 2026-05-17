import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

function StatCard({ title, value, hint, accent }) {
	return (
		<div className={`rounded-3xl p-6 text-white shadow-lg ${accent}`}>
			<p className="text-sm opacity-80">{title}</p>
			<h2 className="text-4xl font-black mt-3">{value}</h2>
			<p className="mt-2 text-sm opacity-90">{hint}</p>
		</div>
	)
}

export default function Dashboard() {

    const token = Cookies.get('auth_token')
	const [enCoursCount, setEnCoursCount] = useState(0)
	const [traiteCount, setTraiteCount] = useState(0)
	const [rejectedCount, setRejectedCount] = useState(0)

	useEffect(() => {

		const headers = {
			Authorization: `Bearer ${Cookies.get('auth_token')}`
		}

		Promise.all([
			axios.get(
				`${import.meta.env.VITE_API_URL}/retours/countbyetat/EN_COURS`,
				{ headers }
			),
			axios.get(
				`${import.meta.env.VITE_API_URL}/retours/countbyetat/TRAITE`,
				{ headers }
			),
			axios.get(
				`${import.meta.env.VITE_API_URL}/retours/countbyetat/REJCTED`,
				{ headers }
			)
		])
		.then(([enCoursRes, traiteRes, rejectedRes]) => {
			setEnCoursCount(enCoursRes.data.count)
			setTraiteCount(traiteRes.data.count)
			setRejectedCount(rejectedRes.data.count)
		})
		.catch(error => {
			console.error(error)
		})

	}, [token])

	return (
		<div className="space-y-8">
			<div className="grid md:grid-cols-3 gap-6">
				<StatCard
					title="En cours"
					value={enCoursCount}
					hint="Nouvelles réclamations à traiter"
					accent="bg-indigo-600"
				/>

				<StatCard
					title="Rejetés"
					value={rejectedCount}
					hint="Dossiers actuellement rejetés"
					accent="bg-orange-500"
				/>

				<StatCard
					title="TRAITÉS"
					value={traiteCount}
					hint="Retours terminés"
					accent="bg-emerald-600"
				/>
			</div>

			<div className="bg-white rounded-3xl border border-slate-200 p-8">
				<h2 className="text-2xl font-bold text-slate-800 mb-6">
					Activité récente
				</h2>

				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
						<div>
							<h3 className="font-semibold text-slate-800">
								Retour autorisé
							</h3>

							<p className="text-slate-500 text-sm">
								Demande validée par l'administration
							</p>
						</div>

						<span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold">
							Validé
						</span>
					</div>

					<div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
						<div>
							<h3 className="font-semibold text-slate-800">
								Litige en attente
							</h3>

							<p className="text-slate-500 text-sm">
								Nécessite une décision
							</p>
						</div>

						<span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold">
							En attente
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

