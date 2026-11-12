
import { supabase } from './supabase'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '')

export async function humanizerFetch(path, options = {}) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) throw error

  if (!session?.access_token) {
    throw new Error('Please sign in again to continue.')
  }

  // Accept either a relative API path or a full backend URL.
  const requestUrl = /^https?:\/\//i.test(path)
    ? path
    : `${API_BASE_URL}/${path.replace(/^\/+/, '')}`

  console.log('HUMANIZER REQUEST URL:', requestUrl)

  return fetch(requestUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  })
}
