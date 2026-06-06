// No 'use client' — utility file

import { User } from './types'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser()
}

export function isAdminEntreprise(): boolean {
  return getUser()?.role === 'AdminEntreprise'
}

export function isSuperAdmin(): boolean {
  return getUser()?.role === 'SuperAdmin'
}

export function saveAuth(token: string, user: User): void {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export function logout(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  window.location.href = '/login'
}
