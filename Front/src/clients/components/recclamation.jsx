import React, {
  useEffect,
  useState,
  useCallback,
} from 'react'
import axios from 'axios'



const PRODUITS_ENDPOINT =
  `/api/produits/getall`

const RECLAMATION_ENDPOINT =
  `/api/retours/add`

/* =======================================================
   HELPERS
======================================================= */

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

const axiosConfig = (
  withJson = false
) => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    ...(withJson && {
      'Content-Type':
        'application/json',
    }),
  },
})

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

const normalizeProduitsResponse = (
  payload
) => {
  if (Array.isArray(payload))
    return payload

  if (Array.isArray(payload?.data))
    return payload.data

  if (
    Array.isArray(payload?.content)
  )
    return payload.content

  return []
}

const formatLocalDateTime = (
  date
) => {
  const pad = (n) =>
    String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`
}

/* =======================================================
   COMPONENT
======================================================= */

export default function ReclamationForm() {
  const [produits, setProduits] =
    useState([])

  const [
    loadingProduits,
    setLoadingProduits,
  ] = useState(true)

  const [loading, setLoading] =
    useState(false)

  const [status, setStatus] =
    useState({
      type: '',
      message: '',
    })

  const [form, setForm] =
    useState({
      produitId: '',
      raison: '',
    })

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = useCallback(
    (field) => (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    },
    []
  )

  /* =======================================================
     LOAD PRODUITS
  ======================================================= */

  useEffect(() => {
    const loadProduits =
      async () => {
        try {
          const token =
            getToken()

          if (!token) {
            throw new Error(
              'Vous devez être connecté'
            )
          }

          const response =
            await axios.get(
              PRODUITS_ENDPOINT,
              axiosConfig()
            )

          const list =
            normalizeProduitsResponse(
              response.data
            )

          setProduits(list)

          if (list.length > 0) {
            setForm((prev) => ({
              ...prev,
              produitId: String(
                list[0].id
              ),
            }))
          }
          
        } catch (error) {
          if (error.response?.status === 401) {
            setStatus({
              type: 'error',
              message:
                'Session expirée, veuillez vous reconnecter',
            })
          }else if (error.response?.status === 400) {
            setStatus("")
          } else {
            setStatus({
              type: 'error',
              message:
                error.response?.data
                  ?.message ||
                error.message ||
                'Erreur serveur',
            })
          }
          
        } finally {
          setLoadingProduits(false)
        }
      }

    loadProduits()
  }, [])

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault()

    setStatus({
      type: '',
      message: '',
    })

    if (!form.raison.trim()) {
      return setStatus({
        type: 'error',
        message:
          'Veuillez saisir une raison',
      })
    }

    if (!form.produitId) {
      return setStatus({
        type: 'error',
        message:
          'Veuillez sélectionner un produit',
      })
    }

    setLoading(true)

    try {
      const token =
        getToken()

      if (!token) {
        throw new Error(
          'Session expirée'
        )
      }

      const utilisateurId =
        extractUserIdFromToken(
          token
        )

      if (!utilisateurId) {
        throw new Error(
          'Utilisateur introuvable'
        )
      }

      const payload = {
        produitId: Number(
          form.produitId
        ),
        utilisateurId,
        raison:
          form.raison.trim(),
        etatTraitement:
          'EN_COURS',
        date: formatLocalDateTime(
          new Date()
        ),
      }

      await axios.post(
        RECLAMATION_ENDPOINT,
        payload,
        axiosConfig(true)
      )

      setStatus({
        type: 'success',
        message:
          'Réclamation envoyée avec succès',
      })

      setForm((prev) => ({
        ...prev,
        raison: '',
      }))
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.response?.data
            ?.message ||
          error.message ||
          'Erreur serveur',
      })
    } finally {
      setLoading(false)
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">
          Nouvelle Réclamation
        </h2>

        <p className="text-slate-500 mt-2">
          Sélectionnez un produit et décrivez votre problème.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* PRODUIT */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Produit
          </label>

          <select
            value={form.produitId}
            onChange={updateField(
              'produitId'
            )}
            disabled={
              loadingProduits ||
              loading
            }
            required
            className="w-full border border-slate-300 rounded-2xl px-4 py-4 bg-white outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {loadingProduits && (
              <option value="">
                Chargement...
              </option>
            )}

            {!loadingProduits &&
              produits.length ===
                0 && (
                <option value="">
                  Aucun produit disponible
                </option>
              )}

            {!loadingProduits &&
              produits.map(
                (produit) => (
                  <option
                    key={
                      produit.id
                    }
                    value={String(
                      produit.id
                    )}
                  >
                    {produit.nom ??
                      produit.name ??
                      `Produit #${produit.id}`}
                  </option>
                )
              )}
          </select>
        </div>

        {/* RAISON */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Raison
          </label>

          <textarea
            rows="5"
            required
            disabled={loading}
            value={form.raison}
            onChange={updateField(
              'raison'
            )}
            placeholder="Décrivez votre problème..."
            className="w-full border border-slate-300 rounded-2xl px-4 py-4 resize-none outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-50"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={
            loading ||
            loadingProduits ||
            produits.length === 0
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition text-white font-semibold py-4 rounded-2xl"
        >
          {loading
            ? 'Envoi...'
            : 'Envoyer Réclamation'}
        </button>

        {/* STATUS */}
        {status.message && (
          <div
            className={`rounded-2xl px-4 py-4 text-sm font-medium ${
              status.type ===
              'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {status.message}
          </div>
        )}
      </form>
    </div>
  )
}