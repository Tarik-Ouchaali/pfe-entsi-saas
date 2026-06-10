'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { isSuperAdmin } from '@/lib/auth'
import { AdminAbonnement, PaginatedResponse } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function EntreprisesPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [abonnements, setAbonnements] = useState<PaginatedResponse<AdminAbonnement> | null>(null)
  const [page, setPage] = useState(1)
  const [showAdjustModal, setShowAdjustModal] = useState<AdminAbonnement | null>(null)
  const [adjustForm, setAdjustForm] = useState({
    montant: '',
    type: 'pack',
    raison: '',
  })
  const [adjustErrors, setAdjustErrors] = useState<Record<string, string>>({})
  const [adjusting, setAdjusting] = useState(false)
  const [adjustSuccess, setAdjustSuccess] = useState(false)
  const [adjustError, setAdjustError] = useState('')

  // Access guard
  useEffect(() => {
    if (!isSuperAdmin()) router.replace('/dashboard')
  }, [router])

  // Fetch entreprises (workaround via abonnements)
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await apiGet<PaginatedResponse<AdminAbonnement>>(
        `/admin/abonnements?statut=actif&per_page=15&page=${page}`
      )
      setAbonnements(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Open adjust modal
  const openAdjustModal = (a: AdminAbonnement) => {
    setShowAdjustModal(a)
    setAdjustForm({ montant: '', type: 'pack', raison: '' })
    setAdjustErrors({})
    setAdjustSuccess(false)
    setAdjustError('')
  }

  // Close adjust modal
  const closeAdjustModal = () => {
    setShowAdjustModal(null)
    setAdjustForm({ montant: '', type: 'pack', raison: '' })
    setAdjustErrors({})
    setAdjustSuccess(false)
    setAdjustError('')
  }

  // Client-side validation
  const validateAdjust = (): boolean => {
    const errors: Record<string, string> = {}

    if (!adjustForm.montant) {
      errors.montant = 'Le montant est requis.'
    } else if (!Number.isInteger(Number(adjustForm.montant))) {
      errors.montant = 'Le montant doit être un entier.'
    } else if (parseInt(adjustForm.montant) === 0) {
      errors.montant = 'Le montant ne peut pas être 0.'
    }

    if (!adjustForm.raison.trim()) {
      errors.raison = 'La raison est requise.'
    } else if (adjustForm.raison.trim().length < 5) {
      errors.raison = 'La raison doit contenir au moins 5 caractères.'
    } else if (adjustForm.raison.trim().length > 255) {
      errors.raison = 'La raison ne peut pas dépasser 255 caractères.'
    }

    setAdjustErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle adjust
  const handleAdjust = async () => {
    if (!validateAdjust() || !showAdjustModal) return

    setAdjusting(true)
    setAdjustError('')
    try {
      await apiPost(`/admin/companies/${showAdjustModal.entreprise.id}/credits/adjust`, {
        montant: parseInt(adjustForm.montant),
        type: adjustForm.type,
        raison: adjustForm.raison.trim(),
      })
      setAdjustSuccess(true)
      setTimeout(() => {
        closeAdjustModal()
      }, 1500)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : "Erreur lors de l'ajustement."
      setAdjustError(message)
    } finally {
      setAdjusting(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-12 bg-blue-100 rounded-xl" />
        <div className="h-72 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement des entreprises.
        </p>
        <button onClick={refetch} className="mt-3 text-sm text-red-600 underline">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Entreprises"
        subtitle="Gestion des entreprises et de leurs crédits"
      />

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-700">
        Les données affichées proviennent des abonnements actifs.
        La gestion complète des entreprises sera disponible prochainement.
      </div>

      {/* Entreprises table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Entreprise</th>
              <th className="text-left px-6 py-3 font-medium">Plan actuel</th>
              <th className="text-left px-6 py-3 font-medium">Date fin abonnement</th>
              <th className="text-left px-6 py-3 font-medium">Prochain plan</th>
              <th className="text-right px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {abonnements?.data.map((a) => {
              const daysLeft = Math.ceil(
                (new Date(a.date_fin).getTime() - new Date().getTime()) / 86400000
              )

              let dateFinColor = 'text-text-muted'
              if (daysLeft < 0) dateFinColor = 'text-red-600 font-medium'
              else if (daysLeft <= 7) dateFinColor = 'text-orange-500 font-medium'

              return (
                <tr key={a.id}>
                  <td className="px-6 py-4 font-medium text-navy">
                    {a.entreprise.raison_sociale}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-text">{a.plan_saa_s.nom_plan}</p>
                    <p className="text-xs text-text-muted">{a.plan_saa_s.prix} MAD/mois</p>
                  </td>
                  <td className={`px-6 py-4 text-xs ${dateFinColor}`}>
                    {new Date(a.date_fin).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-text-muted text-xs">
                    {a.next_plan?.nom_plan ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openAdjustModal(a)}
                      className="border border-gold text-gold text-xs px-3 py-1.5 rounded-lg hover:bg-gold hover:text-white transition-colors"
                    >
                      Ajuster crédits
                    </button>
                  </td>
                </tr>
              )
            })}
            {abonnements?.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted text-sm">
                  Aucune entreprise trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {abonnements && abonnements.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-text-muted">
            Page {abonnements.current_page} sur {abonnements.last_page} —{' '}
            {abonnements.total} résultat{abonnements.total > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="border border-border text-text-muted text-sm px-3 py-1.5 rounded-lg hover:border-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(abonnements.last_page, p + 1))}
              disabled={page >= abonnements.last_page}
              className="border border-border text-text-muted text-sm px-3 py-1.5 rounded-lg hover:border-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Adjust Credits Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="font-semibold text-navy text-lg">Ajuster les crédits</h2>
            <p className="text-text-muted text-sm mt-1 mb-4">
              {showAdjustModal.entreprise.raison_sociale}
            </p>

            <div className="space-y-4">
              {/* montant */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Montant (positif = ajouter, négatif = retirer) *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 10 ou -5"
                  value={adjustForm.montant}
                  onChange={(e) =>
                    setAdjustForm((p) => ({ ...p, montant: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                <p className="text-xs text-text-muted mt-1">Ne peut pas être 0</p>
                {adjustErrors.montant && (
                  <p className="text-red-600 text-xs mt-1">{adjustErrors.montant}</p>
                )}
              </div>

              {/* type */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Type de crédits *
                </label>
                <select
                  value={adjustForm.type}
                  onChange={(e) =>
                    setAdjustForm((p) => ({ ...p, type: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors bg-white"
                >
                  <option value="pack">Pack (n&apos;expirent jamais)</option>
                  <option value="abonnement">Abonnement (reset mensuel)</option>
                </select>
              </div>

              {/* raison */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Raison de l&apos;ajustement *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Compensation suite à un incident"
                  value={adjustForm.raison}
                  onChange={(e) =>
                    setAdjustForm((p) => ({ ...p, raison: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                {adjustErrors.raison && (
                  <p className="text-red-600 text-xs mt-1">{adjustErrors.raison}</p>
                )}
              </div>
            </div>

            {/* Adjust error */}
            {adjustError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mt-3">
                {adjustError}
              </div>
            )}

            {/* Adjust success */}
            {adjustSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 mt-3">
                Crédits ajustés avec succès.
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeAdjustModal}
                className="flex-1 border border-border text-text px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjusting}
                className="flex-1 bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {adjusting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Ajustement...
                  </span>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
