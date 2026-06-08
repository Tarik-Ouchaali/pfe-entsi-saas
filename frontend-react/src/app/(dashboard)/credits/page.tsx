'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { isAdminEntreprise } from '@/lib/auth'
import {
  CreditsBalance,
  Transaction,
  CreditPack,
  PaginatedResponse,
} from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function CreditsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [balance, setBalance] = useState<CreditsBalance | null>(null)
  const [packs, setPacks] = useState<CreditPack[]>([])
  const [transactions, setTransactions] =
    useState<PaginatedResponse<Transaction> | null>(null)
  const [page, setPage] = useState(1)
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseErrorPackId, setPurchaseErrorPackId] = useState<number | null>(
    null
  )

  // Access guard
  useEffect(() => {
    if (!isAdminEntreprise()) router.replace('/dashboard')
  }, [router])

  // Fetch balance + packs on mount
  const fetchBalance = useCallback(async () => {
    const data = await apiGet<CreditsBalance>('/credits/balance')
    setBalance(data)
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [balanceRes, packsRes] = await Promise.all([
        apiGet<CreditsBalance>('/credits/balance'),
        apiGet<{ packs: CreditPack[] }>('/credits/packs'),
      ])
      setBalance(balanceRes)
      setPacks(packsRes.packs)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  // Transactions — separate effect triggered by page
  useEffect(() => {
    apiGet<PaginatedResponse<Transaction>>(
      `/credits/transactions?per_page=10&page=${page}`
    )
      .then((data) => setTransactions(data))
      .catch(() => {})
  }, [page])

  // Purchase handler
  const handlePurchase = async (pack: CreditPack) => {
    setPurchasing(pack.id)
    setPurchaseError(null)
    setPurchaseErrorPackId(null)
    setPurchaseSuccess(null)
    try {
      await apiPost('/credits/purchase', { pack_id: pack.id })
      setPurchaseSuccess(pack.nom)
      await fetchBalance()
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : "Erreur lors de l'achat."
      setPurchaseError(message)
      setPurchaseErrorPackId(pack.id)
    } finally {
      setPurchasing(null)
    }
  }

  // Type badge helper
  const typeBadge = (type: string) => {
    switch (type) {
      case 'analyse_dao':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
            Analyse DAO
          </span>
        )
      case 'memoire_technique':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
            Mémoire
          </span>
        )
      case 'achat_pack':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
            Achat pack
          </span>
        )
      case 'recharge_abonnement':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-navy/10 text-navy">
            Recharge
          </span>
        )
      case 'remboursement':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
            Remboursement
          </span>
        )
      case 'ajustement_manuel':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            Ajustement
          </span>
        )
      default:
        return (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            {type}
          </span>
        )
    }
  }

  // Loading skeleton
  if (loading)
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
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

  return (
    <>
      <PageHeader
        title="Crédits"
        subtitle="Gérez vos crédits et consultez l'historique"
      />

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm text-text-muted mb-1">Crédits abonnement</p>
          <p className="text-3xl font-bold text-navy">
            {balance?.abonnement_credits ?? 0}
          </p>
          <p className="text-xs text-text-muted mt-1">Reset mensuel</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <p className="text-sm text-text-muted mb-1">Crédits pack</p>
          <p className="text-3xl font-bold text-gold">
            {balance?.pack_credits ?? 0}
          </p>
          <p className="text-xs text-text-muted mt-1">N&apos;expirent jamais</p>
        </div>

        <div className="bg-navy rounded-xl p-5 shadow-sm">
          <p className="text-sm text-white/70 mb-1">Total disponible</p>
          <p className="text-3xl font-bold text-white">
            {balance?.total ?? 0}
          </p>
          <p className="text-xs text-white/50 mt-1">abonnement + pack</p>
        </div>
      </div>

      {/* Credit packs */}
      <h2 className="font-semibold text-navy text-lg mb-4">
        Acheter des crédits
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="bg-white rounded-xl border border-border p-5 shadow-sm"
          >
            <p className="font-bold text-navy text-lg">{pack.nom}</p>
            <p className="text-3xl font-bold text-gold mt-1">
              {pack.credits} crédits
            </p>
            <p className="text-sm text-text-muted mt-1">{pack.prix} MAD</p>
            <p className="text-xs text-text-muted">
              {(pack.prix / pack.credits).toFixed(2)} MAD/crédit
            </p>

            <button
              onClick={() => handlePurchase(pack)}
              disabled={purchasing === pack.id}
              className="w-full mt-4 py-2 rounded-lg text-sm bg-navy text-white hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {purchasing === pack.id ? (
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
                  Achat...
                </span>
              ) : (
                'Acheter'
              )}
            </button>

            {purchaseSuccess === pack.nom && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-3 text-xs text-green-700 text-center">
                ✅ Achat réussi ! Crédits ajoutés.
              </div>
            )}

            {purchaseErrorPackId === pack.id && purchaseError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-3 text-xs text-red-700 text-center">
                {purchaseError}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transactions history */}
      <h2 className="font-semibold text-navy text-lg mb-4">
        Historique des transactions
      </h2>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-text-muted uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Montant</th>
              <th className="px-5 py-3 text-left">Description</th>
              <th className="px-5 py-3 text-left">Utilisateur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions && transactions.data.length > 0 ? (
              transactions.data.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 text-xs text-text-muted">
                    {new Date(t.date_transaction).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-3">{typeBadge(t.type_transaction)}</td>
                  <td className="px-5 py-3">
                    {t.montant > 0 ? (
                      <span className="font-medium text-green-600">
                        +{t.montant}
                      </span>
                    ) : (
                      <span className="font-medium text-red-600">
                        {t.montant}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-text-muted truncate max-w-[150px]">
                    {t.description ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-xs text-text-muted">
                    {t.user
                      ? `${t.user.prenom} ${t.user.nom}`
                      : 'Système'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-text-muted text-sm"
                >
                  Aucune transaction pour le moment
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {transactions && transactions.last_page > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4 pb-4">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="text-sm text-navy hover:text-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Précédent
            </button>
            <span className="text-sm text-text-muted">
              {page} / {transactions.last_page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === transactions.last_page}
              className="text-sm text-navy hover:text-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
