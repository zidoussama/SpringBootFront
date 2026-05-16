import React, {
	useEffect,
	useState,
} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	CheckCircle2,
	XCircle,
} from 'lucide-react'

function InfoCard({
	title,
	value,
	hint,
	accent,
}) {
	return (
		<div
			className={`rounded-3xl p-6 text-white shadow-lg ${accent}`}
		>
			<p className="text-sm opacity-80">
				{title}
			</p>

			<h2 className="text-4xl font-black mt-3">
				{value}
			</h2>

			<p className="mt-2 text-sm opacity-90">
				{hint}
			</p>
		</div>
	)
}

function normalizeRetours(payload) {
	const list = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.data)
			? payload.data
			: []

	return list
		.map((item) => ({
			id: item.id,
			produitId:
				item.produitId ??
				item.produit?.id ??
				null,
			clientId:
				item.clientId ??
				item.utilisateurId ??
				item.client?.id ??
				item.utilisateur?.id ??
				null,
			quantite: item.quantite ?? 1,
			produit:
				item.produit?.nom ??
				item.produit?.name ??
				item.produit?.libelle ??
				item.produit ??
				`Produit #${item.produitId ?? item.id}`,
			client:
				item.client?.nom ??
				item.client?.name ??
				item.utilisateur?.nom ??
				item.utilisateur?.name ??
				item.client ??
				item.utilisateur ??
				`Client #${item.clientId ?? item.utilisateurId ?? item.id}`,
			raison: item.raison ?? '',
			etatTraitement: item.etatTraitement ?? 'EN_COURS',
			gravite: item.gravite ?? 'MOYENNE',
			note: item.note ?? '',
			date:
				item.dateRetour ??
				item.date ??
				item.createdAt ??
				'',
		}))
		.sort((left, right) =>
			String(right.date).localeCompare(String(left.date))
		)
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''
const RETOURS_ENDPOINT = `${API_BASE_URL}/retours/getall`
const UPDATE_RETOUR_ENDPOINT = `${API_BASE_URL}/retours/update`

const getToken = () => Cookies.get('auth_token') ?? ''

export default function Reclamation() {
	const [retours, setRetours] = useState([])
	const [loading, setLoading] = useState(true)
	const [savingId, setSavingId] = useState(null)
	const [error, setError] = useState('')
	const [selectedRetour, setSelectedRetour] = useState(null)
	const [showTreatModal, setShowTreatModal] = useState(false)
	const [treatmentForm, setTreatmentForm] = useState({
		etatTraitement: 'TRAITE',
		gravite: 'MOYENNE',
		note: '',
	})

	const EtatTraitement = ['REJCTED', 'EN_COURS', 'TRAITE']
	const Gravite = ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE']

	const getStatusStyle = (etatTraitement) => {
		switch (etatTraitement) {
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

	const fetchRetours = async () => {
		try {
			setLoading(true)
			setError('')

			const token = getToken()

			if (!token) {
				throw new Error('Vous devez être connecté')
			}

			const response = await axios.get(RETOURS_ENDPOINT, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			setRetours(normalizeRetours(response.data))
		} catch (err) {
			setError(
				err.response?.data?.message ||
				err.message ||
				'Erreur lors du chargement des retours'
			)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchRetours()
	}, [])

	const updateRetour = async (retour, updates) => {
		const token = getToken()

		if (!token) {
			throw new Error('Vous devez être connecté')
		}

		const payload = {
			produitId: retour.produitId,
			clientId: retour.clientId,
			quantite: retour.quantite,
			raison: retour.raison,
			dateRetour: retour.date,
			etatTraitement: updates.etatTraitement ?? retour.etatTraitement,
			gravite: updates.gravite ?? retour.gravite,
			note: updates.note ?? retour.note,
		}

		await axios.put(`${UPDATE_RETOUR_ENDPOINT}/${retour.id}`, payload, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		setRetours((prev) =>
			prev.map((item) =>
				item.id === retour.id
					? {
						...item,
						...updates,
					}
					: item
			)
		)
	}

	function openTreatModal(retour) {
		setSelectedRetour(retour)
		setTreatmentForm({
			etatTraitement: 'TRAITE',
			gravite: retour.gravite || 'MOYENNE',
			note: retour.note || '',
		})
		setShowTreatModal(true)
	}

	function closeTreatModal() {
		setShowTreatModal(false)
		setSelectedRetour(null)
	}

	async function submitTreatment(e) {
		e.preventDefault()

		if (!selectedRetour) {
			return
		}

		try {
			setSavingId(selectedRetour.id)
			await updateRetour(selectedRetour, {
				gravite: treatmentForm.gravite,
				note: treatmentForm.note.trim(),
				etatTraitement: treatmentForm.etatTraitement,
			})
			closeTreatModal()
		} catch (err) {
			setError(
				err.response?.data?.message ||
				err.message ||
				'Erreur lors de la mise à jour du retour'
			)
		} finally {
			setSavingId(null)
		}
	}

	async function rejectRetour(retour) {
		try {
			setSavingId(retour.id)
			await updateRetour(retour, {
				etatTraitement: 'REJCTED',
			})
		} catch (err) {
			setError(
				err.response?.data?.message ||
				err.message ||
				'Erreur lors du rejet du retour'
			)
		} finally {
			setSavingId(null)
		}
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
						Service Qualité
					</p>

					<h2 className="text-3xl font-bold text-slate-800 mt-2">
						RetourProduit
					</h2>

					<p className="text-slate-500 mt-2">
						Traitement des retours depuis l'API.
					</p>
				</div>
			</div>

			{loading && (
				<div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">
					Chargement des retours...
				</div>
			)}

			{error && (
				<div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
					{error}
				</div>
			)}

			{!loading && !error && retours.length === 0 && (
				<div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">
					Aucun retour disponible.
				</div>
			)}

			<div className="grid md:grid-cols-3 gap-6">
				<InfoCard
					title="Retours"
					value={retours.length}
					hint="Retours enregistrés"
					accent="bg-sky-600"
				/>

				<InfoCard
					title="En cours"
					value={
						retours.filter(
							(r) => r.etatTraitement === 'EN_COURS'
						).length
					}
					hint="Demandes en traitement"
					accent="bg-amber-500"
				/>

				<InfoCard
					title="Traités"
					value={
						retours.filter(
							(r) => r.etatTraitement === 'TRAITE'
						).length
					}
					hint="Retours validés"
					accent="bg-emerald-600"
				/>
			</div>

			<div className="bg-white rounded-3xl border border-slate-200 p-8">
				<h2 className="text-2xl font-bold text-slate-800 mb-6">
					RetourProduit
				</h2>

				<div className="space-y-5">
					{retours.map((retour) => (
						<div
							key={retour.id}
							className="border border-slate-200 rounded-3xl p-6 bg-slate-50/40"
						>
							<div className="flex items-start justify-between gap-4">
								<div>
									<h3 className="text-xl font-bold text-slate-800">
										{retour.produit}
									</h3>

									<p className="text-slate-500 text-sm mt-1">
										Client : {retour.client}
									</p>

									<p className="text-slate-500 text-sm">
										Raison : {retour.raison}
									</p>

									<p className="text-slate-400 text-sm mt-1">
										{retour.date}
									</p>
								</div>

								<div className="flex flex-col items-end gap-2">
									<span
										className={`px-4 py-2 rounded-2xl text-sm font-semibold ${getStatusStyle(
											retour.etatTraitement
										)}`}
									>
										{retour.etatTraitement}
									</span>

									<span className="text-xs px-3 py-1 rounded-xl bg-slate-200 text-slate-700 font-semibold">
										Gravité : {retour.gravite}
									</span>
								</div>
							</div>

							<div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
								<p className="text-sm font-semibold text-slate-700 mb-1">
									Dernière note
								</p>
								<p className="text-sm text-slate-500">
									{retour.note || 'Aucune note pour ce retour.'}
								</p>
							</div>

							<div className="flex gap-3 mt-6">
								<button
									type="button"
									onClick={() => openTreatModal(retour)}
									disabled={savingId === retour.id}
									className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
								>
									<CheckCircle2 size={18} />
									Traiter
								</button>

								<button
									type="button"
									onClick={() => rejectRetour(retour)}
									disabled={savingId === retour.id}
									className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-2xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
								>
									<XCircle size={18} />
									Rejeter
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{showTreatModal && selectedRetour && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
					<form
						onSubmit={submitTreatment}
						className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 md:p-8"
					>
						<div className="flex items-start justify-between gap-4 mb-6">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-600">
									Traitement RetourProduit
								</p>
								<h3 className="text-2xl font-black text-slate-800 mt-1">
									{selectedRetour.produit}
								</h3>
								<p className="text-sm text-slate-500 mt-1">
									Client : {selectedRetour.client}
								</p>
							</div>

							<button
								type="button"
								onClick={closeTreatModal}
								className="rounded-2xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
							>
								Fermer
							</button>
						</div>

						<div className="grid md:grid-cols-2 gap-5">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									EtatTraitement
								</label>
								<select
									value={treatmentForm.etatTraitement}
									onChange={(e) =>
										setTreatmentForm((prev) => ({
											...prev,
											etatTraitement: e.target.value,
										}))
									}
									className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
								>
									{EtatTraitement.filter(
										(etat) => etat !== 'REJCTED'
									).map((etat) => (
										<option key={etat} value={etat}>
											{etat}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Gravité
								</label>
								<select
									required
									value={treatmentForm.gravite}
									onChange={(e) =>
										setTreatmentForm((prev) => ({
											...prev,
											gravite: e.target.value,
										}))
									}
									className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
								>
									{Gravite.map((gravite) => (
										<option key={gravite} value={gravite}>
											{gravite}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="mt-5">
							<label className="block text-sm font-semibold text-slate-700 mb-2">
								Notes / Commentaires (obligatoire)
							</label>

							<textarea
								required
								rows="4"
								value={treatmentForm.note}
								placeholder="Décrire le traitement appliqué..."
								onChange={(e) =>
									setTreatmentForm((prev) => ({
										...prev,
										note: e.target.value,
									}))
								}
								className="w-full rounded-2xl border border-slate-300 px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-sky-400"
							/>
						</div>

						<div className="flex justify-end gap-3 mt-6">
							<button
								type="button"
								onClick={closeTreatModal}
								className="rounded-2xl px-5 py-3 font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
							>
								Annuler
							</button>

							<button
								type="submit"
								disabled={savingId === selectedRetour.id}
								className="rounded-2xl px-5 py-3 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
							>
								{savingId === selectedRetour.id
									? 'Enregistrement...'
									: 'Valider le traitement'}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	)
}

