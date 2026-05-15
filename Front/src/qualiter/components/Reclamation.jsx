import React, { useState } from 'react'
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

export default function Reclamation({
	retours,
	EtatTraitement,
	Gravite,
	getStatusStyle,
	updateRetour,
}) {
	const [selectedRetour, setSelectedRetour] =
		useState(null)
	const [showTreatModal, setShowTreatModal] =
		useState(false)
	const [treatmentForm, setTreatmentForm] =
		useState({
			etatTraitement: 'TRAITE',
			gravite: 'MOYENNE',
			note: '',
		})

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

	function submitTreatment(e) {
		e.preventDefault()

		if (!selectedRetour) {
			return
		}

		updateRetour(
			selectedRetour.id,
			'gravite',
			treatmentForm.gravite
		)
		updateRetour(
			selectedRetour.id,
			'note',
			treatmentForm.note.trim()
		)
		updateRetour(
			selectedRetour.id,
			'etatTraitement',
			treatmentForm.etatTraitement
		)

		closeTreatModal()
	}

	return (
		<div className="space-y-8">

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
							(r) =>
								r.etatTraitement ===
								'EN_COURS'
						).length
					}
					hint="Demandes en traitement"
					accent="bg-amber-500"
				/>

				<InfoCard
					title="Traités"
					value={
						retours.filter(
							(r) =>
								r.etatTraitement ===
								'TRAITE'
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
									onClick={() =>
										openTreatModal(retour)
									}
									className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
								>
									<CheckCircle2 size={18} />
									Traiter
								</button>

								<button
									onClick={() =>
										updateRetour(
											retour.id,
											'etatTraitement',
											'REJCTED'
										)
									}
									className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
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
									value={
										treatmentForm.etatTraitement
									}
									onChange={(e) =>
										setTreatmentForm(
											(prev) => ({
												...prev,
												etatTraitement:
													e.target.value,
											})
										)
									}
									className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
								>
									{EtatTraitement.filter(
										(etat) =>
											etat !== 'REJCTED'
									).map((etat) => (
										<option
											key={etat}
											value={etat}
										>
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
										setTreatmentForm(
											(prev) => ({
												...prev,
												gravite:
													e.target.value,
											})
										)
									}
									className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
								>
									{Gravite.map((gravite) => (
										<option
											key={gravite}
											value={gravite}
										>
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
								className="rounded-2xl px-5 py-3 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
							>
								Valider le traitement
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	)
}

