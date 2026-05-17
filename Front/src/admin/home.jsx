import React from 'react'
import { useEffect, useState } from 'react'

import { LayoutDashboard, FileText, Users, PackageCheck, ShieldCheck } from 'lucide-react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import Dashboard from './components/dashboard'
import ProduitsPage from './components/produit'
import UsersPage from './components/user'
import RetoursPage from './components/retour'
import NonConformitePage from './components/nonconfirmite'
import HistoriquePage from './components/historique'
import ActionPage from './components/action'


const navItems = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  { key: 'produit', label: 'Produits', icon: PackageCheck },
  { key: 'retours', label: 'Gestion des retours', icon: FileText },
  { key: 'nonconfirmite', label: 'Non-conformités', icon: ShieldCheck },
  { key: 'historique', label: 'Historique', icon: FileText },
  { key: 'action', label: 'Actions', icon: FileText }

]

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
        

        {active === 'dashboard' && <Dashboard />}

        {active === 'retours' && <RetoursPage />}

        {active === 'nonconfirmite' && <NonConformitePage />}

        {active === 'historique' && <HistoriquePage />}

        {active === 'action' && <ActionPage />}

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
