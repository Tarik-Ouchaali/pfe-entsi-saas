'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiUpload } from '@/lib/api'
import { isAdminEntreprise } from '@/lib/auth'
import PageHeader from '@/components/layout/PageHeader'

export default function NouveauProjetPage() {
  const [form, setForm] = useState({ titre_projet: '' })
  const [fichier, setFichier] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [creditsError, setCreditsError] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!form.titre_projet.trim()) {
      newErrors.titre_projet = 'Le titre est requis.'
    } else if (form.titre_projet.trim().length < 3) {
      newErrors.titre_projet = 'Le titre doit contenir au moins 3 caractères.'
    } else if (form.titre_projet.length > 255) {
      newErrors.titre_projet = 'Le titre ne doit pas dépasser 255 caractères.'
    }

    if (!fichier) {
      newErrors.fichier = 'Le fichier PDF est requis.'
    } else if (fichier.type !== 'application/pdf') {
      newErrors.fichier = 'Le fichier doit être un PDF.'
    } else if (fichier.size > 50 * 1024 * 1024) {
      newErrors.fichier = 'Le fichier ne doit pas dépasser 50 MB.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setCreditsError(false)

    if (!validate()) return

    setLoading(true)

    const formData = new FormData()
    formData.append('titre_projet', form.titre_projet.trim())
    formData.append('fichier', fichier!)

    try {
      await apiUpload('/projets', formData)
      setSuccess(true)
      setTimeout(() => router.push('/projets'), 2000)
    } catch (err: unknown) {
      const error = err as Record<string, unknown>
      if (error.credits_manquants !== undefined) {
        setCreditsError(true)
      } else if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors as Record<string, unknown>).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : String(val)
        })
        setErrors(fieldErrors)
      } else {
        setGeneralError(
          (error.message as string) ?? 'Une erreur est survenue.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setFichier(file)
      setErrors((prev) => {
        const next = { ...prev }
        delete next.fichier
        return next
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFichier(file)
    if (file) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.fichier
        return next
      })
    }
  }

  // Success state
  if (success) {
    return (
      <div>
        <PageHeader
          title="Nouveau projet DAO"
          subtitle="Uploadez votre dossier d'appel d'offres pour une analyse IA"
          action={
            <Link
              href="/projets"
              className="border border-border text-text-muted px-4 py-2 rounded-lg text-sm hover:border-navy hover:text-navy transition-colors"
            >
              ← Retour
            </Link>
          }
        />
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
          <svg
            className="w-12 h-12 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="font-semibold text-navy text-lg">Projet créé avec succès !</h2>
          <p className="text-text-muted text-sm mt-2">
            Votre DAO est en cours d&apos;analyse. Vous serez notifié par email.
          </p>
          <Link
            href="/projets"
            className="bg-navy text-white mt-6 inline-block px-6 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Voir mes projets →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Nouveau projet DAO"
        subtitle="Uploadez votre dossier d'appel d'offres pour une analyse IA"
        action={
          <Link
            href="/projets"
            className="border border-border text-text-muted px-4 py-2 rounded-lg text-sm hover:border-navy hover:text-navy transition-colors"
          >
            ← Retour
          </Link>
        }
      />

      {/* Credits info box — AdminEntreprise only */}
      {isAdminEntreprise() && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <svg
              className="text-blue-500 w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-blue-700">
              1 crédit sera consommé pour cette analyse.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-border p-6 shadow-sm max-w-2xl mx-auto"
      >
        {/* Field 1 — Titre projet */}
        <div className="mb-5">
          <label htmlFor="titre_projet" className="block text-sm font-medium text-text mb-1.5">
            Titre du projet *
          </label>
          <input
            id="titre_projet"
            type="text"
            placeholder="Ex: Construction route nationale N2 — Lot 3"
            value={form.titre_projet}
            onChange={(e) => {
              setForm({ ...form, titre_projet: e.target.value })
              if (errors.titre_projet) {
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.titre_projet
                  return next
                })
              }
            }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
              errors.titre_projet
                ? 'border-red-400 focus:border-red-500'
                : 'border-border focus:border-navy'
            }`}
          />
          {errors.titre_projet && (
            <p className="text-xs text-red-500 mt-1">{errors.titre_projet}</p>
          )}
        </div>

        {/* Field 2 — Fichier PDF */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text mb-1.5">
            Dossier DAO (PDF) *
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              fichier
                ? 'border-green-400'
                : errors.fichier
                  ? 'border-red-400'
                  : 'border-border hover:border-navy'
            }`}
          >
            {fichier ? (
              <>
                <svg
                  className="w-10 h-10 mx-auto text-green-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-navy">{fichier.name}</p>
                <p className="text-xs text-text-muted mt-1">
                  {(fichier.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-gold underline mt-2">Changer de fichier</p>
              </>
            ) : (
              <>
                <svg
                  className="w-10 h-10 mx-auto text-text-muted mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-text-muted">
                  Glissez votre PDF ici ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-text-muted mt-1">PDF uniquement — max 50 MB</p>
              </>
            )}
          </div>

          {errors.fichier && (
            <p className="text-xs text-red-500 mt-1">{errors.fichier}</p>
          )}
        </div>

        {/* General error alert */}
        {generalError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-red-700">{generalError}</p>
          </div>
        )}

        {/* Credits error alert */}
        {creditsError && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-orange-700 font-medium">
              Crédits insuffisants pour lancer une analyse.
            </p>
            <Link href="/credits" className="text-sm text-gold underline mt-1 block">
              Acheter des crédits →
            </Link>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-navy text-white py-3 rounded-lg font-medium hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Lancer l\'analyse IA'
          )}
        </button>
      </form>
    </div>
  )
}
