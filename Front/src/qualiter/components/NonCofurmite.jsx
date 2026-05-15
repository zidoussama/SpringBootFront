import React from 'react'
import {
	Pencil,
	Plus,
	Trash2,
	X,
} from 'lucide-react'

export default function NonCofurmite({
	nonConformites,
	Gravite,
	getGraviteStyle,
	onSave,
	onDelete,
}) {
	const [open, setOpen] = React.useState(false)
	const [form, setForm] = React.useState({
		id: null,
		description: '',
		produit: '',
		gravite: 'FAIBLE',
		note: '',
	})

	const openCreate = () => {
		setForm({
			id: null,
			description: '',
			produit: '',
			gravite: 'FAIBLE',
			note: '',
		})
		setOpen(true)
	}

	const openEdit = (item) => {
		setForm({
			id: item.id,
			description: item.description,
			produit: item.produit,
			gravite: item.gravite,
			note: item.note || '',
		})
		setOpen(true)
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		onSave({
			id: form.id,
			description: form.description,
			produit: form.produit,
			gravite: form.gravite,
			note: form.note,
		})
		setOpen(false)
	}

	return (
		<div className="bg-white rounded-3xl border border-slate-200 p-8">
			<div className="flex items-center justify-between gap-4 mb-2">
				<h2 className="text-3xl font-bold text-slate-800">
					NonConformité
				</h2>

				<button
					type="button"
					onClick={openCreate}
					className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 text-white px-4 py-2.5 font-semibold hover:bg-sky-700 transition"
				>
					<Plus size={16} />
					Ajouter
				</button>
			</div>

			<p className="text-slate-500 mb-8">
				Gestion des anomalies détectées
				sur les produits retournés.
			</p>

			<div className="space-y-5">
				{nonConformites.map((item) => (
					<div
						key={item.id}
						className="border border-slate-200 rounded-3xl p-6"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3 className="text-lg font-bold text-slate-800">
									{item.description}
								</h3>

								<p className="text-slate-500 text-sm mt-1">
									Produit:
									{' '}
									{item.produit}
								</p>

								<p className="text-slate-400 text-sm mt-1">
									{item.date}
								</p>

								{item.note && (
									<p className="text-slate-600 text-sm mt-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
										{item.note}
									</p>
								)}
							</div>

							<div className="flex flex-col items-end gap-3 ml-4">
								<span
									className={`px-4 py-2 rounded-2xl text-sm font-semibold ${getGraviteStyle(
										item.gravite
									)}`}
								>
									{item.gravite}
								</span>

								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() =>
											openEdit(item)
										}
										className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
									>
										<Pencil size={14} />
										Edit
									</button>

									<button
										type="button"
										onClick={() =>
											onDelete(item.id)
										}
										className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
									>
										<Trash2 size={14} />
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{open && (
				<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl">
						<div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
							<h3 className="text-xl font-bold text-slate-800">
								{form.id
									? 'Modifier NonConformité'
									: 'Créer NonConformité'}
							</h3>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
							>
								<X size={18} />
							</button>
						</div>

						<form
							onSubmit={handleSubmit}
							className="p-6 space-y-5"
						>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Produit
									</label>
									<input
										required
										value={form.produit}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												produit: e.target.value,
											}))
										}
										className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Gravité
									</label>
									<select
										value={form.gravite}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												gravite: e.target.value,
											}))
										}
										className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
									>
										{Gravite.map((level) => (
											<option key={level} value={level}>
												{level}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Description
								</label>
								<input
									required
									value={form.description}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder="Décrire la non-conformité..."
									className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-2">
									Notes / Commentaires
								</label>
								<textarea
									rows="3"
									value={form.note}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											note: e.target.value,
										}))
									}
									className="w-full rounded-2xl border border-slate-300 px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-sky-400"
								/>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<button
									type="button"
									onClick={() => setOpen(false)}
									className="rounded-2xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
								>
									Annuler
								</button>

								<button
									type="submit"
									className="rounded-2xl bg-sky-600 text-white px-5 py-2.5 font-semibold hover:bg-sky-700"
								>
									Enregistrer
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
