
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowUpRight, LoaderCircle, LockKeyhole, Sparkles } from 'lucide-react'

import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const { session, loading, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (loading) return null

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-[#eae8e1] bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb] text-brand">
            <LockKeyhole size={23} />
          </div>

          <h1 className="font-serif text-2xl font-semibold text-ink">
            Reset link unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            This password reset link may have expired or already been used.
            Request a new one to continue.
          </p>

          <Link
            to="/auth"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Back to sign in
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </main>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Your password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setBusy(true)

    try {
      const { error } = await updatePassword(password)

      if (error) throw error

      navigate('/', {
        replace: true,
        state: { passwordUpdated: true },
      })
    } catch (err) {
      setError(err.message || 'Unable to update your password. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#eae8e1] bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb] text-brand">
            <Sparkles size={23} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[2px] text-muted">
            Humanizer — Write Like You
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">
            Choose a new password.
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-ink">
              New password
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-[#eae8e1] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#9caf9d]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-ink">
              Confirm new password
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              className="w-full rounded-xl border border-[#eae8e1] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#9caf9d]"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-700">
              {error}
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
                Update password
                <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
