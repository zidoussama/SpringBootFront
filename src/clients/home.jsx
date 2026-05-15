
import { useEffect, useState } from 'react'
import React from 'react'
import {
  LayoutDashboard,
  MessageSquareWarning,
  History,
  FileText,
  Bell,
  Search,
  User,
  PackageCheck,
} from 'lucide-react'
import ReclamationForm from './components/recclamation'
import Historique from './components/historique'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'



const Sidebar = ({ onSelect, active, onLogout }) => {
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

  

  const items = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      key: 'reclamation',
      label: 'Réclamation',
      icon: MessageSquareWarning,
    },
    {
      key: 'historique',
      label: 'Historique',
      icon: History,
    },
    {
      key: 'details',
      label: 'Détails',
      icon: FileText,
    },
  ]

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen sticky top-0 p-6 flex flex-col">
      
      {/* LOGO */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-blue-600 text-white p-3 rounded-2xl">
          <PackageCheck size={28} />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Gestion Retour
          </h1>

          <p className="text-slate-500 text-sm">
            Produit System
          </p>
        </div>
      </div>

      {/* MENU */}
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-medium ${
                active === item.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* USER */}
      <div className="mt-auto bg-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="bg-blue-600 text-white p-3 rounded-xl">
          <User size={20} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-800">
            {name}
          </h3>


          <p className="text-sm text-slate-500">
            {email}
          </p>

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
  )
}

const DashboardCard = ({
  title,
  value,
  color,
}) => {
  return (
    <div
      className={`rounded-3xl p-6 text-white ${color}`}
    >
      <p className="text-sm opacity-80">
        {title}
      </p>

      <h2 className="text-4xl font-black mt-3">
        {value}
      </h2>
    </div>
  )
}

const ClientHome = ({ onLogout }) => {
  const [active, setActive] =
    React.useState('dashboard')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        onSelect={setActive}
        onLogout={onLogout}
      />

      {/* CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* TOPBAR */}
        <header className="flex items-center justify-between mb-8">
          
          <div>
            <h1 className="text-4xl font-black text-slate-800">
              Bienvenue 👋
            </h1>

            <p className="text-slate-500 mt-2">
              Gérez facilement vos retours produits
            </p>
          </div>

          <div className="flex items-center gap-4">
            
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 w-80">
              <Search
                className="text-slate-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Rechercher..."
                className="outline-none w-full bg-transparent"
              />
            </div>

            <button className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-100 transition">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        {active === 'dashboard' && (
          <div className="space-y-8">
            
            <div className="grid md:grid-cols-3 gap-6">
              <DashboardCard
                title="Réclamations"
                value="24"
                color="bg-blue-600"
              />

              <DashboardCard
                title="En attente"
                value="8"
                color="bg-orange-500"
              />

              <DashboardCard
                title="Résolues"
                value="16"
                color="bg-green-600"
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
                      Produit endommagé
                    </h3>

                    <p className="text-slate-500 text-sm">
                      Réclamation envoyée
                    </p>
                  </div>

                  <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold">
                    En attente
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Retard de livraison
                    </h3>

                    <p className="text-slate-500 text-sm">
                      Ticket traité
                    </p>
                  </div>

                  <span className="bg-green-100 text-green-600 px-4 py-2 rounded-xl text-sm font-semibold">
                    Résolu
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECLAMATION */}
        {active === 'reclamation' && (
          <ReclamationForm />
        )}

        {/* HISTORIQUE */}
        {active === 'historique' && (
          <Historique />
        )}

      </main>
    </div>
  )
}

export default ClientHome