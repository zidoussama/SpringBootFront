
import React from 'react'
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

export default function QualityEmployeeHome({
  onLogout,
}) {
  const [active, setActive] =
    React.useState('retours')

  /* =========================================
     ENUMS
  ========================================= */

  const EtatTraitement = [
    'REJCTED',
    'EN_COURS',
    'TRAITE',
  ]

  const Gravite = [
    'FAIBLE',
    'MOYENNE',
    'ELEVEE',
    'CRITIQUE',
  ]

  /* =========================================
     RETOURS
  ========================================= */

  const [retours, setRetours] =
    React.useState([
      {
        id: 1,
        produit: 'Dell XPS 15',
        client: 'Ahmed',
        raison: 'Produit endommagé',
        etatTraitement: 'EN_COURS',
        date: '2026-05-15',
        gravite: 'MOYENNE',
        note: '',
      },

      {
        id: 2,
        produit: 'iPhone 14',
        client: 'Sarra',
        raison: 'Accessoire manquant',
        etatTraitement: 'TRAITE',
        date: '2026-05-14',
        gravite: 'FAIBLE',
        note: '',
      },
    ])

  /* =========================================
     NON CONFORMITES
  ========================================= */

  const [nonConformites, setNonConformites] =
    React.useState([
      {
        id: 1,
        description: 'Écran fissuré',
        gravite: 'CRITIQUE',
        date: '2026-05-15',
        produit: 'Dell XPS 15',
      },

      {
        id: 2,
        description: 'Chargeur absent',
        gravite: 'MOYENNE',
        date: '2026-05-14',
        produit: 'iPhone 14',
      },
    ])

  /* =========================================
     HISTORIQUE
  ========================================= */

  const [historique] = React.useState([
    {
      id: 1,
      retour: 'Retour #12',
      action: 'Retour traité',
      employe: 'Service Qualité',
      date: '2026-05-15',
    },

    {
      id: 2,
      retour: 'Retour #10',
      action: 'Retour rejeté',
      employe: 'Service Qualité',
      date: '2026-05-14',
    },
  ])

  /* =========================================
     UPDATE
  ========================================= */

  const updateRetour = (
    id,
    field,
    value
  ) => {
    setRetours((prev) =>
      prev.map((retour) =>
        retour.id === id
          ? {
              ...retour,
              [field]: value,
            }
          : retour
      )
    )
  }

  const saveNonConformite = (
    payload
  ) => {
    if (payload.id) {
      setNonConformites((prev) =>
        prev.map((item) =>
          item.id === payload.id
            ? {
                ...item,
                ...payload,
              }
            : item
        )
      )
      return
    }

    const nextId =
      nonConformites.length > 0
        ? Math.max(
            ...nonConformites.map(
              (item) => item.id
            )
          ) + 1
        : 1

    setNonConformites((prev) => [
      {
        ...payload,
        id: nextId,
        date:
          payload.date ||
          new Date()
            .toISOString()
            .slice(0, 10),
      },
      ...prev,
    ])
  }

  const deleteNonConformite = (id) => {
    setNonConformites((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    )
  }

  /* =========================================
     STATUS STYLE
  ========================================= */

  const getStatusStyle = (
    etatTraitement
  ) => {
    switch (etatTraitement) {
      case 'TRAITE':
        return 'bg-emerald-100 text-emerald-700'

      case 'REJCTED':
        return 'bg-rose-100 text-rose-700'

      case 'EN_COURS':
        return 'bg-amber-100 text-amber-700'

      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  /* =========================================
     GRAVITE STYLE
  ========================================= */

  const getGraviteStyle = (
    gravite
  ) => {
    switch (gravite) {
      case 'CRITIQUE':
        return 'bg-rose-100 text-rose-700'

      case 'ELEVEE':
        return 'bg-orange-100 text-orange-700'

      case 'MOYENNE':
        return 'bg-amber-100 text-amber-700'

      case 'FAIBLE':
        return 'bg-emerald-100 text-emerald-700'

      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

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
              Employé Qualité
            </h3>

            <p className="text-sm text-slate-500">
              Validation des non-conformités
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

          <h1 className="text-4xl font-black text-slate-800 mt-2">
            Tableau de bord
          </h1>

          <p className="text-slate-500 mt-2">
            Validation des retours,
            traitement des non-conformités
            et suivi des actions.
          </p>
        </header>

        {active === 'retours' && (
          <Reclamation
            retours={retours}
            EtatTraitement={EtatTraitement}
            Gravite={Gravite}
            getStatusStyle={getStatusStyle}
            updateRetour={updateRetour}
          />
        )}

        {active === 'nonconformite' && (
          <NonCofurmite
            nonConformites={nonConformites}
            Gravite={Gravite}
            getGraviteStyle={getGraviteStyle}
            onSave={saveNonConformite}
            onDelete={deleteNonConformite}
          />
        )}

        {active === 'historique' && (
          <HistoriqueRetour
            historique={historique}
          />
        )}

      </main>
    </div>
  )
}

