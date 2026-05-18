import { useState } from 'react'
import {
  Mail,
  Lock,
  ArrowRight,
  PackageCheck,
} from 'lucide-react'

const LOGIN_ENDPOINT ='/api/auth/login'

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
    const token = extractToken(payload)

    return { token, payload }
  }

  const text = await response.text()
  const token = extractToken(text)

  return { token, payload: null }
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.')

    if (parts.length < 2) return null

    const payload = parts[1]

    const b64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => {
          return (
            '%' +
            ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          )
        })
        .join('')
    )

    return JSON.parse(json)
  } catch {
    return null
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

function detectRole({ payload, token }) {
  if (payload) {
    const role =
      payload.role ??
      payload?.user?.role ??
      payload?.data?.role

    if (role) {
      return role.toString().toUpperCase()
    }
  }

  if (token) {
    const decoded = decodeJwtPayload(token)

    if (decoded) {
      const r =
        decoded.role ??
        decoded?.roles ??
        decoded?.authorities ??
        decoded?.realm_access?.roles

      if (r) {
        return Array.isArray(r)
          ? String(r[0]).toUpperCase()
          : String(r).toUpperCase()
      }
    }
  }

  return null
}

export default function Login({ onNavigate }) {
  const [form, setForm] = useState({
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
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { token, payload } =
        await readResponseData(response)

      if (!token) {
        throw new Error(
          'Le serveur doit retourner un token'
        )
      }

      setCookie('auth_token', token)

      const role = detectRole({ payload, token })

      if (role) {
        setCookie('user_role', role)
      }

      setStatus({
        type: 'success',
        message: 'Connexion réussie',
      })

      if (role === 'CLIENT') {
        onNavigate?.('/client')
      } else if (role === 'ADMIN') {
        onNavigate?.('/admin')
      } else if (
        role === 'CLIENT'
      ) {
        onNavigate?.('/clients')
      } else {
        onNavigate?.('/qualite')
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.message || 'Erreur de connexion',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-16 flex-col justify-between">
        
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
                Solution professionnelle
              </p>
            </div>
          </div>

          <div className="mt-24">
            <h2 className="text-6xl font-black leading-tight">
              Gérez vos retours
              simplement.
            </h2>

            <p className="mt-8 text-xl text-blue-100 leading-relaxed">
              Une plateforme moderne pour gérer les
              retours produits, les clients et les
              réclamations facilement.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="bg-white/10 backdrop-blur p-6 rounded-2xl flex-1">
            <h3 className="text-4xl font-bold">
              24/7
            </h3>

            <p className="text-blue-100 mt-2">
              Disponible
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur p-6 rounded-2xl flex-1">
            <h3 className="text-4xl font-bold">
              100%
            </h3>

            <p className="text-blue-100 mt-2">
              Sécurisé
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center bg-blue-100 text-blue-600 p-4 rounded-2xl mb-6">
              <PackageCheck size={28} />
            </div>

            <h2 className="text-4xl font-bold text-slate-900">
              Bon retour 👋
            </h2>

            <p className="text-slate-500 mt-3 text-lg">
              Connectez-vous à votre compte
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>

              <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-2xl px-4 py-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition">
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

              <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-2xl px-4 py-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition">
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
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading
                ? 'Connexion...'
                : 'Se connecter'}

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

          {/* REGISTER */}
          <p className="mt-8 text-center text-slate-500">
            Vous n’avez pas de compte ?{' '}
            <button
              onClick={() =>
                onNavigate?.('/register')
              }
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}