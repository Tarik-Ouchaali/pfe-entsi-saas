'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiPost } from '@/lib/api'
import { MemoireTechnique } from '@/lib/types'
import { isAdminEntreprise } from '@/lib/auth'
import PageHeader from '@/components/layout/PageHeader'

export default function MemoirePage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [memoire, setMemoire] = useState<MemoireTechnique | null>(null)
  const [noMemoire, setNoMemoire] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [creditsError, setCreditsError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiGet<{ memoire: MemoireTechnique }>(`/projets/${id}/memoire`)
        setMemoire(data.memoire)
      } catch (err: unknown) {
        const errorObj = err as { message?: string }
        if (errorObj.message?.includes('Aucun mémoire')) {
          setNoMemoire(true)
        } else {
          setError(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleGenerer = async () => {
    setGenerating(true)
    setCreditsError(false)
    try {
      await apiPost(`/projets/${id}/memoire`)
      setGenerated(true)
    } catch (err: unknown) {
      const errorObj = err as { credits_manquants?: number }
      if (errorObj.credits_manquants !== undefined) {
        setCreditsError(true)
      } else {
        setError(true)
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerer = async () => {
    try {
      await apiPost(`/projets/${id}/memoire/regenerer`)
      setMemoire((prev) =>
        prev ? { ...prev, statut: 'En_generation' as const } : prev
      )
    } catch {
      setError(true)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('auth_token') // ← s7i7a
      const response = await fetch(`/api/projets/${id}/memoire/telecharger`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Erreur")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `memoire_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url) // ← cleanup
    } catch (err) {
      setError(true)
    }
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement du mémoire technique.
        </p>
        <Link
          href={`/projets/${id}`}
          className="mt-3 text-sm text-red-600 underline inline-block"
        >
          Retour au projet
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Mémoire technique"
        action={
          <Link
            href={`/projets/${id}`}
            className="border border-border text-text-muted px-4 py-2 rounded-lg text-sm hover:border-navy hover:text-navy transition-colors"
          >
            ← Retour au projet
          </Link>
        }
      />

      {/* No mémoire state */}
      {noMemoire && (
        <div className="bg-white rounded-xl border border-border p-10 text-center shadow-sm">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="font-semibold text-navy text-lg">Aucun mémoire généré</p>
          <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
            Générez votre mémoire technique personnalisé basé sur les exigences du DAO.
          </p>

          {/* Credits info */}
          {isAdminEntreprise() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 max-w-sm mx-auto">
              <p className="text-sm text-blue-700">
                2 crédits seront consommés pour cette génération.
              </p>
            </div>
          )}

          {/* Credits error */}
          {creditsError && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3 max-w-sm mx-auto">
              <p className="text-sm text-orange-700 font-medium">
                Crédits insuffisants pour générer le mémoire.
              </p>
              <Link
                href="/credits"
                className="text-gold underline text-sm mt-1 block"
              >
                Acheter des crédits →
              </Link>
            </div>
          )}

          {/* Generated success */}
          {generated ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6 max-w-sm mx-auto">
              <p className="text-sm text-green-700">
                Génération lancée ! Vous serez notifié par email.
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerer}
              disabled={generating}
              className="mt-6 bg-navy text-white px-8 py-3 rounded-lg font-medium hover:bg-navy-light disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Génération en cours...
                </>
              ) : (
                'Générer le mémoire technique'
              )}
            </button>
          )}
        </div>
      )}

      {/* Mémoire exists */}
      {memoire && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center">
              <h3 className="font-semibold text-navy">Mémoire technique</h3>
              <span
                className={`ml-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${memoire.statut === 'En_generation'
                  ? 'bg-yellow-100 text-yellow-700 animate-pulse'
                  : memoire.statut === 'Termine'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  }`}
              >
                {memoire.statut === 'En_generation'
                  ? 'En génération...'
                  : memoire.statut === 'Termine'
                    ? 'Prêt'
                    : 'Échec'}
              </span>
            </div>

            {memoire.statut === 'Termine' && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="bg-gold text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-hover transition-colors"
                >
                  Télécharger PDF
                </button>
                {isAdminEntreprise() && (
                  <button
                    onClick={handleRegenerer}
                    className="border border-navy text-navy px-4 py-2 rounded-lg text-sm hover:bg-navy hover:text-white transition-colors"
                  >
                    Régénérer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* En génération */}
            {memoire.statut === 'En_generation' && (
              <div className="py-12 text-center">
                <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-text-muted mt-4 text-sm">Génération en cours...</p>
              </div>
            )}

            {/* Terminé */}
            {memoire.statut === 'Termine' && (
              <>
                <p className="text-xs text-text-muted mb-4">
                  Généré le{' '}
                  {new Date(memoire.date_generation!).toLocaleDateString('fr-FR')}
                </p>
                <pre className="whitespace-pre-wrap text-sm text-text leading-relaxed bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto font-sans">
                  {memoire.contenu}
                </pre>
              </>
            )}

            {/* Échoué */}
            {memoire.statut === 'Echoue' && (
              <div className="py-8 text-center">
                <p className="text-red-600 text-sm">
                  La génération a échoué. 2 crédits ont été remboursés automatiquement.
                </p>
                <button
                  onClick={handleGenerer}
                  className="mt-4 bg-navy text-white px-6 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
