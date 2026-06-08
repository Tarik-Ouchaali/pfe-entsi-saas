'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut } from '@/lib/api'
import { isSuperAdmin } from '@/lib/auth'
import { PlanSaaS } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function PlansPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [plans, setPlans] = useState<PlanSaaS[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanSaaS | null>(null)
  const [form, setForm] = useState({
    nom_plan: '',
    prix: '',
    credits_alloues: '',
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [saveError, setSaveError] = useState('')

  // Access guard
  useEffect(() => {
    if (!isSuperAdmin()) router.replace('/dashboard')
  }, [router])

  // Fetch plans
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await apiGet<{ plans: PlanSaaS[] }>('/admin/plans')
      setPlans(data.plans)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Open create form
  const openCreateForm = () => {
    setEditingPlan(null)
    setForm({ nom_plan: '', prix: '', credits_alloues: '', is_active: true })
    setFormErrors({})
    setSaveError('')
    setShowForm(true)
  }

  // Open edit form
  const openEditForm = (plan: PlanSaaS) => {
    setEditingPlan(plan)
    setForm({
      nom_plan: plan.nom_plan,
      prix: String(plan.prix),
      credits_alloues: String(plan.credits_alloues),
      is_active: plan.is_active,
    })
    setFormErrors({})
    setSaveError('')
    setShowForm(true)
  }

  // Toggle active/inactive
  const handleToggleActive = async (plan: PlanSaaS) => {
    setTogglingId(plan.id)
    try {
      await apiPut(`/admin/plans/${plan.id}`, { is_active: !plan.is_active })
      await refetch()
    } catch {
      // Silently handle
    } finally {
      setTogglingId(null)
    }
  }

  // Client-side validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!form.nom_plan.trim()) {
      errors.nom_plan = 'Le nom du plan est requis.'
    } else if (form.nom_plan.trim().length < 2) {
      errors.nom_plan = 'Le nom doit contenir au moins 2 caractères.'
    } else if (form.nom_plan.trim().length > 255) {
      errors.nom_plan = 'Le nom ne peut pas dépasser 255 caractères.'
    }

    if (!form.prix) {
      errors.prix = 'Le prix est requis.'
    } else if (parseFloat(form.prix) < 0) {
      errors.prix = 'Le prix doit être supérieur ou égal à 0.'
    }

    if (!form.credits_alloues) {
      errors.credits_alloues = 'Les crédits alloués sont requis.'
    } else if (!Number.isInteger(Number(form.credits_alloues)) || parseInt(form.credits_alloues) < 0) {
      errors.credits_alloues = 'Les crédits doivent être un entier ≥ 0.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save handler
  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    setSaveError('')
    try {
      const payload = {
        nom_plan: form.nom_plan.trim(),
        prix: parseFloat(form.prix),
        credits_alloues: parseInt(form.credits_alloues),
        is_active: form.is_active,
      }

      if (editingPlan) {
        await apiPut(`/admin/plans/${editingPlan.id}`, payload)
      } else {
        await apiPost('/admin/plans', payload)
      }

      setShowForm(false)
      await refetch()
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : "Erreur lors de l'enregistrement."
      setSaveError(message)
    } finally {
      setSaving(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement des plans.
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
        title="Plans SaaS"
        subtitle="Gérez les plans d'abonnement de la plateforme"
        action={
          <button
            onClick={openCreateForm}
            className="bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors"
          >
            + Nouveau plan
          </button>
        }
      />

      {/* Plans table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Nom</th>
              <th className="text-left px-6 py-3 font-medium">Prix</th>
              <th className="text-left px-6 py-3 font-medium">Crédits/mois</th>
              <th className="text-left px-6 py-3 font-medium">Statut</th>
              <th className="text-right px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4 font-semibold text-navy">
                  {plan.nom_plan}
                </td>
                <td className="px-6 py-4 text-text-muted">
                  {plan.prix} MAD/mois
                </td>
                <td className="px-6 py-4 font-medium text-text">
                  {plan.credits_alloues} crédits
                </td>
                <td className="px-6 py-4">
                  {plan.is_active ? (
                    <span className="bg-green-100 text-green-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      Actif
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      Inactif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => openEditForm(plan)}
                      className="border border-navy text-navy text-xs px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggleActive(plan)}
                      disabled={togglingId === plan.id}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        plan.is_active
                          ? 'border border-gray-300 text-gray-500 hover:border-gray-400'
                          : 'border border-green-500 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {plan.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-text-muted text-sm">
                  Aucun plan trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="font-semibold text-navy text-lg mb-4">
              {editingPlan ? 'Modifier le plan' : 'Nouveau plan'}
            </h2>

            <div className="space-y-4">
              {/* nom_plan */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Nom du plan *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Professional"
                  value={form.nom_plan}
                  onChange={(e) => setForm((p) => ({ ...p, nom_plan: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                {formErrors.nom_plan && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.nom_plan}</p>
                )}
              </div>

              {/* prix */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Prix (MAD/mois) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.prix}
                  onChange={(e) => setForm((p) => ({ ...p, prix: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                {formErrors.prix && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.prix}</p>
                )}
              </div>

              {/* credits_alloues */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Crédits alloués par mois *
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.credits_alloues}
                  onChange={(e) => setForm((p) => ({ ...p, credits_alloues: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                {formErrors.credits_alloues && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.credits_alloues}</p>
                )}
              </div>

              {/* is_active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-border text-navy focus:ring-navy"
                />
                <span className="text-sm text-text">Plan actif</span>
              </label>
            </div>

            {/* Save error */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mt-3">
                {saveError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-border text-text px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
