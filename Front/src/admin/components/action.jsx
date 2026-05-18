import React, { useState, useEffect } from 'react'
import { Save, X, AlertCircle } from 'lucide-react'
import axios from 'axios'
import Cookies from 'js-cookie'



export default function ActionPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [retours, setRetours] = useState([])
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({
    retourId: '',
    employeId: '',
    action: 'CREATION',
    date: new Date().toISOString().split('T')[0],
  })

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${Cookies.get('auth_token')}`,
      'Content-Type': 'application/json',
    },
  }

  const actionOptions = ['CREATION', 'MODIFICATION', 'TRAITEMENT', 'REJET']

  // Load retours and employees on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [retoursResponse, usersResponse] = await Promise.all([
          axios.get(`/api/retours/getall`, authHeaders),
          axios.get(`/api/users/getall`, authHeaders),
        ])

        // Normalize retours
        const retoursList = Array.isArray(retoursResponse.data)
          ? retoursResponse.data
          : retoursResponse.data?.data ?? []

        const normalizedRetours = retoursList.map((item) => ({
          id: item.id,
          produit: item.NomProduit ?? item.produit?.nom ?? item.produit?.name ?? 'Produit non défini',
          client: item.NomClient ?? item.client?.nom ?? item.client?.name ?? item.utilisateur?.nom ?? 'Client non défini',
          etat: item.etatTraitement ?? 'EN_COURS',
        }))

        // Filter employees with QUALITE role
        const usersList = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse.data?.data ?? []

        const qualiteEmployees = usersList.filter(
          (user) => user.role === 'QUALITE' || user.role === 'qualite'
        )

        setRetours(normalizedRetours)
        setEmployees(qualiteEmployees)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Erreur lors du chargement des données')
      }
    }

    loadData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'retourId' || name === 'employeId' ? parseInt(value) : value,
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.retourId || !formData.employeId || !formData.action || !formData.date) {
        setError('Tous les champs sont obligatoires')
        setLoading(false)
        return
      }

      const payload = {
        retourId: formData.retourId,
        employeId: formData.employeId,
        action: formData.action,
        date: formData.date,
      }

      const response = await axios.post(
        `/api/HistoriqueRetour/add`,
        payload,
        authHeaders
      )

      if (response.status === 201 || response.status === 200) {
        setSuccess(true)
        setFormData({
          retourId: '',
          employeId: '',
          action: 'CREATION',
          date: new Date().toISOString().split('T')[0],
        })

        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors de l\'ajout de l\'action'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      retourId: '',
      employeId: '',
      action: 'CREATION',
      date: new Date().toISOString().split('T')[0],
    })
    setError(null)
    setSuccess(false)
  }

  const selectedRetour = retours.find((r) => r.id === formData.retourId)
  const selectedEmployee = employees.find((e) => e.id === formData.employeId)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Ajouter une Action</h1>
        <p className="text-slate-600 mb-8">
          Enregistrez une nouvelle action dans l'historique de retour
        </p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs mt-0.5 flex-shrink-0">
              ✓
            </div>
            <div>
              <p className="font-semibold text-green-900">Succès</p>
              <p className="text-green-700 text-sm mt-1">Action ajoutée avec succès</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Retour Selection */}
            <div>
              <label htmlFor="retourId" className="block text-sm font-semibold text-slate-700 mb-2">
                Sélectionner un Retour <span className="text-red-600">*</span>
              </label>
              <select
                id="retourId"
                name="retourId"
                value={formData.retourId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="">-- Choisir un retour --</option>
                {retours.map((retour) => (
                  <option key={retour.id} value={retour.id}>
                    #{retour.id} - {retour.produit} ({retour.client})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Le retour concerné par cette action</p>
            </div>

            {/* Employee Selection */}
            <div>
              <label htmlFor="employeId" className="block text-sm font-semibold text-slate-700 mb-2">
                Sélectionner un Employé QUALITÉ <span className="text-red-600">*</span>
              </label>
              <select
                id="employeId"
                name="employeId"
                value={formData.employeId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="">-- Choisir un employé --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nom || emp.name || emp.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Employé avec le rôle QUALITÉ</p>
            </div>

            {/* Action Type */}
            <div>
              <label htmlFor="action" className="block text-sm font-semibold text-slate-700 mb-2">
                Type d'Action <span className="text-red-600">*</span>
              </label>
              <select
                id="action"
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                {actionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Sélectionnez le type d'action à enregistrer</p>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">Date de l'action</p>
            </div>
          </div>

          {/* Summary */}
          {selectedRetour && selectedEmployee && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-900 mb-3">Résumé de l'action :</p>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <span className="font-semibold">Retour :</span> {selectedRetour.produit} ({selectedRetour.client})
                </p>
                <p>
                  <span className="font-semibold">Employé :</span> {selectedEmployee.nom || selectedEmployee.name || selectedEmployee.email}
                </p>
                <p>
                  <span className="font-semibold">Action :</span> {formData.action}
                </p>
                <p>
                  <span className="font-semibold">Date :</span> {formData.date}
                </p>
              </div>
            </div>
          )}

         
          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Envoi en cours...' : 'Enregistrer l\'Action'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <X size={20} />
              Réinitialiser
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
