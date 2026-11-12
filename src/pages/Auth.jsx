
import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
  ArrowUpRight,
  LoaderCircle,
  Sparkles,
  Mail,
  ArrowLeft,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const {
    user,
    loading,
    signIn,
    signUp,
    resendConfirmation,
    resetPassword,
  } = useAuth()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmationPending, setConfirmationPending] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  const clearFeedback = () => {
    setError('')
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setBusy(true)
    clearFeedback()

    try {
      const cleanEmail = email.trim()

      if (mode === 'forgot') {
        const { error } = await resetPassword(cleanEmail)
        if (error) throw error

        setMessage(
          'If an account exists for that email, a password reset link will be sent. Check your inbox and spam folder.'
        )
        return
      }

      const action =
        mode === 'login'
          ? await signIn(cleanEmail, password)
          : await signUp(cleanEmail, password)

      if (action.error) throw action.error

      if (mode === 'signup' && !action.data.session) {
        setConfirmationPending(true)
        setMessage(
          'Your account has been created. Check your email to confirm your address before signing in.'
        )
      } else {
        setMessage('Authentication successful.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }

    setBusy(true)
    clearFeedback()

    try {
      const { error } = await resendConfirmation(email.trim())
      if (error) throw error

      setMessage('A new confirmation email has been requested. Check your inbox and spam folder.')
    } catch (err) {
      setError(err.message || 'Unable to resend the confirmation email.')
    } finally {
      setBusy(false)
    }
  }

  const isForgot = mode === 'forgot'

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#eae8e1] bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb] text-brand">
            {isForgot ? <Mail size={23} /> : <Sparkles size={23} />}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[2px] text-muted">
            Humanizer — Write Like You
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
            {isForgot
              ? 'Reset your password.'
              : mode === 'login'
                ? 'Welcome back.'
                : 'Create your account.'}
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            {isForgot
              ? 'Enter your email and we’ll send you a password reset link.'
              : mode === 'login'
                ? 'Sign in to continue where you left off.'
                : 'Your writing workspace, available wherever you go.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-ink">
              Email address
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#eae8e1] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#9caf9d]"
              placeholder="you@example.com"
            />
          </div>

          {!isForgot && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-ink">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#eae8e1] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#9caf9d]"
                placeholder="At least 6 characters"
              />

              {mode === 'login' && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setConfirmationPending(false)
                      clearFeedback()
                    }}
                    className="text-xs font-semibold text-brand hover:text-brand-dark"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-xl bg-[#edf2eb] p-3 text-xs leading-6 text-brand">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <>
                {isForgot
                  ? 'Send reset link'
                  : mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
                <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </form>

        {confirmationPending && (
          <button
            type="button"
            disabled={busy}
            onClick={handleResend}
            className="mt-4 w-full rounded-xl border border-[#dce5da] px-4 py-3 text-sm font-semibold text-brand hover:bg-[#f5f8f3] disabled:opacity-50"
          >
            Resend confirmation email
          </button>
        )}

        <div className="mt-7 text-center text-sm text-muted">
          {isForgot ? (
            <button
              type="button"
              onClick={() => {
                setMode('login')
                clearFeedback()
              }}
              className="inline-flex items-center gap-2 font-semibold text-brand hover:text-brand-dark"
            >
              <ArrowLeft size={15} />
              Back to sign in
            </button>
          ) : (
            <>
              {mode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setConfirmationPending(false)
                  clearFeedback()
                }}
                className="font-semibold text-brand hover:text-brand-dark"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
