import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {
	Pencil,
	Plus,
	Trash2,
	X,
} from 'lucide-react'
import {jwtDecode} from 'jwt-decode'

const API_BASE_URL = import.meta.env.VITE_API_URL 

const GET_NON_CONFORMITES = `${API_BASE_URL}/NonConformite/getall`
const GET_NON_CONFORMITES_BY_GRAVITY = `${API_BASE_URL}/NonConformite/findByGravity`
const GET_NON_CONFORMITES_BY_DATE = `${API_BASE_URL}/NonConformite/findByDate`
const GET_NON_CONFORMITES_BY_RETOUR = `${API_BASE_URL}/NonConformite/findByRetour`
const ADD_NON_CONFORMITE = `${API_BASE_URL}/NonConformite/add`
const UPDATE_NON_CONFORMITE = `${API_BASE_URL}/NonConformite/update`
const DELETE_NON_CONFORMITE = `${API_BASE_URL}/NonConformite/delete`
const GET_RETOURS = `${API_BASE_URL}/retours/getall`

const GRAVITY_LEVELS = ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE']

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
			gravite: item.gravite ?? 'FAIBLE',
			retourProduitId: item.retourProduitId ?? item.retourProduit?.id ?? '',
			retourProduit: item.retourProduit?.id ? `Retour #${item.retourProduit.id}` : `Retour #${item.retourProduitId ?? item.id}`,
			date: item.dateConstatation ?? item.date ?? item.createdAt ?? '',
			note: item.note ?? '',
		}))
		.sort((left, right) => String(right.date).localeCompare(String(left.date)))
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

const getTodayDate = () => new Date().toISOString().slice(0, 10)

const emptyForm = {
	description: '',
	gravite: 'FAIBLE',
	retourProduitId: '',
	date: getTodayDate(),
	note: '',
}

export default function NonCofurmite() {
	const [allItems, setAllItems] = useState([])
	const [items, setItems] = useState([])
	const [retours, setRetours] = useState([])
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [editingId, setEditingId] = useState(null)
	const [open, setOpen] = useState(false)
	const [form, setForm] = useState(emptyForm)
	const [adminId, setAdminId] = useState(null)

	const authHeaders = {
		headers: {
			Authorization: `Bearer ${Cookies.get('auth_token')}`,
			'Content-Type': 'application/json',
		},
	}

	const loadAllItems = async () => {
		const response = await axios.get(GET_NON_CONFORMITES, authHeaders)
		const normalized = normalizeNonConformite(response.data)

		setAllItems(normalized)
		setItems(normalized)

		return normalized
	}

	const loadRetours = async () => {
		try {
			const response = await axios.get(GET_RETOURS, authHeaders)
			const list = Array.isArray(response.data) ? response.data : response.data?.data ?? []
			setRetours(list)
		} catch (err) {
			console.error('Error loading retours:', err)
		}
	}

	useEffect(() => {
		const bootstrap = async () => {
			try {
				setLoading(true)
				setError('')
				await loadAllItems()
				await loadRetours()
			} catch (err) {
				setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des non-conformités')
			} finally {
				setLoading(false)
			}
		}

		// decode admin id from token if present
		const token = Cookies.get('auth_token')
		if (token) {
			try {
				const d = jwtDecode(token)
				setAdminId(d?.id ?? null)
			} catch (e) {
				// ignore
			}
		}

		bootstrap()
	}, [])

	const stats = useMemo(() => {
		return allItems.reduce(
			(accumulator, item) => {
				accumulator.total += 1

				if (item.gravite === 'FAIBLE') accumulator.faible += 1
				if (item.gravite === 'MOYENNE') accumulator.moyenne += 1
				if (item.gravite === 'ELEVEE') accumulator.elevee += 1
				if (item.gravite === 'CRITIQUE') accumulator.critique += 1

				return accumulator
			},
			{ total: 0, faible: 0, moyenne: 0, elevee: 0, critique: 0 }
		)
	}, [allItems])

	const openCreate = () => {
		setEditingId(null)
		setForm({
			...emptyForm,
			date: getTodayDate(),
		})
		setOpen(true)
	}

	const openEdit = (item) => {
		setEditingId(item.id)
		setForm({
			description: item.description,
			gravite: item.gravite,
			retourProduitId: item.retourProduitId,
			date: item.date?.slice?.(0, 10) || item.date || '',
			note: item.note,
		})
		setOpen(true)
	}

	const closeModal = () => {
		setOpen(false)
		setEditingId(null)
		setForm(emptyForm)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!form.description || !form.retourProduitId || !form.date) {
			alert('Please fill all required fields')
			return
		}

		const payload = {
			description: form.description,
			gravity: form.gravite,
			retourProduitId: Number(form.retourProduitId),
			date: `${form.date}T00:00:00`,
			adminId: adminId || null,
			note: form.note,
		}

		try {
			setSaving(true)

			if (editingId) {
				await axios.put(`${UPDATE_NON_CONFORMITE}/${editingId}`, payload, authHeaders)
				alert('Non-conformité updated successfully')
			} else {
				await axios.post(ADD_NON_CONFORMITE, payload, authHeaders)
				alert('Non-conformité created successfully')
			}

			closeModal()
			await loadAllItems()
		} catch (err) {
			console.error(err)
			alert(err.response?.data?.message || 'Error saving non-conformité')
		} finally {
			setSaving(false)
		}
	}

	const handleDelete = async (id) => {
		const confirmDelete = window.confirm('Delete this non-conformité ?')

		if (!confirmDelete) return

		try {
			await axios.delete(`${DELETE_NON_CONFORMITE}/${id}`, authHeaders)
			alert('Non-conformité deleted successfully')
			await loadAllItems()
		} catch (err) {
			console.error(err)
			alert(err.response?.data?.message || 'Error deleting non-conformité')
		}
	}

	if (loading) {
		return (
			<div className="bg-white rounded-3xl border border-slate-200 p-8">
				<p className="text-slate-500">Chargement des non-conformités...</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-4 gap-4">
				<div className="bg-sky-600 text-white rounded-3xl p-6">
					<p className="text-sm opacity-80">Total</p>
					<h2 className="text-4xl font-black mt-3">{stats.total}</h2>
					<p className="mt-2 text-sm opacity-90">Non-conformités</p>
				</div>

				<div className="bg-emerald-600 text-white rounded-3xl p-6">
					<p className="text-sm opacity-80">Faibles</p>
					<h2 className="text-4xl font-black mt-3">{stats.faible}</h2>
					<p className="mt-2 text-sm opacity-90">Anomalies légères</p>
				</div>

				<div className="bg-amber-600 text-white rounded-3xl p-6">
					<p className="text-sm opacity-80">Moyennes</p>
					<h2 className="text-4xl font-black mt-3">{stats.moyenne}</h2>
					<p className="mt-2 text-sm opacity-90">Anomalies modérées</p>
				</div>

				<div className="bg-rose-600 text-white rounded-3xl p-6">
					<p className="text-sm opacity-80">Critiques</p>
					<h2 className="text-4xl font-black mt-3">{stats.critique}</h2>
					<p className="mt-2 text-sm opacity-90">Anomalies sévères</p>
				</div>
			</div>

			<div className="bg-white rounded-3xl border border-slate-200 p-8">
				<div className="flex items-center justify-between gap-4 mb-8">
					<div>
						<h2 className="text-3xl font-bold text-slate-800">
							NonConformité
						</h2>

						<p className="text-slate-500 mt-2">
							Gestion des anomalies détectées
							sur les produits retournés.
						</p>
					</div>

					<button
						type="button"
						onClick={openCreate}
						className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 text-white px-4 py-2.5 font-semibold hover:bg-sky-700 transition"
					>
						<Plus size={16} />
						Ajouter
					</button>
				</div>

				{error && (
					<div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-2xl">
						{error}
					</div>
				)}

				<div className="space-y-5">
					{items.length === 0 ? (
						<p className="text-slate-500 text-center py-8">Aucune non-conformité enregistrée.</p>
					) : (
						items.map((item) => (
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
											Retour:
											{' '}
											{item.retourProduit}
										</p>

										<p className="text-slate-400 text-sm mt-1">
											{item.date?.slice?.(0, 10) || item.date}
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
													handleDelete(item.id)
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
						))
					)}
				</div>
			</div>

			{open && (
				<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl">
						<div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
							<h3 className="text-xl font-bold text-slate-800">
								{editingId
									? 'Modifier NonConformité'
									: 'Créer NonConformité'}
							</h3>
							<button
								type="button"
								onClick={closeModal}
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
										Retour
									</label>
									<select
										required
										value={form.retourProduitId}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												retourProduitId: e.target.value,
											}))
										}
										className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
									>
										<option value="">Choisir un retour</option>
										{retours.map((retour) => (
											<option key={retour.id} value={retour.id}>
												Retour #{retour.id}
											</option>
										))}
									</select>
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
										{GRAVITY_LEVELS.map((level) => (
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
									Date
								</label>
								<input
									type="date"
									required
									value={form.date}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											date: e.target.value,
										}))
									}
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
									onClick={closeModal}
									className="rounded-2xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
								>
									Annuler
								</button>

								<button
									type="submit"
									disabled={saving}
									className="rounded-2xl bg-sky-600 text-white px-5 py-2.5 font-semibold hover:bg-sky-700 disabled:opacity-60"
								>
									{editingId ? 'Modifier' : 'Enregistrer'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
