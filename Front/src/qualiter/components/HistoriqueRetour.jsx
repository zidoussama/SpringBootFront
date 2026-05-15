import React from 'react'

export default function HistoriqueRetour({
	historique,
}) {
	return (
		<div className="bg-white rounded-3xl border border-slate-200 p-8">
			<h2 className="text-3xl font-bold text-slate-800 mb-2">
				HistoriqueRetour
			</h2>

			<p className="text-slate-500 mb-8">
				Historique des actions réalisées
				par le Service Qualité.
			</p>

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
