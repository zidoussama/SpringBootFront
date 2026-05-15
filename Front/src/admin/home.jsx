import React from 'react'
import { useEffect, useState } from 'react'

import { LayoutDashboard, FileText, Users, PackageCheck, ShieldCheck } from 'lucide-react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import ProduitsPage from './components/produit'
import UsersPage from './components/user'


const navItems = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'retours', label: 'Gestion des retours', icon: FileText },
  { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  { key: 'produit', label: 'Produits', icon: PackageCheck },
]

function StatCard({ title, value, hint, accent }) {
  return (
    <div className={`rounded-3xl p-6 text-white shadow-lg ${accent}`}>
      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-4xl font-black mt-3">{value}</h2>
      <p className="mt-2 text-sm opacity-90">{hint}</p>
    </div>
  )
}

export default function AdminHome({ onLogout }) {
  const [active, setActive] = React.useState('dashboard')
    const token = Cookies.get('auth_token')
    const [decoded, setDecoded] = useState(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    useEffect(() => {
      if (token) {
        const decoded = jwtDecode(token)
        setDecoded(decoded)
        setName(decoded.name )
        setEmail(decoded.email)
        setRole(decoded.role)
        console.log('Decoded JWT:', decoded)
  
        
      }
    }, [token])

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex w-80 bg-white border-r border-slate-200 min-h-screen p-6 flex-col">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Retour</h1>
            <p className="text-slate-500 text-sm">Gestion de retour produit</p>
          </div>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-medium ${
                  active === item.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
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
          <div className="bg-indigo-600 text-white p-3 rounded-xl">
            <PackageCheck size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{name}</h3>
            <p className="text-sm text-slate-500">{email}</p>
            <h4 className="text-sm text-slate-500"> {role} </h4>
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Administration</p>
            <h1 className="text-4xl font-black text-slate-800 mt-2">Vue admin</h1>
            <p className="text-slate-500 mt-2">Supervision des retours produits, utilisateurs et traitement global.</p>
          </div>
        </header>

        {active === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard title="Retours ouverts" value="24" hint="Nouvelles réclamations à traiter" accent="bg-indigo-600" />
              <StatCard title="En cours" value="8" hint="Dossiers actuellement suivis" accent="bg-orange-500" />
              <StatCard title="Résolus" value="16" hint="Retours terminés ce mois-ci" accent="bg-emerald-600" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Activité récente</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <div>
                    <h3 className="font-semibold text-slate-800">Retour autorisé</h3>
                    <p className="text-slate-500 text-sm">Demande validée par l'administration</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold">Validé</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <div>
                    <h3 className="font-semibold text-slate-800">Litige en attente</h3>
                    <p className="text-slate-500 text-sm">Nécessite une décision</p>
                  </div>
                  <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold">En attente</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === 'retours' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-3xl">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Gestion des retours</h2>
            <p className="text-slate-500 mb-8">Espace placeholder pour administrer les réclamations et les validations.</p>
            <div className="space-y-4 text-slate-600">
              <p><strong>Statut :</strong> En attente de traitement</p>
              <p><strong>Priorité :</strong> Haute</p>
              <p><strong>Responsable :</strong> Équipe administration</p>
            </div>
          </div>
        )}

        {active === 'utilisateurs' && (
          <UsersPage />
        )}
        {active === 'produit' && (
          <ProduitsPage />
        )}
      </main>
    </div>
  )
}
