import React from 'react'
import { ClipboardList, Clock3, CheckCircle2, PackageCheck, UserCog } from 'lucide-react'

const items = [
  { key: 'tickets', label: 'Réclamations', icon: ClipboardList },
  { key: 'traitement', label: 'Traitement', icon: Clock3 },
  { key: 'suivi', label: 'Suivi', icon: CheckCircle2 },
]

function InfoCard({ title, value, hint, accent }) {
  return (
    <div className={`rounded-3xl p-6 text-white shadow-lg ${accent}`}>
      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-4xl font-black mt-3">{value}</h2>
      <p className="mt-2 text-sm opacity-90">{hint}</p>
    </div>
  )
}

export default function EmployeeHome({ onLogout }) {
  const [active, setActive] = React.useState('tickets')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-200 min-h-screen p-6 flex-col">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-sky-600 text-white p-3 rounded-2xl">
            <UserCog size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Espace Employé</h1>
            <p className="text-slate-500 text-sm">Gestion de retour produit</p>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-medium ${
                  active === item.key
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="mt-auto bg-slate-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-sky-600 text-white p-3 rounded-xl">
            <PackageCheck size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Employé connecté</h3>
            <p className="text-sm text-slate-500">Traitement des dossiers</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 w-full rounded-2xl px-4 py-3 font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Traitement</p>
            <h1 className="text-4xl font-black text-slate-800 mt-2">Vue employé</h1>
            <p className="text-slate-500 mt-2">Suivi des demandes, traitement des retours et mise à jour des statuts.</p>
          </div>
        </header>

        {active === 'tickets' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <InfoCard title="Tickets à traiter" value="12" hint="Demandes en attente de prise en charge" accent="bg-sky-600" />
              <InfoCard title="En cours" value="5" hint="Retours actuellement suivis" accent="bg-indigo-500" />
              <InfoCard title="Finalisés" value="19" hint="Dossiers clôturés ce mois-ci" accent="bg-emerald-600" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Demandes récentes</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <div>
                    <h3 className="font-semibold text-slate-800">Produit manquant</h3>
                    <p className="text-slate-500 text-sm">À vérifier avec le client</p>
                  </div>
                  <span className="bg-sky-100 text-sky-700 px-4 py-2 rounded-xl text-sm font-semibold">À traiter</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <div>
                    <h3 className="font-semibold text-slate-800">Retour validé</h3>
                    <p className="text-slate-500 text-sm">Étiquette générée</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold">Terminé</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === 'traitement' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Traitement</h2>
            <p className="text-slate-500 mb-8">Placeholder pour le traitement des retours et le suivi opérationnel.</p>
            <div className="space-y-4 text-slate-600">
              <p><strong>Étape :</strong> Vérification de la demande</p>
              <p><strong>Action :</strong> Contacter le client si besoin</p>
              <p><strong>Statut :</strong> En cours</p>
            </div>
          </div>
        )}

        {active === 'suivi' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Suivi</h2>
            <p className="text-slate-500 mb-8">Placeholder pour l’historique des actions et la progression des retours.</p>
            <div className="space-y-4 text-slate-600">
              <p><strong>Dernière action :</strong> 13/05/2026</p>
              <p><strong>Dernier responsable :</strong> Employé A</p>
              <p><strong>Résultat :</strong> Retour confirmé</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
