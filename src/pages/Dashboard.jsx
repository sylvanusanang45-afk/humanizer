
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowUpRight,
  FileText,
  WandSparkles,
  ShieldCheck,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react'

import ModeSelector from '../components/ModeSelector'
import ResultsPanel from '../components/ResultsPanel'
import { useWriting } from '../context/WritingContext'
import { humanizerFetch } from '../lib/api'

function createVersionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    voiceSamples,
    voiceProfile,
    addHistoryEntry,
    updateHistoryEntry,
  } = useWriting()

  const [originalText, setOriginalText] = useState('')
  const [mode, setMode] = useState('sound-like-me')
  const [instructions, setInstructions] = useState('')
  const [versions, setVersions] = useState([])
  const [activeVersionId, setActiveVersionId] = useState(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const historySaveTimer = useRef(null)
  const activeHistoryIdRef = useRef(null)

  const wordCount = originalText.trim()
    ? originalText.trim().split(/\s+/).length
    : 0

  const clearResults = () => {
    setVersions([])
    setActiveVersionId(null)
    setError('')
    setSaveMessage('')
  }

  // Restore history or start a fresh writing session.
  useEffect(() => {
    const restored = location.state?.restoreHistoryEntry
    const startNew = location.state?.newWriting

    if (startNew) {
      if (historySaveTimer.current) {
        clearTimeout(historySaveTimer.current)
        historySaveTimer.current = null
      }

      activeHistoryIdRef.current = null

      setOriginalText('')
      setMode('sound-like-me')
      setInstructions('')
      setVersions([])
      setActiveVersionId(null)
      setError('')
      setSaveMessage('')

      navigate(location.pathname, {
        replace: true,
        state: {},
      })

      return
    }

    if (!restored) return

    if (historySaveTimer.current) {
      clearTimeout(historySaveTimer.current)
      historySaveTimer.current = null
    }

    activeHistoryIdRef.current = restored.id || null

    setOriginalText(restored.originalText || '')
    setMode(restored.mode || 'sound-like-me')
    setInstructions(restored.instructions || '')
    setVersions(restored.versions || [])
    setActiveVersionId(restored.versions?.[0]?.id || null)
    setError('')
    setSaveMessage('')

    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, [location.state, location.pathname, navigate])

  useEffect(() => {
    return () => {
      if (historySaveTimer.current) {
        clearTimeout(historySaveTimer.current)
      }
    }
  }, [])

  const handleOriginalTextChange = (value) => {
    setOriginalText(value)
    activeHistoryIdRef.current = null
    clearResults()
  }

  const handleModeChange = (value) => {
    setMode(value)
    clearResults()
  }

  const handleInstructionsChange = (value) => {
    setInstructions(value)
    clearResults()
  }

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      setError('Please enter some text first.')
      return
    }

    setIsGenerating(true)
    setError('')
    setSaveMessage('')

    try {
      const response = await humanizerFetch(
        '/api/humanizer/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: originalText.trim(),
            mode,
            voiceSamples,
            voiceProfile,
            instructions: instructions.trim(),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Something went wrong while generating your text.',
        )
      }

      const generatedVersions = (data?.data?.versions || []).map(
        (version, index) => ({
          id: version.id || createVersionId(),
          label: version.label || `Version ${index + 1}`,
          text: version.text || version.content || '',
        }),
      )

      if (generatedVersions.length === 0) {
        throw new Error('No writing versions were returned.')
      }

      setVersions(generatedVersions)
      setActiveVersionId(generatedVersions[0].id)

      activeHistoryIdRef.current = null

      try {
        const savedEntry = await addHistoryEntry({
          originalText: originalText.trim(),
          mode,
          instructions: instructions.trim(),
          versions: generatedVersions,
        })

        if (savedEntry?.id) {
          activeHistoryIdRef.current = savedEntry.id
        }

        setSaveMessage('Saved to your writing history.')
      } catch (saveError) {
        console.error('History save failed:', saveError)

        setSaveMessage(
          'Generated successfully, but we could not save this to your history.',
        )
      }
    } catch (requestError) {
      console.error('Generation error:', requestError)

      setError(
        requestError.message ||
          'Something went wrong while generating your text.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVersionChange = (versionId, value) => {
    setVersions((currentVersions) => {
      const updatedVersions = currentVersions.map((version) =>
        version.id === versionId
          ? { ...version, text: value }
          : version,
      )

      if (historySaveTimer.current) {
        clearTimeout(historySaveTimer.current)
      }

      historySaveTimer.current = setTimeout(async () => {
        const activeHistoryId = activeHistoryIdRef.current

        if (!activeHistoryId) return

        try {
          await updateHistoryEntry(activeHistoryId, {
            versions: updatedVersions,
          })
        } catch (saveError) {
          console.error('History update failed:', saveError)

          setSaveMessage(
            'Your edit is visible, but could not be saved to history.',
          )
        }
      }, 700)

      return updatedVersions
    })
  }

  const handleRefine = async (instruction) => {
    const activeVersion = versions.find(
      (version) => version.id === activeVersionId,
    )

    if (!activeVersion?.text?.trim()) {
      setError('There is no active version to refine.')
      return
    }

    if (!instruction?.trim()) {
      setError('Tell the AI how you want this version changed.')
      return
    }

    setIsRefining(true)
    setError('')
    setSaveMessage('')

    try {
      const response = await humanizerFetch(
        '/api/humanizer/refine',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: activeVersion.text,
            mode,
            instruction: instruction.trim(),
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Something went wrong while refining your text.',
        )
      }

      const refinedText =
        data?.data?.text ||
        data?.data?.content ||
        data?.data?.version?.text ||
        data?.text

      if (!refinedText) {
        throw new Error('No refined text was returned.')
      }

      const updatedVersions = versions.map((version) =>
        version.id === activeVersionId
          ? { ...version, text: refinedText }
          : version,
      )

      setVersions(updatedVersions)

      const activeHistoryId = activeHistoryIdRef.current

      if (activeHistoryId) {
        try {
          await updateHistoryEntry(activeHistoryId, {
            versions: updatedVersions,
          })
        } catch (saveError) {
          console.error('Refined version save failed:', saveError)

          setSaveMessage(
            'Refined successfully, but the updated version could not be saved to history.',
          )
        }
      }
    } catch (requestError) {
      console.error('Refinement error:', requestError)

      setError(
        requestError.message ||
          'Something went wrong while refining your text.',
      )
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">

      {/* Header */}
      <header className="mb-12 flex items-center justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[2px] text-muted">
            Your writing space
          </p>

          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Good writing starts with you.
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Bring your words. Choose your style. We'll help you make them
            sound exactly the way you want.
          </p>
        </div>

        <div className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#e7e5dc] bg-white text-sm font-semibold text-brand sm:flex">
          Y
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10">

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Save message */}
        {saveMessage && !error && (
          <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={17} />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Text input */}
        <section className="overflow-hidden rounded-3xl border border-[#eae8e1] bg-white shadow-[0_4px_24px_rgba(37,42,37,0.03)]">

          <div className="flex items-center justify-between border-b border-[#eeece6] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2eb] text-brand">
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Your original writing
                </h2>

                <p className="mt-0.5 text-[11px] text-muted">
                  Paste or type the text you want to transform.
                </p>
              </div>
            </div>

            <span className="text-xs text-muted">
              {wordCount} words
            </span>
          </div>

          <div className="p-6">
            <textarea
              value={originalText}
              onChange={(event) =>
                handleOriginalTextChange(event.target.value)
              }
              placeholder={`Start writing or paste something here...

For example: I am writing to express my interest in the frontend developer position. I believe my experience building modern web applications makes me a good candidate...`}
              className="min-h-[230px] w-full resize-y border-0 bg-transparent text-sm leading-8 text-ink outline-none placeholder:text-[#b5b5ac]"
            />

            <div className="mt-5 flex items-center justify-between border-t border-[#eeece6] pt-4">
              <p className="text-xs text-muted">
                Your meaning stays yours. We're here to improve the delivery.
              </p>

              <button
                type="button"
                onClick={() => handleOriginalTextChange('')}
                className="text-xs font-medium text-muted transition hover:text-brand"
              >
                Clear text
              </button>
            </div>
          </div>
        </section>

        {/* Writing modes */}
        <ModeSelector
          value={mode}
          onChange={handleModeChange}
        />

        {/* Additional instructions */}
        <section className="rounded-2xl border border-[#eae8e1] bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f2ed] text-[#77796f]">
              <WandSparkles size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Additional instructions
              </h2>

              <p className="mt-1 text-xs text-muted">
                Tell us how you want your writing to feel.
              </p>
            </div>
          </div>

          <textarea
            value={instructions}
            onChange={(event) =>
              handleInstructionsChange(event.target.value)
            }
            placeholder="E.g. Keep it simple, use short sentences, avoid complicated vocabulary, and don't make it sound too formal..."
            rows={3}
            className="w-full resize-y rounded-xl border border-[#eae8e1] bg-[#fcfbf8] p-4 text-sm leading-7 text-ink outline-none transition placeholder:text-[#aaa99f] focus:border-[#9caf9d]"
          />
        </section>

        {/* Generate section */}
        <section className="flex flex-col items-center rounded-3xl bg-[#edf2eb] px-6 py-9 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
            <Sparkles size={22} />
          </div>

          <h2 className="font-serif text-2xl font-semibold text-ink">
            Ready to find your words?
          </h2>

          <p className="mt-2 max-w-md text-xs leading-6 text-muted">
            Get three different versions of your writing, each with its own
            approach while preserving your original meaning.
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !originalText.trim()}
            className="mt-6 flex items-center gap-3 rounded-xl bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Creating versions...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Generate 3 versions
                <ArrowUpRight size={16} />
              </>
            )}
          </button>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted">
            <ShieldCheck size={14} />
            Your writing should always remain yours.

            {voiceSamples.length > 0 && (
              <span>
                · {voiceSamples.length} voice sample
                {voiceSamples.length === 1 ? '' : 's'} active
              </span>
            )}
          </div>
        </section>

        {/* Results */}
        {versions.length > 0 && (
          <section>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Your results
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
                Your writing, reimagined.
              </h2>

              <p className="mt-2 text-sm text-muted">
                Compare your alternatives, edit them, or refine your favourite.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[#eae8e1] bg-white p-5 shadow-[0_4px_24px_rgba(37,42,37,0.03)] sm:p-8">
              <ResultsPanel
                versions={versions}
                activeVersionId={activeVersionId}
                onActiveVersionChange={setActiveVersionId}
                onVersionChange={handleVersionChange}
                onRefine={handleRefine}
                isRefining={isRefining}
                originalText={originalText}
              />
            </div>
          </section>
        )}

        {/* My Voice reminder */}
        {mode === 'sound-like-me' && voiceSamples.length === 0 && (
          <section className="rounded-3xl border border-[#eae8e1] bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand" />

                <h3 className="font-serif text-xl font-semibold text-ink">
                  Make "Sound Like Me" even better
                </h3>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Add a few writing samples to your voice profile so Humanizer
                can learn your natural vocabulary, rhythm, tone, and writing patterns.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/my-voice')}
              className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#eae8e1] bg-[#fcfbf8] px-5 py-3 text-sm font-semibold text-ink transition hover:border-[#9caf9d] sm:mt-0"
            >
              Set up My Voice
              <ArrowUpRight size={16} />
            </button>
          </section>
        )}

      </div>
    </div>
  )
}
