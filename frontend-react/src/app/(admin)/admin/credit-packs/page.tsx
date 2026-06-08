'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { isSuperAdmin } from '@/lib/auth'
import { CreditPack } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function CreditPacksPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [packs, setPacks] = useState<CreditPack[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null)
  const [form, setForm] = useState({
    nom: '',
    credits: '',
    prix: '',
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

  // Fetch packs
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await apiGet<{ packs: CreditPack[] }>('/admin/credit-packs')
      setPacks(data.packs)
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
    setEditingPack(null)
    setForm({ nom: '', credits: '', prix: '', is_active: true })
    setFormErrors({})
    setSaveError('')
    setShowForm(true)
  }

  // Open edit form
  const openEditForm = (pack: CreditPack) => {
    setEditingPack(pack)
    setForm({
      nom: pack.nom,
      credits: String(pack.credits),
      prix: String(pack.prix),
      is_active: pack.is_active,
    })
    setFormErrors({})
    setSaveError('')
    setShowForm(true)
  }

  // Toggle active/inactive
  const handleToggleActive = async (pack: CreditPack) => {
    setTogglingId(pack.id)
    try {
      if (pack.is_active) {
        await apiDelete(`/admin/credit-packs/${pack.id}`)
      } else {
        await apiPut(`/admin/credit-packs/${pack.id}`, { is_active: true })
      }
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

    if (!form.nom.trim()) {
      errors.nom = 'Le nom du pack est requis.'
    } else if (form.nom.trim().length < 2) {
      errors.nom = 'Le nom doit contenir au moins 2 caractères.'
    } else if (form.nom.trim().length > 255) {
      errors.nom = 'Le nom ne peut pas dépasser 255 caractères.'
    }

    if (!form.credits) {
      errors.credits = 'Le nombre de crédits est requis.'
    } else if (!Number.isInteger(Number(form.credits)) || parseInt(form.credits) < 1) {
      errors.credits = 'Les crédits doivent être un entier ≥ 1.'
    }

    if (!form.prix) {
      errors.prix = 'Le prix est requis.'
    } else if (parseFloat(form.prix) < 0) {
      errors.prix = 'Le prix doit être supérieur ou égal à 0.'
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
        nom: form.nom.trim(),
        credits: parseInt(form.credits),
        prix: parseFloat(form.prix),
        is_active: form.is_active,
      }

      if (editingPack) {
        await apiPut(`/admin/credit-packs/${editingPack.id}`, payload)
      } else {
        await apiPost('/admin/credit-packs', payload)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement des packs.
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
        title="Credit Packs"
        subtitle="Gérez les packs de crédits disponibles à l'achat"
        action={
          <button
            onClick={openCreateForm}
            className="bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors"
          >
            + Nouveau pack
          </button>
        }
      />

      {/* Packs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="bg-white rounded-xl border border-border p-5 shadow-sm"
          >
            {/* Top row */}
            <div className="flex justify-between items-start">
              <p className="font-bold text-navy text-lg">{pack.nom}</p>
              {pack.is_active ? (
                <span className="bg-green-100 text-green-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Actif
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  Inactif
                </span>
              )}
            </div>

            {/* Credits count */}
            <p className="text-3xl font-bold text-gold mt-3">
              {pack.credits} crédits
            </p>

            {/* Prix */}
            <p className="text-text-muted text-sm mt-1">{pack.prix} MAD</p>

            {/* MAD/crédit — division by zero protected */}
            <p className="text-xs text-text-muted">
              {pack.credits > 0
                ? `${(pack.prix / pack.credits).toFixed(2)} MAD/crédit`
                : '—'}
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button
                onClick={() => openEditForm(pack)}
                className="border border-navy text-navy text-xs px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => handleToggleActive(pack)}
                disabled={togglingId === pack.id}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  pack.is_active
                    ? 'border border-gray-300 text-gray-500 hover:border-gray-400'
                    : 'border border-green-500 text-green-600 hover:bg-green-50'
                }`}
              >
                {pack.is_active ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        ))}

        {packs.length === 0 && (
          <div className="col-span-full text-center text-text-muted text-sm py-8">
            Aucun pack trouvé.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="font-semibold text-navy text-lg mb-4">
              {editingPack ? 'Modifier le pack' : 'Nouveau pack'}
            </h2>

            <div className="space-y-4">
              {/* nom */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Nom du pack *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pack 50"
                  value={form.nom}
                  onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                {formErrors.nom && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.nom}</p>
                )}
              </div>

              {/* credits */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Nombre de crédits *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.credits}
                  onChange={(e) => setForm((p) => ({ ...p, credits: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy transition-colors"
                />
                {formErrors.credits && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.credits}</p>
                )}
              </div>

              {/* prix */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Prix (MAD) *
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

              {/* is_active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-border text-navy focus:ring-navy"
                />
                <span className="text-sm text-text">Pack actif</span>
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
