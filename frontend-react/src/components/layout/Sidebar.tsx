'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { getUser, isAdminEntreprise, isSuperAdmin, logout } from '@/lib/auth'

type Role = 'Collaborateur' | 'AdminEntreprise' | 'SuperAdmin'

const navItems: {
  label: string
  href: string
  icon: React.ReactNode
  roles: Role[]
}[] = [
    // --- visible l AdminEntreprise + Collaborateur ---
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="12" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="10" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      roles: ['AdminEntreprise', 'Collaborateur'],
    },
    {
      label: 'Projets DAO',
      href: '/projets',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3.5C3 2.67 3.67 2 4.5 2H9l2 2h4.5c.83 0 1.5.67 1.5 1.5V16c0 .83-.67 1.5-1.5 1.5h-11A1.5 1.5 0 0 1 3 16V3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['AdminEntreprise', 'Collaborateur'],
    },
    {
      label: 'Bibliothèque',
      href: '/bibliotheque',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2h8l4 4v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 10h8M6 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      roles: ['AdminEntreprise', 'Collaborateur'],
    },
    {
      label: 'Utilisateurs',
      href: '/users',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 17c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      roles: ['AdminEntreprise'],
    },
    {
      label: 'Crédits',
      href: '/credits',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 5v10M7 7.5h4.5a1.5 1.5 0 0 1 0 3H7h5a1.5 1.5 0 0 1 0 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['AdminEntreprise'],
    },
    {
      label: 'Abonnement',
      href: '/abonnement',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      roles: ['AdminEntreprise'],
    },

    // --- visible l SuperAdmin uniquement ---
    {
      label: 'Administration',
      href: '/admin',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2l1.5 1.5L13 3l.5 1.5L15 5l-.5 1.5L15 8l-1.5.5L13 10l-1.5-.5L10 10l-1.5-.5L7 10l-.5-1.5L5 8l.5-1.5L5 5l1.5-.5L7 3l1.5.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="10" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      roles: ['SuperAdmin'],
    },
    {
      label: 'Entreprises',
      href: '/admin/entreprises',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 17V7l7-4 7 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7 17v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M13 10h2v3h-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['SuperAdmin'],
    },
    {
      label: 'Plans SaaS',
      href: '/admin/plans',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2l1.2 3.6H15l-3 2.2 1.1 3.5L10 9.1l-3.1 2.2L8 7.8 5 5.6h3.8L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M4 15h12M4 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      roles: ['SuperAdmin'],
    },
    {
      label: 'Abonnements',
      href: '/admin/abonnements',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 12h2M11 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      roles: ['SuperAdmin'],
    },
    {
      label: 'Credit Packs',
      href: '/admin/credit-packs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 5v10M7 7.5h4.5a1.5 1.5 0 0 1 0 3H7h5a1.5 1.5 0 0 1 0 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['SuperAdmin'],
    },
  ]

function canSeeItem(roles: Role[], user: { role: string } | null): boolean {
  if (!user) return false
  return roles.includes(user.role as Role)
}

const ROLE_LABELS: Record<string, string> = {
  AdminEntreprise: 'Admin',
  Collaborateur: 'Employé',
  SuperAdmin: 'Super Admin',
}

export default function Sidebar() {
  const pathname = usePathname()
  const user = getUser()

  const filteredNavItems = navItems.filter((item) => canSeeItem(item.roles, user))

  const initials = user
    ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase()
    : '??'

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? '') : ''

  return (
    <aside className="w-60 h-screen bg-navy flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 1L3 5v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V5l-7-4Z"
              fill="white"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 10l2 2 3.5-4"
              stroke="#C9A84C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-white font-heading font-bold text-lg tracking-wide">ENTSI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm font-medium transition-colors ${isActive
                  ? 'border-l-[3px] border-gold text-gold bg-white/10'
                  : 'border-l-[3px] border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gold rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user ? `${user.prenom} ${user.nom}` : ''}
            </p>
            {roleLabel && (
              <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white/80">
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.75 15.75H3.75a1.5 1.5 0 0 1-1.5-1.5v-10.5a1.5 1.5 0 0 1 1.5-1.5h3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12.75L15.75 9 12 5.25M6.75 9h9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}