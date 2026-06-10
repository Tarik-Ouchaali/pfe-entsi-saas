'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { isAdminEntreprise } from '@/lib/auth'
import { AbonnementCurrent, PlanSaaS } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function AbonnementPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [abonnement, setAbonnement] = useState<AbonnementCurrent | null>(null)
  const [plans, setPlans] = useState<PlanSaaS[]>([])
  const [changing, setChanging] = useState<number | null>(null)
  const [changeResult, setChangeResult] = useState<{
    type: 'upgrade' | 'downgrade'
    message: string
  } | null>(null)
  const [changeError, setChangeError] = useState<string | null>(null)

  // Access guard
  useEffect(() => {
    if (!isAdminEntreprise()) router.replace('/dashboard')
  }, [router])

  // Standalone refetch for abonnement after plan change
  const fetchAbonnement = useCallback(async () => {
    const data = await apiGet<AbonnementCurrent>('/abonnement/current')
    setAbonnement(data)
  }, [])

  // Initial parallel fetch
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [abonnementRes, plansRes] = await Promise.all([
        apiGet<AbonnementCurrent>('/abonnement/current'),
        apiGet<{ plans: PlanSaaS[] }>('/abonnement/plans'),
      ])
      setAbonnement(abonnementRes)
      setPlans(plansRes.plans)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Change plan handler
  const handleChangePlan = async (planId: number) => {
    setChanging(planId)
    setChangeError(null)
    setChangeResult(null)
    try {
      const result = await apiPost<{
        type: 'upgrade' | 'downgrade'
        message: string
      }>('/abonnement/change', { plan_id: planId })
      setChangeResult({ type: result.type, message: result.message })
      await fetchAbonnement()
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Erreur lors du changement de plan.'
      setChangeError(message)
    } finally {
      setChanging(null)
    }
  }

  // Loading skeleton
  if (loading)
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded-lg" />
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )

  // Error state
  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-700 text-sm font-medium">
          Erreur lors du chargement.
        </p>
        <button
          onClick={refetch}
          className="mt-3 text-sm text-red-600 underline"
        >
          Réessayer
        </button>
      </div>
    )

  // Progress bar width — division by zero protected
  const creditsAlloues = abonnement?.plan.credits_alloues ?? 0
  const creditsRestants = abonnement?.abonnement_credits ?? 0
  const progressPercent =
    creditsAlloues > 0
      ? Math.min((creditsRestants / creditsAlloues) * 100, 100)
      : 0

  return (
    <>
      <PageHeader
        title="Mon abonnement"
        subtitle="Gérez votre plan et consultez votre consommation"
      />

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-sm text-text-muted font-medium">Plan actuel</p>
            <p className="text-3xl font-bold text-navy mt-1">
              {abonnement?.plan.nom_plan}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {abonnement?.plan.prix ?? 0} MAD/mois
            </p>
            <p className="text-sm text-text-muted">
              {creditsAlloues} crédits/mois inclus
            </p>
          </div>

          <div>
            <p className="text-xs text-text-muted text-right">
              Crédits restants
            </p>
            <p className="font-bold text-navy text-right">
              {creditsRestants} / {creditsAlloues}
            </p>
            <div className="mt-2 w-36">
              <div className="bg-gray-100 rounded-full h-2">
                <div
                  className="bg-navy rounded-full h-2 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-sm text-text-muted">
          Renouvellement le{' '}
          {new Date(
            abonnement?.abonnement.date_fin ?? ''
          ).toLocaleDateString('fr-FR')}
        </div>

        {abonnement?.next_plan && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 text-sm text-yellow-700">
            ⚠ Downgrade planifié : votre plan passera à{' '}
            <strong>{abonnement.next_plan.nom_plan}</strong> au prochain
            renouvellement.
          </div>
        )}
      </div>

      {/* Change result alerts */}
      {changeResult && changeResult.type === 'upgrade' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
          {changeResult.message}
        </div>
      )}
      {changeResult && changeResult.type === 'downgrade' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
          {changeResult.message}
        </div>
      )}
      {changeError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {changeError}
        </div>
      )}

      {/* Plans grid */}
      <h2 className="font-semibold text-navy text-lg mb-4">Changer de plan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = abonnement?.plan.id === plan.id

          return (
            <div
              key={plan.id}
              className={
                isCurrent
                  ? 'bg-navy rounded-xl border-2 border-navy p-5 shadow-md'
                  : 'bg-white rounded-xl border border-border p-5 shadow-sm hover:border-navy transition-colors cursor-pointer'
              }
            >
              <p
                className={`font-bold text-lg ${isCurrent ? 'text-white' : 'text-navy'}`}
              >
                {plan.nom_plan}
              </p>
              <p
                className={`text-sm mt-1 ${isCurrent ? 'text-white/70' : 'text-text-muted'}`}
              >
                {plan.prix} MAD/mois
              </p>
              <p className="text-2xl font-bold mt-3 text-gold">
                {plan.credits_alloues} crédits/mois
              </p>

              {isCurrent ? (
                <span className="bg-gold text-white text-xs px-3 py-1 rounded-full mt-3 inline-block">
                  Plan actuel ✓
                </span>
              ) : (
                <button
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={changing === plan.id}
                  className="w-full mt-4 py-2 rounded-lg text-sm border border-navy text-navy hover:bg-navy hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {changing === plan.id ? (
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
                      Changement...
                    </span>
                  ) : (
                    'Choisir ce plan'
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
