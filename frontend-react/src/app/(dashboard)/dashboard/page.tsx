'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { apiGet } from '@/lib/api'
import { getUser, isAdminEntreprise } from '@/lib/auth'
import { ProjetDAO, CreditsBalance, AbonnementCurrent, PaginatedResponse } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

const statutBadge: Record<string, string> = {
  Nouveau: 'bg-gray-100 text-gray-600',
  En_analyse: 'bg-yellow-100 text-yellow-700 animate-pulse',
  Termine: 'bg-green-100 text-green-700',
  Echoue: 'bg-red-100 text-red-700',
}

const statutLabel: Record<string, string> = {
  Nouveau: 'Nouveau',
  En_analyse: 'En analyse',
  Termine: 'Terminé',
  Echoue: 'Échoué',
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [projets, setProjets] = useState<PaginatedResponse<ProjetDAO> | null>(null)
  const [balance, setBalance] = useState<CreditsBalance | null>(null)
  const [abonnement, setAbonnement] = useState<AbonnementCurrent | null>(null)

  const user = getUser()
  const adminRole = isAdminEntreprise()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)

      const [projetsRes, balanceRes, abonnementRes] = await Promise.all([
        apiGet<PaginatedResponse<ProjetDAO>>('/projets?per_page=5'),
        adminRole
          ? apiGet<CreditsBalance>('/credits/balance')
          : Promise.resolve(null),
        adminRole
          ? apiGet<AbonnementCurrent>('/abonnement/current')
          : Promise.resolve(null),
      ])

      setProjets(projetsRes)
      setBalance(balanceRes)
      setAbonnement(abonnementRes)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [adminRole])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = () => {
    fetchData()
  }

  // ── Computed stats ──
  const totalProjets = projets?.total ?? 0
  const enAnalyse = projets?.data.filter((p) => p.statut === 'En_analyse').length ?? 0
  const termines = projets?.data.filter((p) => p.statut === 'Termine').length ?? 0
  const creditsTotal = adminRole ? (balance?.total ?? 0) : null

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div>
        <PageHeader
          title="Tableau de bord"
          subtitle={`Bienvenue, ${user?.prenom ?? ''}`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div>
        <PageHeader
          title="Tableau de bord"
          subtitle={`Bienvenue, ${user?.prenom ?? ''}`}
        />
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700 font-medium text-sm">
            Erreur lors du chargement du tableau de bord.
          </p>
          <button
            onClick={refetch}
            className="mt-3 text-sm text-red-600 underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Section 1 — Page Header ── */}
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bienvenue, ${user?.prenom ?? ''}`}
        action={
          <Link
            href="/projets/nouveau"
            className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition-colors"
          >
            + Nouveau projet
          </Link>
        }
      />

      {/* ── Section 2 — Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 — Total Projets */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm text-text-muted mb-1">Total projets</p>
            <p className="text-3xl font-bold text-navy">{totalProjets}</p>
          </div>
          <div className="w-10 h-10 bg-navy/10 text-navy rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3.5C3 2.67 3.67 2 4.5 2H9l2 2h4.5c.83 0 1.5.67 1.5 1.5V16c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 3 16V3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 2 — En analyse */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm text-text-muted mb-1">En analyse</p>
            <p className="text-3xl font-bold text-yellow-600">{enAnalyse}</p>
          </div>
          <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 3 — Terminés */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm text-text-muted mb-1">Terminés</p>
            <p className="text-3xl font-bold text-green-600">{termines}</p>
          </div>
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6.5 10l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 4 — Crédits disponibles */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-sm text-text-muted mb-1">Crédits disponibles</p>
            <p className="text-3xl font-bold text-gold">{creditsTotal !== null ? creditsTotal : '—'}</p>
            <p className="text-xs text-text-muted mt-1">
              {adminRole ? 'abonnement + pack' : 'Contactez votre admin'}
            </p>
          </div>
          <div className="w-10 h-10 bg-gold/10 text-gold rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Section 3 — Main Grid ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column — Projets récents */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-navy">Projets récents</h3>
            <Link href="/projets" className="text-sm text-gold hover:underline">
              Voir tous →
            </Link>
          </div>

          {projets && projets.data.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs text-text-muted uppercase tracking-wider px-5 py-3">Titre</th>
                  <th className="text-left text-xs text-text-muted uppercase tracking-wider px-5 py-3">Statut</th>
                  <th className="text-left text-xs text-text-muted uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projets.data.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/projets/${p.id}`}
                        className="font-medium text-text hover:text-navy block max-w-[180px] truncate"
                      >
                        {p.titre_projet}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statutBadge[p.statut] ?? ''}`}>
                        {statutLabel[p.statut] ?? p.statut}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-text-muted">
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-300 mb-3">
                <path d="M8 8.5C8 6.57 9.57 5 11.5 5H22l4 4h10.5c1.93 0 3.5 1.57 3.5 3.5V38c0 1.93-1.57 3.5-3.5 3.5h-25A3.5 3.5 0 0 1 8 38V8.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <p className="text-text-muted text-sm">Aucun projet pour le moment</p>
              <Link href="/projets/nouveau" className="text-navy text-sm underline mt-2 inline-block">
                Créer votre premier projet →
              </Link>
            </div>
          )}
        </div>

        {/* Right column — Conditional */}
        <div className="space-y-4">
          {adminRole ? (
            <>
              {/* ── Widget Crédits ── */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-navy">Crédits</h3>
                  <Link href="/credits" className="text-sm text-gold hover:underline">
                    Gérer →
                  </Link>
                </div>

                <div className="space-y-2 my-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Abonnement</span>
                    <span className="text-navy font-medium">{balance?.abonnement_credits ?? 0} crédits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Pack</span>
                    <span className="text-gold font-medium">{balance?.pack_credits ?? 0} crédits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total</span>
                    <span className="font-bold text-text">{balance?.total ?? 0} crédits</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="bg-gray-100 rounded-full h-2 w-full mt-3">
                  <div
                    className="bg-gold rounded-full h-2 transition-all"
                    style={{
                      width: `${(balance?.total ?? 0) > 0
                        ? ((balance?.pack_credits ?? 0) / (balance?.total ?? 1)) * 100
                        : 0
                        }%`,
                    }}
                  />
                </div>

                <Link
                  href="/credits"
                  className="block w-full mt-4 py-2 rounded-lg text-sm font-medium border border-gold text-gold hover:bg-gold hover:text-white transition-colors text-center"
                >
                  Acheter des crédits
                </Link>
              </div>

              {/* ── Widget Abonnement ── */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-5">
                <h3 className="font-semibold text-navy">Mon abonnement</h3>
                <p className="text-xl font-bold text-navy mt-2">
                  {abonnement?.plan.nom_plan ?? '—'}
                </p>
                <p className="text-sm text-text-muted">
                  {abonnement?.plan.prix ?? 0} MAD/mois
                </p>

                {abonnement?.abonnement.date_fin && (
                  <p className="text-sm text-text-muted mt-1">
                    Renouvellement le{' '}
                    {new Date(abonnement.abonnement.date_fin).toLocaleDateString('fr-FR')}
                  </p>
                )}

                {abonnement?.next_plan && (
                  <div className="mt-3 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-xs text-yellow-700">
                      Downgrade planifié : {abonnement.next_plan.nom_plan}
                    </p>
                  </div>
                )}

                <Link
                  href="/abonnement"
                  className="block w-full mt-4 py-2 rounded-lg text-sm font-medium border border-navy text-navy hover:bg-navy hover:text-white transition-colors text-center"
                >
                  Changer de plan
                </Link>
              </div>
            </>
          ) : (
            /* ── EmployeEntreprise — Actions rapides ── */
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <h3 className="font-semibold text-navy mb-4">Actions rapides</h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Nouveau projet', href: '/projets/nouveau', icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )
                  },
                  {
                    label: 'Bibliothèque', href: '/bibliotheque', icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 2h8l4 4v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M11 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    )
                  },
                  {
                    label: 'Mes projets', href: '/projets', icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3.5C2 2.67 2.67 2 3.5 2H8l2 2h4.5c.83 0 1.5.67 1.5 1.5V14c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 2 14V3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    )
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-navy">{item.icon}</span>
                      <span className="text-sm font-medium text-text">{item.label}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-muted">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 4 — Actions rapides (tous les users) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Card 1 — Analyser un DAO */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M10 2v8M6 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 12v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h4 className="font-semibold text-navy text-sm">Analyser un DAO</h4>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Uploadez votre dossier d&apos;appel d&apos;offres pour une analyse IA
          </p>
          <Link href="/projets/nouveau" className="text-sm text-gold font-medium mt-3 inline-block hover:underline">
            Commencer →
          </Link>
        </div>

        {/* Card 2 — Gérer la bibliothèque */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M3 3h3v14H3V3ZM8 3h3v14H8V3ZM14 3l3 14h-3L14 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h4 className="font-semibold text-navy text-sm">Gérer la bibliothèque</h4>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Vos documents de référence pour la conformité
          </p>
          <Link href="/bibliotheque" className="text-sm text-gold font-medium mt-3 inline-block hover:underline">
            Accéder →
          </Link>
        </div>

        {/* Card 3 — Vérifier la conformité */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M10 1L3 5v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V5l-7-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h4 className="font-semibold text-navy text-sm">Vérifier la conformité</h4>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Matchez vos documents aux exigences du DAO
          </p>
          <Link href="/projets" className="text-sm text-gold font-medium mt-3 inline-block hover:underline">
            Voir projets →
          </Link>
        </div>
      </div>
    </div>
  )
}
