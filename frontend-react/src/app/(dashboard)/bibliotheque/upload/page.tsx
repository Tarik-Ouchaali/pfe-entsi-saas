'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiUpload } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'

export default function BibliothequeUploadPage() {
  const searchParams = useSearchParams()
  const groupeId = searchParams.get('groupe')
  const router = useRouter()

  const [form, setForm] = useState({
    titre: '',
    categorie: '',
    date_expiration: '',
  })
  const [fichier, setFichier] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Titre (only if new document)
    if (!groupeId) {
      if (!form.titre.trim()) {
        newErrors.titre = 'Le titre est requis.'
      } else if (form.titre.trim().length < 3) {
        newErrors.titre = 'Le titre doit contenir au moins 3 caractères.'
      } else if (form.titre.length > 255) {
        newErrors.titre = 'Le titre ne doit pas dépasser 255 caractères.'
      }
    }

    // Catégorie (only if new document)
    if (!groupeId && !form.categorie) {
      newErrors.categorie = 'La catégorie est requise.'
    }

    // Fichier
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

    if (!validate()) return

    setLoading(true)

    const formData = new FormData()
    formData.append('fichier', fichier!)

    if (!groupeId) {
      // New document
      formData.append('titre', form.titre.trim())
      formData.append('categorie', form.categorie)
      if (form.date_expiration) {
        formData.append('date_expiration', form.date_expiration)
      }
    } else {
      // New version
      if (form.date_expiration) {
        formData.append('date_expiration', form.date_expiration)
      }
    }

    try {
      if (!groupeId) {
        await apiUpload('/bibliotheque', formData)
      } else {
        await apiUpload(`/bibliotheque/${groupeId}/version`, formData)
      }
      setSuccess(true)
      setTimeout(() => router.push('/bibliotheque'), 2000)
    } catch (err: unknown) {
      const error = err as Record<string, unknown>
      if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.entries(error.errors as Record<string, unknown>).forEach(
          ([key, val]) => {
            fieldErrors[key] = Array.isArray(val) ? val[0] : String(val)
          }
        )
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
          title={groupeId ? 'Nouvelle version du document' : 'Ajouter un document'}
          subtitle={
            groupeId
              ? 'Uploadez une nouvelle version — l\'ancienne sera archivée automatiquement'
              : 'Ajoutez un document de référence à votre bibliothèque'
          }
          action={
            <Link
              href="/bibliotheque"
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
          <h2 className="font-semibold text-navy text-lg">
            {groupeId
              ? 'Nouvelle version du document enregistrée avec succès !'
              : 'Document ajouté avec succès !'}
          </h2>
          <p className="text-text-muted text-sm mt-2">Redirection en cours...</p>
          <Link
            href="/bibliotheque"
            className="bg-navy text-white mt-6 inline-block px-6 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
          >
            Voir la bibliothèque →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={groupeId ? 'Nouvelle version du document' : 'Ajouter un document'}
        subtitle={
          groupeId
            ? 'Uploadez une nouvelle version — l\'ancienne sera archivée automatiquement'
            : 'Ajoutez un document de référence à votre bibliothèque'
        }
        action={
          <Link
            href="/bibliotheque"
            className="border border-border text-text-muted px-4 py-2 rounded-lg text-sm hover:border-navy hover:text-navy transition-colors"
          >
            ← Retour
          </Link>
        }
      />

      {/* Version mode info box */}
      {groupeId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-blue-500 flex-shrink-0"
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
              L&apos;ancienne version sera archivée. La nouvelle deviendra la version
              courante.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-border p-6 shadow-sm max-w-2xl mx-auto"
      >
        {/* Field 1 — Titre (hidden if groupeId) */}
        {!groupeId && (
          <div className="mb-5">
            <label
              htmlFor="titre"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Titre du document *
            </label>
            <input
              id="titre"
              type="text"
              placeholder="Ex: Attestation fiscale 2024"
              value={form.titre}
              onChange={(e) => {
                setForm({ ...form, titre: e.target.value })
                if (errors.titre) {
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.titre
                    return next
                  })
                }
              }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
                errors.titre
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-border focus:border-navy'
              }`}
            />
            {errors.titre && (
              <p className="text-xs text-red-500 mt-1">{errors.titre}</p>
            )}
          </div>
        )}

        {/* Field 2 — Catégorie (hidden if groupeId) */}
        {!groupeId && (
          <div className="mb-5">
            <label
              htmlFor="categorie"
              className="block text-sm font-medium text-text mb-1.5"
            >
              Catégorie *
            </label>
            <select
              id="categorie"
              value={form.categorie}
              onChange={(e) => {
                setForm({ ...form, categorie: e.target.value })
                if (errors.categorie) {
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.categorie
                    return next
                  })
                }
              }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
                errors.categorie
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-border focus:border-navy'
              }`}
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="administratif">Administratif</option>
              <option value="technique">Technique</option>
              <option value="cv">CV</option>
              <option value="reference">Référence</option>
              <option value="autre">Autre</option>
            </select>
            {errors.categorie && (
              <p className="text-xs text-red-500 mt-1">{errors.categorie}</p>
            )}
          </div>
        )}

        {/* Field 3 — Date d'expiration (always shown) */}
        <div className="mb-5">
          <label
            htmlFor="date_expiration"
            className="block text-sm font-medium text-text mb-1.5"
          >
            Date d&apos;expiration (optionnel)
          </label>
          <input
            id="date_expiration"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={form.date_expiration}
            onChange={(e) =>
              setForm({ ...form, date_expiration: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none transition-colors focus:border-navy"
          />
          <p className="text-xs text-text-muted mt-1">
            Laissez vide si le document n&apos;expire pas
          </p>
        </div>

        {/* Field 4 — Fichier PDF */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text mb-1.5">
            Fichier PDF *
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
                <p className="text-xs text-gold underline mt-2">
                  Changer de fichier
                </p>
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
                <p className="text-xs text-text-muted mt-1">
                  PDF uniquement — max 50 MB
                </p>
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
          ) : groupeId ? (
            'Enregistrer la nouvelle version'
          ) : (
            'Enregistrer le document'
          )}
        </button>
      </form>
    </div>
  )
}
