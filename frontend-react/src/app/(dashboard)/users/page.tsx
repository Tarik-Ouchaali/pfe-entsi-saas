'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { getUser } from '@/lib/auth'
import { User, CompanyUser } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function UsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const refetch = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await apiGet<{ users: CompanyUser[] }>('/users')
      setUsers(data.users)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const user = getUser()
    if (!user) { router.replace('/login'); return }
    if (user.role !== 'AdminEntreprise') { router.replace('/dashboard'); return }
    setCurrentUser(user)
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openForm = () => {
    setForm({ nom: '', prenom: '', email: '', password: '' })
    setFormErrors({})
    setSaveError('')
    setShowForm(true)
  }

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!form.prenom.trim()) {
      errors.prenom = 'Le prénom est requis.'
    } else if (form.prenom.trim().length < 2 || form.prenom.trim().length > 50) {
      errors.prenom = 'Le prénom doit contenir entre 2 et 50 caractères.'
    }
    if (!form.nom.trim()) {
      errors.nom = 'Le nom est requis.'
    } else if (form.nom.trim().length < 2 || form.nom.trim().length > 50) {
      errors.nom = 'Le nom doit contenir entre 2 et 50 caractères.'
    }
    if (!form.email.trim()) {
      errors.email = "L'email est requis."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "L'email n'est pas valide."
    }
    if (!form.password) {
      errors.password = 'Le mot de passe est requis.'
    } else if (form.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-])/.test(form.password)) {
      errors.password = 'Le mot de passe doit contenir une majuscule, un chiffre et un caractère spécial.'
    }
    return errors
  }

  const handleSave = async () => {
    const errors = validateForm()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setSaveError('')
    try {
      await apiPost('/users', form)
      setShowForm(false)
      refetch()
    } catch (err: any) {
      setSaveError(err.message ?? 'Erreur lors de la création.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await apiDelete(`/users/${id}`)
      setDeleteConfirmId(null)
      refetch()
    } catch {
      // silently fail — could add toast later
    } finally {
      setDeletingId(null)
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle="Membres de votre entreprise"
        action={
          <button
            onClick={openForm}
            className="bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors"
          >
            + Ajouter un collaborateur
          </button>
        }
      />

      {loading ? (
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700 text-sm font-medium">Erreur lors du chargement des utilisateurs.</p>
          <button onClick={refetch} className="mt-3 text-sm text-red-600 underline">Réessayer</button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-sm">Aucun utilisateur trouvé.</p>
          <button onClick={openForm} className="mt-3 text-sm text-navy underline">
            Ajouter un collaborateur
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-text-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nom</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Rôle</th>
                <th className="text-left px-6 py-3 font-medium">Dernier login</th>
                <th className="text-left px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 font-medium text-navy">
                    {u.prenom} {u.nom}
                  </td>
                  <td className="px-6 py-4 text-text-muted">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === 'AdminEntreprise' ? (
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-navy/10 text-navy">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-gold/10 text-gold">
                        Collaborateur
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.dernier_login ? (
                      <span className="text-xs text-text-muted">
                        {new Date(u.dernier_login).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted italic">Jamais connecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {deleteConfirmId === u.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="border border-border text-text-muted text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        disabled={deletingId === u.id}
                        className="border border-red-300 text-red-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === u.id ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Suppression...
                          </span>
                        ) : (
                          'Supprimer'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="font-semibold text-navy text-lg mb-4">Ajouter un collaborateur</h2>

            <div className="space-y-4">
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">Prénom *</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy ${formErrors.prenom ? 'border-red-400' : 'border-border'
                    }`}
                />
                {formErrors.prenom && <p className="text-red-500 text-xs mt-1">{formErrors.prenom}</p>}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy ${formErrors.nom ? 'border-red-400' : 'border-border'
                    }`}
                />
                {formErrors.nom && <p className="text-red-500 text-xs mt-1">{formErrors.nom}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy ${formErrors.email ? 'border-red-400' : 'border-border'
                    }`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">Mot de passe *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy ${formErrors.password ? 'border-red-400' : 'border-border'
                    }`}
                />
                <p className="text-xs text-text-muted mt-1">
                  Min. 8 caractères, majuscule, chiffre et caractère spécial
                </p>
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>
            </div>

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mt-3">
                {saveError}
              </div>
            )}

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
                className="flex-1 bg-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-navy-light transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Création...
                  </span>
                ) : (
                  'Créer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
