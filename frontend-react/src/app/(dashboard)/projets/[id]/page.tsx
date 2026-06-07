'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiDelete } from '@/lib/api'
import { ProjetDAO, ExigenceDAO } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

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

export default function ProjetDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [projet, setProjet] = useState<ProjetDAO | null>(null)
  const [exigences, setExigences] = useState<ExigenceDAO[]>([])
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiGet<ProjetDAO>(`/projets/${id}`)
        setProjet(data)

        if (data.statut === 'Termine') {
          const resultats = await apiGet<{ resultat?: { exigences?: ExigenceDAO[] } }>(
            `/projets/${id}/resultats`
          )
          setExigences(resultats.resultat?.exigences ?? [])
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiDelete(`/projets/${id}`)
      router.push('/projets')
    } catch {
      setError(true)
      setDeleting(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-16 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error || !projet) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement du projet.
        </p>
        <Link href="/projets" className="mt-3 text-sm text-red-600 underline inline-block">
          Retour aux projets
        </Link>
      </div>
    )
  }

  const doc = projet.documents?.[0]

  return (
    <div>
      <PageHeader
        title={projet.titre_projet ?? 'Chargement...'}
        action={
          <Link
            href="/projets"
            className="border border-border text-text-muted px-4 py-2 rounded-lg text-sm hover:border-navy hover:text-navy transition-colors"
          >
            ← Retour aux projets
          </Link>
        }
      />

      {/* Statut banner */}
      <div className="mt-4 mb-6">
        {projet.statut === 'Nouveau' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">
              ⏳ Projet créé — en attente d&apos;analyse
            </span>
          </div>
        )}
        {projet.statut === 'En_analyse' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-yellow-700">
              Analyse en cours... Vous serez notifié par email.
            </span>
          </div>
        )}
        {projet.statut === 'Termine' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-sm text-green-700">✅ Analyse terminée</span>
          </div>
        )}
        {projet.statut === 'Echoue' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-sm text-red-700">
              ❌ Analyse échouée — un crédit a été remboursé automatiquement
            </span>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 — Informations générales */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-navy mb-3">Informations</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Titre</span>
              <span className="font-medium text-text">{projet.titre_projet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Créé le</span>
              <span className="text-text-muted">
                {new Date(projet.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Statut</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatutBadgeClass(projet.statut)}`}
              >
                {formatStatutLabel(projet.statut)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 — Document */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-navy mb-3">Document uploadé</h3>
          {doc ? (
            <div>
              <svg
                className="w-8 h-8 text-red-500 mb-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                <path d="M8 12h8v2H8zm0 4h8v2H8zm0-8h3v2H8z" />
              </svg>
              <p className="text-sm font-medium text-navy truncate">{doc.nom_fichier}</p>
              <p className="text-xs text-text-muted mt-1">
                {(doc.taille / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Aucun document</p>
          )}
        </div>

        {/* Card 3 — Actions */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-navy mb-3">Actions</h3>

          {projet.statut === 'Termine' && (
            <>
              <Link
                href={`/projets/${id}/conformite`}
                className="w-full block text-center bg-gold text-white rounded-lg py-2 text-sm mb-2 hover:bg-gold-hover transition-colors"
              >
                Vérifier la conformité
              </Link>
              <Link
                href={`/projets/${id}/memoire`}
                className="w-full block text-center border border-navy text-navy rounded-lg py-2 text-sm hover:bg-navy hover:text-white transition-colors"
              >
                Générer le mémoire
              </Link>
            </>
          )}

          {projet.statut === 'En_analyse' && (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 rounded-lg py-2 text-sm cursor-not-allowed"
            >
              Analyse en cours...
            </button>
          )}

          {(projet.statut === 'Echoue' || projet.statut === 'Nouveau') && (
            <Link
              href="/projets/nouveau"
              className="w-full block text-center bg-navy text-white rounded-lg py-2 text-sm hover:bg-navy-light transition-colors"
            >
              Créer un nouveau projet
            </Link>
          )}

          {projet.statut !== 'En_analyse' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-red-500 text-sm underline mt-4 hover:text-red-700"
            >
              Supprimer ce projet
            </button>
          )}
        </div>
      </div>

      {/* Résultats section */}
      {projet.statut === 'Termine' && (
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm mt-6">
          <h3 className="font-semibold text-navy mb-4">Résultats de l&apos;analyse</h3>

          {/* Résumé */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-text leading-relaxed">
            {projet.resultat_analyse?.resume_global ?? 'Aucun résumé disponible'}
          </div>

          {/* Exigences */}
          {exigences.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-navy mb-2">
                Exigences extraites ({exigences.length})
              </p>
              <div className="space-y-2">
                {exigences.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        ex.type === 'administratif'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {ex.type}
                    </span>
                    {ex.est_obligatoire && <span className="text-xs">⭐</span>}
                    <span className="text-sm text-text flex-1">{ex.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="font-semibold text-navy text-lg">Supprimer ce projet ?</p>
            <p className="text-sm text-text-muted mt-2">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-border text-text px-4 py-2 rounded-lg text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
