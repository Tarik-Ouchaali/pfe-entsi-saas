// No 'use client' — utility file

import { getToken } from './auth'

const BASE = '/api'

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data as T
}

export const apiGet = <T>(endpoint: string) =>
  apiFetch<T>(endpoint, { method: 'GET' })

export const apiPost = <T>(endpoint: string, body?: unknown) =>
  apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) })

export const apiPut = <T>(endpoint: string, body?: unknown) =>
  apiFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) })

export const apiDelete = <T>(endpoint: string) =>
  apiFetch<T>(endpoint, { method: 'DELETE' })

// File upload — do NOT set Content-Type (browser sets multipart boundary)
export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data as T
}
