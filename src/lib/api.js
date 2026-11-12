import { supabase } from './supabase'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function humanizerFetch(path, options = {}) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) throw error

  if (!session?.access_token) {
    throw new Error('Please sign in again to continue.')
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  })
}