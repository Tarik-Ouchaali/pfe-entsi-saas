'use client'

import { useEffect, useState } from 'react'
import { getUser, isAdminEntreprise } from '@/lib/auth'
import { apiGet } from '@/lib/api'
import { CreditsBalance } from '@/lib/types'

interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps) {
  const user = getUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [creditsLoading, setCreditsLoading] = useState(false)

  useEffect(() => {
    if (!isAdminEntreprise()) return

    setCreditsLoading(true)
    apiGet<CreditsBalance>('/credits/balance')
      .then((data) => setCredits(data.total))
      .catch(() => setCredits(null))
      .finally(() => setCreditsLoading(false))
  }, [])

  const roleLabel =
    user?.role === 'AdminEntreprise'
      ? 'Admin'
      : user?.role === 'EmployeEntreprise'
        ? 'Employé'
        : user?.role === 'SuperAdmin'
          ? 'Super Admin'
          : ''

  const roleBadgeClass =
    user?.role === 'AdminEntreprise'
      ? 'bg-navy text-white'
      : user?.role === 'SuperAdmin'
        ? 'bg-gold text-white'
        : 'bg-gray-200 text-gray-700'

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Left — Title */}
      <h2 className="font-heading text-xl font-bold text-navy">
        {title || 'ENTSI Conformité'}
      </h2>

      {/* Right — Credits + User */}
      <div className="flex items-center gap-4">
        {/* Credits badge (AdminEntreprise only) */}
        {isAdminEntreprise() && (
          <div>
            {creditsLoading ? (
              <div className="h-7 w-24 rounded-full bg-gold/20 animate-pulse" />
            ) : credits !== null ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold text-white text-xs font-semibold">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M7 4v6M5.5 5.5h2.5a1 1 0 0 1 0 2H5.5h2.5a1 1 0 0 1 0 2H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {credits} crédits
              </span>
            ) : null}
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-text">
            {user ? `${user.prenom} ${user.nom}` : ''}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeClass}`}>
            {roleLabel}
          </span>
        </div>
      </div>
    </header>
  )
}
