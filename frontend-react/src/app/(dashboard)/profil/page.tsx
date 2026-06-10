'use client'

import { useState, useEffect } from 'react'
import { apiPut } from '@/lib/api'
import { getUser, saveAuth, getToken } from '@/lib/auth'
import { User } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null)

  const [formInfo, setFormInfo] = useState({ nom: '', prenom: '', email: '' })
  const [formPassword, setFormPassword] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [errorsInfo, setErrorsInfo] = useState<Record<string, string>>({})
  const [errorsPassword, setErrorsPassword] = useState<Record<string, string>>(
    {}
  )
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [successInfo, setSuccessInfo] = useState(false)
  const [successPassword, setSuccessPassword] = useState(false)
  const [generalErrorInfo, setGeneralErrorInfo] = useState('')
  const [generalErrorPassword, setGeneralErrorPassword] = useState('')

  // Init — read user from localStorage
  useEffect(() => {
    const u = getUser()
    setUser(u)
    setFormInfo({
      nom: u?.nom ?? '',
      prenom: u?.prenom ?? '',
      email: u?.email ?? '',
    })
  }, [])

  // Client-side validation — info form
  const validateInfo = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formInfo.prenom.trim()) {
      errors.prenom = 'Le prénom est requis.'
    } else if (formInfo.prenom.trim().length < 2) {
      errors.prenom = 'Le prénom doit contenir au moins 2 caractères.'
    } else if (formInfo.prenom.trim().length > 50) {
      errors.prenom = 'Le prénom ne doit pas dépasser 50 caractères.'
    }

    if (!formInfo.nom.trim()) {
      errors.nom = 'Le nom est requis.'
    } else if (formInfo.nom.trim().length < 2) {
      errors.nom = 'Le nom doit contenir au moins 2 caractères.'
    } else if (formInfo.nom.trim().length > 50) {
      errors.nom = 'Le nom ne doit pas dépasser 50 caractères.'
    }

    if (!formInfo.email.trim()) {
      errors.email = "L'adresse e-mail est requise."
    } else if (
      !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(
        formInfo.email
      )
    ) {
      errors.email = "Adresse e-mail invalide."
    }

    setErrorsInfo(errors)
    return Object.keys(errors).length === 0
  }

  // Client-side validation — password form
  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formPassword.current_password) {
      errors.current_password = 'Le mot de passe actuel est requis.'
    }

    if (!formPassword.password) {
      errors.password = 'Le nouveau mot de passe est requis.'
    } else if (formPassword.password.length < 8) {
      errors.password =
        'Min 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial.'
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-])[A-Za-z\d@$!%*?&.#^()_+\-]{8,}$/.test(
        formPassword.password
      )
    ) {
      errors.password =
        'Min 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial.'
    }

    if (!formPassword.password_confirmation) {
      errors.password_confirmation = 'La confirmation est requise.'
    } else if (formPassword.password_confirmation !== formPassword.password) {
      errors.password_confirmation = 'La confirmation ne correspond pas.'
    }

    setErrorsPassword(errors)
    return Object.keys(errors).length === 0
  }

  // Save personal info
  const handleSaveInfo = async () => {
    setGeneralErrorInfo('')
    setSuccessInfo(false)
    if (!validateInfo()) return

    setLoadingInfo(true)
    try {
      await apiPut('/auth/me', formInfo)
      const token = getToken()
      if (token && user) {
        saveAuth(token, { ...user, ...formInfo })
      }
      setUser(getUser())
      setSuccessInfo(true)
      setTimeout(() => setSuccessInfo(false), 3000)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Erreur lors de la mise à jour.'
      setGeneralErrorInfo(message)
    } finally {
      setLoadingInfo(false)
    }
  }

  // Save password
  const handleSavePassword = async () => {
    setGeneralErrorPassword('')
    setSuccessPassword(false)
    if (!validatePassword()) return

    setLoadingPassword(true)
    try {
      await apiPut('/auth/me', formPassword)
      setSuccessPassword(true)
      setFormPassword({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
      setTimeout(() => setSuccessPassword(false), 3000)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Erreur lors de la modification du mot de passe.'
      setGeneralErrorPassword(message)
    } finally {
      setLoadingPassword(false)
    }
  }

  // Loading state — user not yet loaded from localStorage
  if (!user)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    )

  // Role badge label
  const roleLabel =
    user.role === 'AdminEntreprise' ? 'Admin Entreprise' : 'Employé'
  const roleBadgeClass =
    user.role === 'AdminEntreprise'
      ? 'bg-navy text-white text-xs px-3 py-1 rounded-full'
      : 'bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full'

  return (
    <>
      <PageHeader
        title="Mon profil"
        subtitle="Gérez vos informations personnelles"
      />

      {/* Profile header card */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">
              {user.prenom?.[0]?.toUpperCase()}
              {user.nom?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-navy">
              {user.prenom} {user.nom}
            </p>
            <span className={`${roleBadgeClass} mt-1 inline-block`}>
              {roleLabel}
            </span>
            <p className="text-sm text-text-muted mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Form 1 — Informations personnelles */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-navy mb-4">
          Informations personnelles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Prénom *
            </label>
            <input
              type="text"
              value={formInfo.prenom}
              onChange={(e) =>
                setFormInfo({ ...formInfo, prenom: e.target.value })
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errorsInfo.prenom
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-border focus:border-navy'
                }`}
            />
            {errorsInfo.prenom && (
              <p className="text-xs text-red-600 mt-1">{errorsInfo.prenom}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={formInfo.nom}
              onChange={(e) =>
                setFormInfo({ ...formInfo, nom: e.target.value })
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errorsInfo.nom
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-border focus:border-navy'
                }`}
            />
            {errorsInfo.nom && (
              <p className="text-xs text-red-600 mt-1">{errorsInfo.nom}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-text mb-1">
            Adresse e-mail *
          </label>
          <input
            type="email"
            value={formInfo.email}
            onChange={(e) =>
              setFormInfo({ ...formInfo, email: e.target.value })
            }
            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errorsInfo.email
                ? 'border-red-300 focus:border-red-500'
                : 'border-border focus:border-navy'
              }`}
          />
          {errorsInfo.email && (
            <p className="text-xs text-red-600 mt-1">{errorsInfo.email}</p>
          )}
        </div>

        {successInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 mt-4">
            Informations mises à jour avec succès.
          </div>
        )}

        {generalErrorInfo && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mt-4">
            {generalErrorInfo}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleSaveInfo}
            disabled={loadingInfo}
            className="bg-navy text-white px-6 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingInfo ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Enregistrement...
              </span>
            ) : (
              'Enregistrer les modifications'
            )}
          </button>
        </div>
      </div>

      {/* Form 2 — Changer le mot de passe */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h2 className="font-semibold text-navy mb-4">
          Changer le mot de passe
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Mot de passe actuel *
            </label>
            <input
              type="password"
              value={formPassword.current_password}
              onChange={(e) =>
                setFormPassword({
                  ...formPassword,
                  current_password: e.target.value,
                })
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errorsPassword.current_password
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-border focus:border-navy'
                }`}
            />
            {errorsPassword.current_password && (
              <p className="text-xs text-red-600 mt-1">
                {errorsPassword.current_password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Nouveau mot de passe *
            </label>
            <input
              type="password"
              value={formPassword.password}
              onChange={(e) =>
                setFormPassword({
                  ...formPassword,
                  password: e.target.value,
                })
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errorsPassword.password
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-border focus:border-navy'
                }`}
            />
            <p className="text-xs text-text-muted mt-1">
              Min 8 caractères, avec majuscule, minuscule, chiffre et caractère
              spécial
            </p>
            {errorsPassword.password && (
              <p className="text-xs text-red-600 mt-1">
                {errorsPassword.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Confirmer le nouveau mot de passe *
            </label>
            <input
              type="password"
              value={formPassword.password_confirmation}
              onChange={(e) =>
                setFormPassword({
                  ...formPassword,
                  password_confirmation: e.target.value,
                })
              }
              className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${errorsPassword.password_confirmation
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-border focus:border-navy'
                }`}
            />
            {errorsPassword.password_confirmation && (
              <p className="text-xs text-red-600 mt-1">
                {errorsPassword.password_confirmation}
              </p>
            )}
          </div>
        </div>

        {successPassword && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 mt-4">
            Mot de passe modifié avec succès.
          </div>
        )}

        {generalErrorPassword && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mt-4">
            {generalErrorPassword}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleSavePassword}
            disabled={loadingPassword}
            className="border border-navy text-navy px-6 py-2 rounded-lg text-sm hover:bg-navy hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingPassword ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Modification...
              </span>
            ) : (
              'Modifier le mot de passe'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
