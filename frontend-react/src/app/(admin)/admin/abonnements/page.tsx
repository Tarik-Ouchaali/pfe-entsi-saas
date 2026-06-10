'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { isSuperAdmin } from '@/lib/auth'
import { AdminAbonnement, PaginatedResponse } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function AbonnementsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [abonnements, setAbonnements] = useState<PaginatedResponse<AdminAbonnement> | null>(null)
  const [filterStatut, setFilterStatut] = useState<string>('actif')
  const [filterExpiring, setFilterExpiring] = useState(false)
  const [page, setPage] = useState(1)
  const [renouvelingId, setRenouvelingId] = useState<number | null>(null)
  const [renewSuccess, setRenewSuccess] = useState<number | null>(null)

  // Access guard
  useEffect(() => {
    if (!isSuperAdmin()) router.replace('/dashboard')
  }, [router])

  // Fetch abonnements
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      let url = `/admin/abonnements?page=${page}&per_page=15`
      if (filterStatut !== 'all') url += `&statut=${filterStatut}`
      if (filterExpiring) url += `&expiring_soon=1`
      const data = await apiGet<PaginatedResponse<AdminAbonnement>>(url)
      setAbonnements(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filterStatut, filterExpiring, page])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Handle filter changes — always reset page
  const handleFilterStatut = (val: string) => {
    setFilterStatut(val)
    setPage(1)
  }

  const handleFilterExpiring = () => {
    setFilterExpiring(!filterExpiring)
    setPage(1)
  }

  // Renouveler handler
  const handleRenouveler = async (id: number) => {
    setRenouvelingId(id)
    try {
      await apiPost(`/admin/abonnements/${id}/renouveler`)
      setRenewSuccess(id)
      setTimeout(() => {
        setRenewSuccess(null)
        refetch()
      }, 2000)
    } catch {
      setError(true)
    } finally {
      setRenouvelingId(null)
    }
  }

  // Statut filter pills
  const statutFilters = [
    { label: 'Actifs', value: 'actif' },
    { label: 'Expirés', value: 'expire' },
    { label: 'Tous', value: 'all' },
  ]

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-20 bg-gray-200 rounded-full" />
          ))}
        </div>
        <div className="h-72 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement des abonnements.
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
        title="Abonnements"
        subtitle="Suivi et gestion des abonnements entreprises"
      />

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap mb-6">
        {statutFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterStatut(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatut === f.value
              ? 'bg-navy text-white'
              : 'bg-white border border-border text-text-muted hover:border-navy'
              }`}
          >
            {f.label}
          </button>
        ))}

        <button
          onClick={handleFilterExpiring}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterExpiring
            ? 'bg-orange-100 text-orange-700 border border-orange-300'
            : 'bg-white border border-border text-text-muted hover:border-navy'
            }`}
        >
          Expirant bientôt
        </button>
      </div>

      {/* Abonnements table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Entreprise</th>
              <th className="text-left px-6 py-3 font-medium">Plan</th>
              <th className="text-left px-6 py-3 font-medium">Date début</th>
              <th className="text-left px-6 py-3 font-medium">Date fin</th>
              <th className="text-left px-6 py-3 font-medium">Statut</th>
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
                  <td className="px-6 py-4 text-text-muted">
                    {a.plan_saa_s.nom_plan}
                  </td>
                  <td className="px-6 py-4 text-xs text-text-muted">
                    {new Date(a.date_debut).toLocaleDateString('fr-FR')}
                  </td>
                  <td className={`px-6 py-4 text-xs ${dateFinColor}`}>
                    {new Date(a.date_fin).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    {a.statut === 'actif' ? (
                      <span className="bg-green-100 text-green-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Actif
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Expiré
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text-muted text-xs">
                    {a.next_plan?.nom_plan ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {renewSuccess === a.id ? (
                      <span className="text-green-600 text-xs font-medium">
                        Renouvelé
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRenouveler(a.id)}
                        disabled={renouvelingId === a.id}
                        className="bg-navy text-white text-xs px-3 py-1.5 rounded-lg hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {renouvelingId === a.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Renouvellement...
                          </span>
                        ) : (
                          'Renouveler'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {abonnements?.data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-text-muted text-sm">
                  Aucun abonnement trouvé.
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
    </>
  )
}
