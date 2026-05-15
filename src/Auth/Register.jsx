import { useState } from 'react'
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  PackageCheck,
} from 'lucide-react'

const REGISTER_ENDPOINT =
  import.meta.env.VITE_API_URL + '/auth/register'

function extractToken(payload) {
  if (typeof payload === 'string') {
    return payload.trim()
  }

  return (
    payload?.token ??
    payload?.accessToken ??
    payload?.data?.token ??
    payload?.data?.accessToken ??
    ''
  )
}

async function readResponseData(response) {
  const contentType =
    response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = await response.json()

    return {
      token: extractToken(payload),
      payload,
    }
  }

  const text = await response.text()

  return {
    token: extractToken(text),
    payload: null,
  }
}

function setCookie(name, value, days = 7) {
  const expires = new Date(
    Date.now() + days * 864e5
  ).toUTCString()

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`
}

export default function Register({
  onNavigate,
}) {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    password: '',
  })

  const [status, setStatus] = useState({
    type: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)

  const updateField = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setStatus({
      type: '',
      message: '',
    })

    try {
      const body = {
        nom: form.nom,
        email: form.email,
        password: form.password,
        role: 'CLIENT',
      }

      const response = await fetch(
        REGISTER_ENDPOINT,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            
          },
          body: JSON.stringify(body),
        }
      )

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { token } =
        await readResponseData(response)

      if (!token) {
        throw new Error(
          'Le serveur doit retourner un token'
        )
      }

      setCookie('auth_token', token)
      setCookie('user_role', 'CLIENT')

      setStatus({
        type: 'success',
        message:
          'Compte créé avec succès',
      })

      setTimeout(() => {
        onNavigate?.('/login')
      }, 1200)
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.message ||
          "Erreur d'inscription",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-16 flex-col justify-between">
        
        <div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <PackageCheck size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Gestion Retour Produit
              </h1>

              <p className="text-blue-100 mt-1">
                Solution moderne
              </p>
            </div>
          </div>

          <div className="mt-24">
            <h2 className="text-6xl font-black leading-tight">
              Créez votre
              compte facilement.
            </h2>

            <p className="mt-8 text-xl text-blue-100 leading-relaxed">
              Rejoignez votre plateforme de gestion
              de retours produits et commencez à
              gérer vos opérations efficacement.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="bg-white/10 backdrop-blur p-6 rounded-2xl flex-1">
            <h3 className="text-4xl font-bold">
              Rapide
            </h3>

            <p className="text-blue-100 mt-2">
              Inscription simple
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur p-6 rounded-2xl flex-1">
            <h3 className="text-4xl font-bold">
              Sécurisé
            </h3>

            <p className="text-blue-100 mt-2">
              Données protégées
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-600 p-4 rounded-2xl mb-6">
              <PackageCheck size={28} />
            </div>

            <h2 className="text-4xl font-bold text-slate-900">
              Créer un compte
            </h2>

            <p className="text-slate-500 mt-3 text-lg">
              Commencez maintenant
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* NOM */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom complet
              </label>

              <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-2xl px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition">
                <User
                  className="text-slate-400"
                  size={20}
                />

                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={updateField('nom')}
                  className="w-full outline-none bg-transparent text-slate-800"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>

              <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-2xl px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition">
                <Mail
                  className="text-slate-400"
                  size={20}
                />

                <input
                  type="email"
                  required
                  placeholder="vous@email.com"
                  value={form.email}
                  onChange={updateField('email')}
                  className="w-full outline-none bg-transparent text-slate-800"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe
              </label>

              <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-2xl px-4 py-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition">
                <Lock
                  className="text-slate-400"
                  size={20}
                />

                <input
                  type="password"
                  required
                  placeholder="********"
                  value={form.password}
                  onChange={updateField('password')}
                  className="w-full outline-none bg-transparent text-slate-800"
                />
              </div>
            </div>


            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading
                ? 'Création...'
                : 'Créer un compte'}

              <ArrowRight size={20} />
            </button>
          </form>

          {/* STATUS */}
          {status.message && (
            <div
              className={`mt-5 p-4 rounded-2xl text-sm font-medium ${
                status.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {status.message}
            </div>
          )}

          {/* LOGIN */}
          <p className="mt-8 text-center text-slate-500">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() =>
                onNavigate?.('/login')
              }
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}