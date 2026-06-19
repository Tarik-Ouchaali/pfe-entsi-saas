'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { apiGet } from '@/lib/api'
import { isSuperAdmin, isAuthenticated } from '@/lib/auth'
import { PlanSaaS, CreditPack, PaginatedResponse, AdminAbonnement } from '@/lib/types'
import PageHeader from '@/components/layout/PageHeader'

export default function AdminDashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    abonnementsActifs: 0,
    totalPlans: 0,
    totalPacks: 0,
  })

  // Access guard - redirect l login machi l dashboard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }
    if (!isSuperAdmin()) {
      router.replace('/login')
      return
    }
  }, [router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const [abonnementsRes, plansRes, packsRes] = await Promise.all([
          apiGet<PaginatedResponse<AdminAbonnement>>('/admin/abonnements?statut=actif&per_page=1'),
          apiGet<{ plans: PlanSaaS[] }>('/admin/plans'),
          apiGet<{ packs: CreditPack[] }>('/admin/credit-packs'),
        ])
        setStats({
          abonnementsActifs: abonnementsRes.total,
          totalPlans: plansRes.plans.length,
          totalPacks: packsRes.packs.length,
        })
      } catch {
        // Stats fail silently
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Administration"
        subtitle="Tableau de bord SuperAdmin"
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{stats.abonnementsActifs}</p>
            <p className="text-sm text-text-muted">Abonnements actifs</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gold">{stats.totalPlans}</p>
            <p className="text-sm text-text-muted">Plans SaaS</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.totalPacks}</p>
            <p className="text-sm text-text-muted">Credit packs</p>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <h2 className="font-semibold text-navy text-lg mb-4">Accès rapide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <Link href="/admin/entreprises" className="bg-white rounded-xl border border-border p-5 shadow-sm hover:border-navy transition-colors">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="font-semibold text-navy mt-3 text-sm">Entreprises</p>
          <p className="text-xs text-text-muted mt-1">Gérer les entreprises et leurs crédits</p>
        </Link>

        <Link href="/admin/plans" className="bg-white rounded-xl border border-border p-5 shadow-sm hover:border-navy transition-colors">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="font-semibold text-navy mt-3 text-sm">Plans SaaS</p>
          <p className="text-xs text-text-muted mt-1">Créer et modifier les plans d&apos;abonnement</p>
        </Link>

        <Link href="/admin/credit-packs" className="bg-white rounded-xl border border-border p-5 shadow-sm hover:border-navy transition-colors">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="font-semibold text-navy mt-3 text-sm">Credit Packs</p>
          <p className="text-xs text-text-muted mt-1">Gérer les packs de crédits à la carte</p>
        </Link>

        <Link href="/admin/abonnements" className="bg-white rounded-xl border border-border p-5 shadow-sm hover:border-navy transition-colors">
          <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-navy mt-3 text-sm">Abonnements</p>
          <p className="text-xs text-text-muted mt-1">Suivre et renouveler les abonnements</p>
        </Link>
      </div>
    </>
  )
}