import React, {
  useEffect,
  useState,
} from 'react'

import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? ''

const getCookieValue = (name) => {
  const value = document.cookie
    .split('; ')
    .find((row) =>
      row.startsWith(`${name}=`)
    )

  return value
    ? decodeURIComponent(
        value.split('=')[1]
      )
    : ''
}

const getToken = () =>
  getCookieValue('auth_token')

const decodeJwtPayload = (
  token
) => {
  try {
    const payload =
      token.split('.')[1]

    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

const extractUserIdFromToken = (
  token
) => {
  const payload =
    decodeJwtPayload(token)

  if (!payload) return null

  return Number(
    payload.id ??
      payload.userId ??
      payload.utilisateurId ??
      payload.uid
  )
}

export default function Historique() {
  const [retours, setRetours] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadRetours =
      async () => {
        try {
          const token =
            getToken()

          if (!token) {
            throw new Error(
              'Utilisateur non connecté'
            )
          }

          const clientId =
            extractUserIdFromToken(
              token
            )

          const response =
            await axios.get(
              `${API_BASE_URL}/retours/getbyclient/${clientId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )

          setRetours(
            response.data || []
          )
        } catch (err) {
          setError(
            err.response?.data
              ?.message ||
              err.message
          )
        } finally {
          setLoading(false)
        }
      }

    loadRetours()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        Chargement...
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 rounded-3xl p-6">
        {error}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Détails Réclamation
      </h2>

      {retours.length === 0 ? (
        <p className="text-slate-500">
          Aucun retour trouvé
        </p>
      ) : (
        <div className="space-y-6">
          {retours.map((retour) => (
            <div
              key={retour.id}
              className="border border-slate-200 rounded-2xl p-6"
            >
              <div className="space-y-4 text-slate-600">
                <p>
                  <strong>
                    Produit :
                  </strong>{' '}
                  {retour?.produit
                    ?.nom ||
                    'Produit inconnu'}
                </p>

                <p>
                  <strong>
                    Problème :
                  </strong>{' '}
                  {retour.raison}
                </p>

                <p>
                  <strong>
                    Status :
                  </strong>{' '}
                  <span
                    className={`font-semibold ${
                      retour.etatTraitement ===
                      'RESOLU'
                        ? 'text-green-600'
                        : 'text-orange-500'
                    }`}
                  >
                    {
                      retour.etatTraitement
                    }
                  </span>
                </p>

                <p>
                  <strong>
                    Date :
                  </strong>{' '}
                  {retour.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}