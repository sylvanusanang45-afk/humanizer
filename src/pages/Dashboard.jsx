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

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

  const clearResults = () => {
    setVersions([])
    setActiveVersionId(null)
    setError('')
    setSaveMessage('')
  }

  useEffect(() => {
    const restored = location.state?.restoreHistoryEntry

    if (!restored) return

    setOriginalText(restored.originalText || '')
    setMode(restored.mode || 'sound-like-me')
    setInstructions(restored.instructions || '')
    setVersions(restored.versions || [])
    setActiveVersionId(
      restored.versions?.[0]?.id || null,
    )

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
        `${API_BASE}/api/humanizer/generate`,
        {
          method: 'POST',
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
          data?.message || 'Something went wrong while generating your text.',
        )
      }

      const generatedVersions = (data?.data?.versions || []).map(
        (version, index) => ({
          id: version.id || createVersionId(),
          label: version.label || `Version ${index + 1}`,
          text: version.text || '',
        }),
      )

      if (generatedVersions.length === 0) {
        throw new Error('No writing versions were returned.')
      }

      setVersions(generatedVersions)
      setActiveVersionId(generatedVersions[0].id)

      try {
        await addHistoryEntry({
          originalText: originalText.trim(),
          mode,
          instructions: instructions.trim(),
          versions: generatedVersions,
        })

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
          ? {
              ...version,
              text: value,
            }
          : version,
      )

      if (historySaveTimer.current) {
        clearTimeout(historySaveTimer.current)
      }

      historySaveTimer.current = setTimeout(async () => {
        const activeHistoryId =
          location.state?.restoreHistoryEntry?.id

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
        `${API_BASE}/api/humanizer/refine`,
        {
          method: 'POST',
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
          data?.message || 'Something went wrong while refining your text.',
        )
      }

      const refinedText =
        data?.data?.text ||
        data?.data?.version?.text ||
        data?.text

      if (!refinedText) {
        throw new Error('No refined text was returned.')
      }

      const updatedVersions = versions.map((version) =>
        version.id === activeVersionId
          ? {
              ...version,
              text: refinedText,
            }
          : version,
      )

      setVersions(updatedVersions)

      const activeHistoryId =
        location.state?.restoreHistoryEntry?.id

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

  const activeVersion =
    versions.find(
      (version) => version.id === activeVersionId,
    ) || null

  return (
    <div className="min-h-screen bg-cream px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-cream">
                <Sparkles size={18} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/60">
                Humanizer
              </span>
            </div>

            <h1 className="font-serif text-4xl leading-tight text-forest sm:text-5xl">
              Write Like You.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-forest/60 sm:text-base">
              Transform your writing without losing the voice that makes it
              yours.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-forest/10 bg-white/60 px-4 py-2 text-xs text-forest/60">
            <ShieldCheck size={15} />
            <span>Your writing stays yours</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Save message */}
        {saveMessage && !error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={17} />
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Input panel */}
          <section className="rounded-3xl border border-forest/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <FileText size={17} className="text-terracotta" />
                  <h2 className="font-serif text-2xl text-forest">
                    Your writing
                  </h2>
                </div>

                <p className="text-sm text-forest/50">
                  Paste or write what you want to transform.
                </p>
              </div>

              <span className="hidden rounded-full bg-cream px-3 py-1 text-xs text-forest/50 sm:block">
                {originalText.length} characters
              </span>
            </div>

            <textarea
              value={originalText}
              onChange={(event) =>
                handleOriginalTextChange(event.target.value)
              }
              placeholder="Start writing or paste your text here..."
              className="min-h-[280px] w-full resize-none rounded-2xl border border-forest/10 bg-cream/50 p-4 text-sm leading-7 text-forest outline-none transition placeholder:text-forest/30 focus:border-forest/30 focus:bg-white"
            />

            <div className="mt-6">
              <ModeSelector
                value={mode}
                onChange={handleModeChange}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-forest">
                Additional instructions
                <span className="ml-1 font-normal text-forest/40">
                  optional
                </span>
              </label>

              <textarea
                value={instructions}
                onChange={(event) =>
                  handleInstructionsChange(event.target.value)
                }
                placeholder="Example: Keep it warm and natural, but make the argument stronger."
                rows={3}
                className="w-full resize-none rounded-2xl border border-forest/10 bg-cream/50 px-4 py-3 text-sm leading-6 text-forest outline-none transition placeholder:text-forest/30 focus:border-forest/30 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !originalText.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  <span>Creating your versions...</span>
                </>
              ) : (
                <>
                  <WandSparkles size={18} />
                  <span>Humanize my writing</span>
                  <ArrowUpRight size={17} />
                </>
              )}
            </button>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-forest/40">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Private workspace
              </span>

              <span>•</span>

              <span>3 writing alternatives</span>

              {voiceSamples.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {voiceSamples.length} voice sample
                    {voiceSamples.length === 1 ? '' : 's'} active
                  </span>
                </>
              )}
            </div>
          </section>

          {/* Results */}
          <section className="min-h-[500px] rounded-3xl border border-forest/10 bg-white p-5 shadow-sm sm:p-7">
            {versions.length > 0 ? (
              <ResultsPanel
                versions={versions}
                activeVersionId={activeVersionId}
                onActiveVersionChange={setActiveVersionId}
                onVersionChange={handleVersionChange}
                onRefine={handleRefine}
                isRefining={isRefining}
                originalText={originalText}
              />
            ) : (
              <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cream text-forest">
                  <Sparkles size={26} />
                </div>

                <h2 className="font-serif text-2xl text-forest">
                  Your versions will appear here
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-forest/50">
                  Add your writing on the left, choose a mode, and let
                  Humanizer create three versions you can compare and refine.
                </p>

                <div className="mt-6 grid w-full max-w-md gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-cream/70 p-3">
                    <Sparkles
                      size={16}
                      className="mx-auto mb-2 text-terracotta"
                    />
                    <p className="text-xs font-medium text-forest">
                      Natural
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cream/70 p-3">
                    <WandSparkles
                      size={16}
                      className="mx-auto mb-2 text-terracotta"
                    />
                    <p className="text-xs font-medium text-forest">
                      Flexible
                    </p>
                  </div>

                  <div className="rounded-2xl bg-cream/70 p-3">
                    <CheckCircle2
                      size={16}
                      className="mx-auto mb-2 text-terracotta"
                    />
                    <p className="text-xs font-medium text-forest">
                      Refineable
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Voice profile reminder */}
        {mode === 'sound-like-me' && voiceSamples.length === 0 && (
          <div className="mt-6 rounded-3xl border border-terracotta/20 bg-terracotta/5 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-terracotta" />
                <h3 className="font-semibold text-forest">
                  Make “Sound Like Me” even better
                </h3>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-forest/55">
                Add a few writing samples to your voice profile so Humanizer
                can learn your natural vocabulary, rhythm, tone, and writing
                patterns.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/my-voice')}
              className="mt-4 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest transition hover:border-forest/30 sm:mt-0"
            >
              Set up My Voice
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}