
import { useState } from 'react'
import {
  Settings as SettingsIcon,
  UserRound,
  PenLine,
  Bell,
  ShieldCheck,
  Save,
  Check,
} from 'lucide-react'

export default function Settings() {
  const [displayName, setDisplayName] = useState('')
  const [defaultMode, setDefaultMode] = useState('sound-like-me')
  const [preserveMeaning, setPreserveMeaning] = useState(true)
  const [simpleLanguage, setSimpleLanguage] = useState(true)
  const [avoidFormal, setAvoidFormal] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">

      {/* Header */}
      <header className="mb-12">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2eb] text-brand">
          <SettingsIcon size={23} />
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-[2px] text-muted">
          Make it yours
        </p>

        <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
          Your space, your preferences.
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
          Adjust how Humanizer works so every writing
          experience feels comfortable and familiar.
        </p>
      </header>

      <div className="mx-auto max-w-4xl space-y-6">

        {/* Profile */}
        <section className="rounded-3xl border border-[#eae8e1] bg-white p-6">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2eb] text-brand">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Personal information
              </h2>
              <p className="mt-1 text-xs text-muted">
                How should we address you?
              </p>
            </div>
          </div>

          <label className="mb-2 block text-xs font-medium text-ink">
            Display name
          </label>

          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Enter your preferred name"
            className="w-full rounded-xl border border-[#eae8e1] bg-[#fcfbf8] px-4 py-3 text-sm outline-none transition focus:border-[#9caf9d]"
          />
        </section>

        {/* Writing preferences */}
        <section className="rounded-3xl border border-[#eae8e1] bg-white p-6">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eee8] text-[#a66b4f]">
              <PenLine size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Writing preferences
              </h2>
              <p className="mt-1 text-xs text-muted">
                Choose your default writing behaviour.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-xs font-medium text-ink">
            Default writing style
          </label>

          <select
            value={defaultMode}
            onChange={(event) => setDefaultMode(event.target.value)}
            className="w-full rounded-xl border border-[#eae8e1] bg-[#fcfbf8] px-4 py-3 text-sm text-ink outline-none focus:border-[#9caf9d]"
          >
            <option value="sound-like-me">Sound Like Me</option>
            <option value="professional">Professional</option>
            <option value="academic">Academic</option>
            <option value="casual">Casual</option>
            <option value="better-writer">Better Writer</option>
            <option value="shorter-clearer">Shorter & Clearer</option>
            <option value="persuasive">More Persuasive</option>
          </select>

          <div className="mt-7 space-y-5">

            <PreferenceToggle
              title="Preserve my original meaning"
              description="Keep the message and important details intact."
              checked={preserveMeaning}
              onChange={setPreserveMeaning}
            />

            <PreferenceToggle
              title="Prefer simple language"
              description="Use clear words instead of unnecessary complexity."
              checked={simpleLanguage}
              onChange={setSimpleLanguage}
            />

            <PreferenceToggle
              title="Avoid overly formal language"
              description="Keep my writing natural and approachable."
              checked={avoidFormal}
              onChange={setAvoidFormal}
            />

          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-3xl border border-[#eae8e1] bg-white p-6">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f2ed] text-[#77796f]">
              <Bell size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Notifications
              </h2>
              <p className="mt-1 text-xs text-muted">
                Notification preferences will be available here.
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs leading-6 text-muted">
            Email updates and writing reminders will be configurable
            once we connect account settings and notifications.
          </p>
        </section>

        {/* Privacy */}
        <section className="rounded-3xl border border-[#eae8e1] bg-white p-6">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2eb] text-brand">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Privacy and security
              </h2>
              <p className="mt-1 text-xs text-muted">
                Your writing deserves to be treated carefully.
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs leading-6 text-muted">
            Account security, data management and privacy controls
            will be connected when we implement authentication
            and the backend.
          </p>
        </section>

        {/* Save */}
        <div className="flex items-center justify-between gap-4 pb-8">
          <p className="text-xs text-muted">
            Your preferences are currently stored locally.
          </p>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            {saved ? <Check size={17} /> : <Save size={17} />}
            {saved ? 'Saved!' : 'Save preferences'}
          </button>
        </div>

      </div>
    </div>
  )
}

function PreferenceToggle({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-xs font-semibold text-ink">
          {title}
        </h3>
        <p className="mt-1 text-[11px] leading-5 text-muted">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-brand' : 'bg-[#dedcd3]'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}
