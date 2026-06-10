'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { apiGet, apiDelete } from '@/lib/api'
import { DocumentBibliotheque, PaginatedResponse } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

const CATEGORIE_FILTERS = [
  { label: 'Tous', value: '' },
  { label: 'Administratif', value: 'administratif' },
  { label: 'Technique', value: 'technique' },
  { label: 'CV', value: 'cv' },
  { label: 'Référence', value: 'reference' },
  { label: 'Autre', value: 'autre' },
]

function getCategorieBadgeClass(categorie: DocumentBibliotheque['categorie']): string {
  switch (categorie) {
    case 'administratif':
      return 'bg-blue-100 text-blue-700'
    case 'technique':
      return 'bg-purple-100 text-purple-700'
    case 'cv':
      return 'bg-green-100 text-green-700'
    case 'reference':
      return 'bg-yellow-100 text-yellow-700'
    case 'autre':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getExpirationInfo(dateExpiration: string | null): {
  text: string
  className: string
} | null {
  if (!dateExpiration) return null
  const expDate = new Date(dateExpiration)
  const now = new Date()
  const diffMs = expDate.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  const formatted = expDate.toLocaleDateString('fr-FR')

  if (diffMs < 0) {
    return { text: `Expiré le ${formatted}`, className: 'text-red-500' }
  }
  if (diffDays <= 7) {
    return { text: `Expire le ${formatted}`, className: 'text-orange-500' }
  }
  return { text: `Expire le ${formatted}`, className: 'text-text-muted' }
}

export default function BibliothequePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [documents, setDocuments] = useState<PaginatedResponse<DocumentBibliotheque> | null>(null)
  const [filterCategorie, setFilterCategorie] = useState<string>('')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [expirations, setExpirations] = useState<DocumentBibliotheque[]>([])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(false)

    let endpoint = `/bibliotheque?per_page=12&page=${page}`
    if (filterCategorie !== '') {
      endpoint += `&categorie=${filterCategorie}`
    }

    Promise.all([
      apiGet<PaginatedResponse<DocumentBibliotheque>>(endpoint),
      apiGet<DocumentBibliotheque[]>('/bibliotheque/expirations'),
    ])
      .then(([docsData, expData]) => {
        setDocuments(docsData)
        setExpirations(expData)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [filterCategorie, page])

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleFilterChange = (value: string) => {
    setFilterCategorie(value)
    setPage(1)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await apiDelete(`/bibliotheque/${id}`)
      setShowDeleteConfirm(null)
      setDeletingId(null)
      refetch()
    } catch {
      setDeletingId(null)
      setError(true)
    }
  }

  return (
    <div>
      <PageHeader
        title="Bibliothèque documentaire"
        subtitle={`${documents?.total ?? 0} document(s)`}
        action={
          <Link
            href="/bibliotheque/upload"
            className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
          >
            + Ajouter un document
          </Link>
        }
      />

      {/* Expiration alert */}
      {!loading && expirations.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="font-medium text-orange-700 text-sm">
                {expirations.length} document(s) expirent dans 7 jours
              </p>
              <div className="mt-1 space-y-0.5">
                {expirations.map((doc) => (
                  <p key={doc.id} className="text-xs text-orange-600">
                    {doc.titre} — expire le{' '}
                    {new Date(doc.date_expiration!).toLocaleDateString('fr-FR')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filterCategorie === f.value
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700 text-sm font-medium">
            Erreur lors du chargement de la bibliothèque.
          </p>
          <button onClick={refetch} className="mt-3 text-sm text-red-600 underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && documents && (
        <>
          {documents.data.length === 0 ? (
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-text-muted font-medium">Aucun document trouvé</p>
              {filterCategorie !== '' ? (
                <p className="text-xs text-text-muted mt-1">Essayez un autre filtre</p>
              ) : (
                <Link
                  href="/bibliotheque/upload"
                  className="text-navy text-sm underline mt-2 inline-block"
                >
                  Ajouter votre premier document →
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Documents grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.data.map((doc) => {
                  const expInfo = getExpirationInfo(doc.date_expiration)

                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-xl border border-border p-5 shadow-sm"
                    >
                      {/* Top row */}
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategorieBadgeClass(doc.categorie)}`}
                        >
                          {doc.categorie}
                        </span>
                        <span className="bg-navy/10 text-navy text-xs px-2 py-0.5 rounded-full">
                          v{doc.version}
                        </span>
                      </div>

                      {/* Title */}
                      <p className="mt-3 font-semibold text-navy text-sm truncate">
                        {doc.titre}
                      </p>

                      {/* Meta */}
                      <div className="mt-2 space-y-1 text-xs text-text-muted">
                        <p>
                          Uploadé le{' '}
                          {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                        </p>
                        {expInfo && (
                          <p className={expInfo.className}>{expInfo.text}</p>
                        )}
                      </div>

                      {/* Bottom row */}
                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <Link
                          href={`/bibliotheque/upload?groupe=${doc.document_groupe_id}`}
                          className="text-xs text-gold hover:underline"
                        >
                          Nouvelle version
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(doc.id)}
                          disabled={deletingId === doc.id}
                          className="text-red-400 hover:text-red-600 p-1 disabled:opacity-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {documents.last_page > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${page === 1
                        ? 'opacity-40 cursor-not-allowed border border-border text-text-muted'
                        : 'border border-border text-text hover:border-navy hover:text-navy'
                      }`}
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-text-muted">
                    {page} / {documents.last_page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === documents.last_page}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${page === documents.last_page
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

      {/* Delete confirmation modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="font-semibold text-navy text-lg">Supprimer ce document ?</p>
            <p className="text-sm text-text-muted mt-2">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 border border-border text-text px-4 py-2 rounded-lg text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {deletingId === showDeleteConfirm ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
