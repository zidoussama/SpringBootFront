
import React from 'react'
import { useEffect, useState } from 'react'
import {
  ClipboardList,
  AlertTriangle,
  History,
  PackageCheck,
  UserCog,
} from 'lucide-react'
import Reclamation from './components/Reclamation'
import NonCofurmite from './components/NonCofurmite'
import HistoriqueRetour from './components/HistoriqueRetour'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'


const items = [
  {
    key: 'retours',
    label: 'RetourProduit',
    icon: ClipboardList,
  },
  {
    key: 'nonconformite',
    label: 'NonConformité',
    icon: AlertTriangle,
  },
  {
    key: 'historique',
    label: 'HistoriqueRetour',
    icon: History,
  },
]
  
export default function QualityEmployeeHome({onLogout,}){


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
    
          
        }
      }, [token])
  const [active, setActive] =
    React.useState('retours')

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}

      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 w-80 bg-white border-r border-slate-200 min-h-screen p-6 flex-col">

        <div className="flex items-center gap-4 mb-10">
          <div className="bg-sky-600 text-white p-3 rounded-2xl">
            <UserCog size={28} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Service Qualité
            </h1>

            <p className="text-slate-500 text-sm">
              Gestion des retours produits
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.key}
                onClick={() =>
                  setActive(item.key)
                }
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
            <h3 className="font-semibold text-slate-800">
              {name}
            </h3>
            <h4 >
              {role}
            </h4>
            <p className="text-sm text-slate-500">
              {email}
            </p>
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

      {/* MAIN */}

      <main className="flex-1 p-8 lg:p-10 lg:ml-80">

        {/* HEADER */}

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Service Qualité
          </p>
        </header>

        {active === 'retours' && (
          <Reclamation
          />
        )}

        {active === 'nonconformite' && (
          <NonCofurmite />
        )}

        {active === 'historique' && (
          <HistoriqueRetour
          />
        )}

      </main>
    </div>
  )
}

