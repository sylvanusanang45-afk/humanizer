
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Humanizer production URL.
// Keep this separate from the Todo app's authentication configuration.
const HUMANIZER_URL = 'https://humanizer-sylver.vercel.app'

const AUTH_REDIRECT = `${HUMANIZER_URL}/`
const PASSWORD_RESET_REDIRECT = `${HUMANIZER_URL}/reset-password`

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) {
        console.error('Unable to retrieve session:', error)
      }

      setSession(data?.session ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({
      email,
      password,
    })

  const signUp = (email, password) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: AUTH_REDIRECT,
      },
    })

  const resendConfirmation = (email) =>
    supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: AUTH_REDIRECT,
      },
    })

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: PASSWORD_RESET_REDIRECT,
    })

  const updatePassword = (password) =>
    supabase.auth.updateUser({ password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        resendConfirmation,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
