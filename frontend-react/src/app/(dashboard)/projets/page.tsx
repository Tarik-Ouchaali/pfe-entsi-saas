'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { apiGet } from '@/lib/api'
import { ProjetDAO, PaginatedResponse } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

const STATUT_FILTERS = [
  { label: 'Tous', value: '' },
  { label: 'Nouveau', value: 'Nouveau' },
  { label: 'En analyse', value: 'En_analyse' },
  { label: 'Terminés', value: 'Termine' },
  { label: 'Échoués', value: 'Echoue' },
]

function getStatutBadgeClass(statut: ProjetDAO['statut']): string {
  switch (statut) {
    case 'Nouveau':
      return 'bg-gray-100 text-gray-600'
    case 'En_analyse':
      return 'bg-yellow-100 text-yellow-700 animate-pulse'
    case 'Termine':
      return 'bg-green-100 text-green-700'
    case 'Echoue':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function formatStatutLabel(statut: ProjetDAO['statut']): string {
  switch (statut) {
    case 'Nouveau':
      return 'Nouveau'
    case 'En_analyse':
      return 'En analyse'
    case 'Termine':
      return 'Terminé'
    case 'Echoue':
      return 'Échoué'
    default:
      return statut
  }
}

export default function ProjetsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [projets, setProjets] = useState<PaginatedResponse<ProjetDAO> | null>(null)
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [page, setPage] = useState(1)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(false)

    let endpoint = `/projets?per_page=10&page=${page}`
    if (filterStatut !== '') {
      endpoint += `&statut=${filterStatut}`
    }

    apiGet<PaginatedResponse<ProjetDAO>>(endpoint)
      .then((data) => {
        setProjets(data)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [filterStatut, page])

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleFilterChange = (value: string) => {
    setFilterStatut(value)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Projets DAO"
        subtitle={`${projets?.total ?? 0} projet(s)`}
        action={
          <Link
            href="/projets/nouveau"
            className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
          >
            + Nouveau projet
          </Link>
        }
      />

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUT_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filterStatut === f.value
                ? 'bg-navy text-white'
                : 'bg-white border border-border text-text-muted hover:border-navy hover:text-navy'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700 text-sm font-medium">
            Erreur lors du chargement des projets.
          </p>
          <button onClick={refetch} className="mt-3 text-sm text-red-600 underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && projets && (
        <>
          {projets.data.length === 0 ? (
            /* Empty state */
            <div className="py-20 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-200 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              <p className="text-text-muted font-medium">Aucun projet trouvé</p>
              {filterStatut !== '' ? (
                <p className="text-xs text-text-muted mt-1">Essayez un autre filtre</p>
              ) : (
                <Link
                  href="/projets/nouveau"
                  className="text-navy text-sm underline mt-2 inline-block"
                >
                  Créer votre premier projet →
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Projets cards */}
              <div className="grid grid-cols-1 gap-4">
                {projets.data.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-border p-5 shadow-sm"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-navy text-base">{p.titre_projet}</p>
                        <p className="text-xs text-text-muted mt-1">
                          Créé le {new Date(p.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatutBadgeClass(p.statut)}`}
                      >
                        {formatStatutLabel(p.statut)}
                      </span>
                    </div>

                    {/* Middle row */}
                    <div className="mt-3 flex items-center gap-4 text-sm text-text-muted">
                      <span>📄 {p.documents?.[0]?.nom_fichier ?? 'Aucun document'}</span>
                    </div>

                    {/* Bottom row */}
                    <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                      <Link
                        href={`/projets/${p.id}`}
                        className="bg-navy text-white text-xs px-3 py-1.5 rounded-lg hover:bg-navy-light transition-colors"
                      >
                        Voir détails
                      </Link>

                      {p.statut === 'Termine' && (
                        <>
                          <Link
                            href={`/projets/${p.id}/conformite`}
                            className="border border-gold text-gold text-xs px-3 py-1.5 rounded-lg hover:bg-gold hover:text-white transition-colors"
                          >
                            Conformité
                          </Link>
                          <Link
                            href={`/projets/${p.id}/memoire`}
                            className="border border-navy text-navy text-xs px-3 py-1.5 rounded-lg hover:bg-navy hover:text-white transition-colors"
                          >
                            Mémoire
                          </Link>
                        </>
                      )}

                      {p.statut === 'Echoue' && (
                        <span className="text-xs text-red-500 italic">Analyse échouée</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {projets.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      page === 1
                        ? 'opacity-40 cursor-not-allowed border border-border text-text-muted'
                        : 'border border-border text-text hover:border-navy hover:text-navy'
                    }`}
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-text-muted">
                    {page} / {projets.last_page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === projets.last_page}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      page === projets.last_page
                        ? 'opacity-40 cursor-not-allowed border border-border text-text-muted'
                        : 'border border-border text-text hover:border-navy hover:text-navy'
                    }`}
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
