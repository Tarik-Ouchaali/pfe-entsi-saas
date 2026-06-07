'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiPost } from '@/lib/api'
import { ConformiteRapport } from '@/lib/types'
import { isAdminEntreprise } from '@/lib/auth'
import PageHeader from '@/components/layout/PageHeader'

export default function ConformitePage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [rapport, setRapport] = useState<ConformiteRapport | null>(null)
  const [noConformite, setNoConformite] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [launched, setLaunched] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiGet<ConformiteRapport>(`/projets/${id}/conformite`)
        setRapport(data)
      } catch (err: unknown) {
        const errorObj = err as { message?: string }
        if (
          errorObj.message?.includes('Aucune vérification') ||
          errorObj.message?.includes('effectuée')
        ) {
          setNoConformite(true)
        } else {
          setError(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleLancer = async () => {
    setLaunching(true)
    try {
      await apiPost(`/projets/${id}/conformite`)
      setLaunched(true)
    } catch {
      setError(true)
    } finally {
      setLaunching(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement de la conformité.
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

  const score = rapport?.score_global ?? 0
  const scoreColor =
    score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
  const scoreStroke =
    score >= 80 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626'
  const circumference = 251.2
  const offset = circumference - (score / 100) * circumference

  return (
    <div>
      <PageHeader
        title="Vérification de conformité"
        action={
          <Link
            href={`/projets/${id}`}
            className="border border-border text-text-muted px-4 py-2 rounded-lg text-sm hover:border-navy hover:text-navy transition-colors"
          >
            ← Retour au projet
          </Link>
        }
      />

      {/* No conformité state */}
      {noConformite && (
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p className="font-semibold text-navy text-lg">
            Aucune vérification effectuée
          </p>
          <p className="text-text-muted text-sm mt-2 max-w-sm mx-auto">
            Lancez la vérification pour matcher vos documents aux exigences du DAO.
          </p>

          {launched ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6 max-w-sm mx-auto">
              <p className="text-sm text-green-700">
                ✅ Vérification lancée ! Vous serez notifié par email.
              </p>
            </div>
          ) : (
            <button
              onClick={handleLancer}
              disabled={launching}
              className="mt-6 bg-gold text-white px-8 py-3 rounded-lg font-medium hover:bg-gold-hover disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto"
            >
              {launching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Lancement...
                </>
              ) : (
                'Lancer la vérification'
              )}
            </button>
          )}
        </div>
      )}

      {/* Rapport exists */}
      {rapport && (
        <>
          {/* Score header */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Score de conformité
                </p>
                <p className={`text-5xl font-bold mt-1 ${scoreColor}`}>
                  {rapport.score_global.toFixed(0)}%
                </p>
                <p className="text-sm text-text-muted mt-2">{rapport.resume}</p>
              </div>

              {/* SVG circle progress */}
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={scoreStroke}
                  strokeWidth="8"
                  strokeDasharray={circumference.toString()}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill={scoreStroke}
                >
                  {rapport.score_global.toFixed(0)}%
                </text>
              </svg>
            </div>

            {/* Re-vérification button for AdminEntreprise */}
            {isAdminEntreprise() && (
              <button
                onClick={handleLancer}
                disabled={launching}
                className="border border-navy text-navy px-4 py-2 rounded-lg text-sm mt-4 hover:bg-navy hover:text-white transition-colors"
              >
                {launching ? 'Lancement...' : '🔄 Re-vérifier'}
              </button>
            )}
          </div>

          {/* Checklists table */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mt-4">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-navy">
                Détail des exigences ({rapport.checklists.length})
              </h3>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-text-muted uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Exigence</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Document</th>
                  <th className="text-left px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rapport.checklists.map((checklist, idx) => (
                  <tr key={idx}>
                    <td className="px-5 py-4">
                      <p className="text-sm text-text">
                        {checklist.exigence.description}
                      </p>
                      {checklist.exigence.est_obligatoire && (
                        <span className="bg-yellow-50 text-yellow-700 text-xs px-1.5 rounded mt-1 inline-block">
                          ⭐ Obligatoire
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          checklist.exigence.type === 'administratif'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {checklist.exigence.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {checklist.document ? (
                        <div>
                          <p className="text-sm text-navy font-medium truncate max-w-[150px]">
                            {checklist.document.titre}
                          </p>
                          <p className="text-xs text-text-muted">
                            {checklist.document.categorie}
                          </p>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          checklist.statut === 'conforme'
                            ? 'bg-green-100 text-green-700'
                            : checklist.statut === 'manquant'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {checklist.statut === 'conforme'
                          ? '✓ Conforme'
                          : checklist.statut === 'manquant'
                            ? '✗ Manquant'
                            : '⚠ Expiré'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
