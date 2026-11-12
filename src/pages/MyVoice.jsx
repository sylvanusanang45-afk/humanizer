import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  Trash2,
  WandSparkles,
  AlertCircle,
  FileText,
  Brain,
} from 'lucide-react'

import { useWriting } from '../context/WritingContext'
import { humanizerFetch } from '../lib/api'

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000'

const MAX_SAMPLES = 5
const MIN_WORDS = 30

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function MyVoice() {
  const navigate = useNavigate()

  const {
    voiceSamples,
    voiceProfile,
    addVoiceSample,
    removeVoiceSample,
    saveVoiceProfile,
  } = useWriting()

  const [sampleText, setSampleText] = useState('')
  const [isAddingSample, setIsAddingSample] = useState(false)
  const [removingIndex, setRemovingIndex] = useState(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const wordCount = countWords(sampleText)

  const handleAddSample = async () => {
    setError('')
    setSuccessMessage('')

    if (!sampleText.trim()) {
      setError('Please enter a writing sample first.')
      return
    }

    if (wordCount < MIN_WORDS) {
      setError(
        `Your sample needs at least ${MIN_WORDS} words so we can learn your writing style.`,
      )
      return
    }

    if (voiceSamples.length >= MAX_SAMPLES) {
      setError(`You can save up to ${MAX_SAMPLES} writing samples.`)
      return
    }

    setIsAddingSample(true)

    try {
      await addVoiceSample(sampleText.trim())

      setSampleText('')

      setSuccessMessage(
        'Writing sample saved to your account.',
      )
    } catch (requestError) {
      console.error('Adding voice sample failed:', requestError)

      setError(
        requestError.message ||
          'We could not save your writing sample.',
      )
    } finally {
      setIsAddingSample(false)
    }
  }

  const handleRemoveSample = async (index) => {
    setError('')
    setSuccessMessage('')
    setRemovingIndex(index)

    try {
      await removeVoiceSample(index)

      setSuccessMessage('Writing sample removed.')
    } catch (requestError) {
      console.error('Removing voice sample failed:', requestError)

      setError(
        requestError.message ||
          'We could not remove this writing sample.',
      )
    } finally {
      setRemovingIndex(null)
    }
  }

  const handleAnalyzeVoice = async () => {
    setError('')
    setSuccessMessage('')

    if (voiceSamples.length < 3) {
      setError(
        'Add at least 3 writing samples before analyzing your voice.',
      )
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await humanizerFetch(
        `${API_BASE}/api/humanizer/analyze-voice`,
        {
          method: 'POST',
          body: JSON.stringify({
            samples: voiceSamples,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Something went wrong while analyzing your writing voice.',
        )
      }

      const profile = data?.data?.profile

      if (!profile) {
        throw new Error(
          'The voice analysis did not return a profile.',
        )
      }

      await saveVoiceProfile(profile)

      setSuccessMessage(
        'Your voice profile has been analyzed and saved.',
      )
    } catch (requestError) {
      console.error('Voice analysis failed:', requestError)

      setError(
        requestError.message ||
          'We could not analyze your writing voice.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-forest/55 transition hover:text-forest"
          >
            <ArrowLeft size={16} />
            Back to workspace
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-cream">
                  <Sparkles size={19} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-forest/50">
                  My Voice
                </span>
              </div>

              <h1 className="font-serif text-4xl leading-tight text-forest sm:text-5xl">
                Sound Like You.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-forest/60 sm:text-base">
                Give Humanizer a few examples of your writing so it can
                understand how you naturally communicate.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-forest/10 bg-white/60 px-4 py-2 text-xs text-forest/55">
              <CheckCircle2 size={14} />
              Saved to your account
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && !error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={17} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Intro card */}
        <section className="mb-6 rounded-3xl border border-forest/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-forest">
              <Brain size={23} />
            </div>

            <div>
              <h2 className="font-serif text-2xl text-forest">
                Teach Humanizer your writing style
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-forest/55">
                Add 3–5 examples of your real writing. Humanizer looks for
                patterns in your tone, vocabulary, sentence structure, rhythm,
                personality, and other writing habits.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'Tone',
                  'Vocabulary',
                  'Sentence style',
                  'Rhythm',
                  'Personality',
                  'Writing patterns',
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-cream px-3 py-1.5 text-xs text-forest/55"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          {/* Add sample */}
          <section className="rounded-3xl border border-forest/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText size={17} className="text-terracotta" />
                  <h2 className="font-serif text-2xl text-forest">
                    Writing samples
                  </h2>
                </div>

                <p className="mt-1 text-sm text-forest/50">
                  {voiceSamples.length} of {MAX_SAMPLES} samples saved
                </p>
              </div>

              <span className="rounded-full bg-cream px-3 py-1.5 text-xs text-forest/50">
                {wordCount} words
              </span>
            </div>

            <textarea
              value={sampleText}
              onChange={(event) => {
                setSampleText(event.target.value)
                setError('')
                setSuccessMessage('')
              }}
              placeholder="Paste something you have actually written — an email, message, essay, post, journal entry, or anything else that sounds like you..."
              className="min-h-[240px] w-full resize-none rounded-2xl border border-forest/10 bg-cream/50 p-4 text-sm leading-7 text-forest outline-none transition placeholder:text-forest/30 focus:border-forest/30 focus:bg-white"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-forest/40">
                Aim for at least {MIN_WORDS} words. More natural writing gives
                better results.
              </p>

              <button
                type="button"
                onClick={handleAddSample}
                disabled={
                  isAddingSample ||
                  voiceSamples.length >= MAX_SAMPLES ||
                  wordCount < MIN_WORDS
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAddingSample ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    Add sample
                    <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Saved samples */}
            {voiceSamples.length > 0 && (
              <div className="mt-7 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-forest/40">
                  Saved samples
                </h3>

                {voiceSamples.map((sample, index) => (
                  <div
                    key={`${index}-${sample.slice(0, 20)}`}
                    className="rounded-2xl border border-forest/10 bg-cream/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-forest">
                          {index + 1}
                        </div>

                        <p className="line-clamp-4 text-sm leading-6 text-forest/70">
                          {sample}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSample(index)}
                        disabled={removingIndex === index}
                        className="shrink-0 rounded-lg p-2 text-forest/35 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        aria-label={`Remove sample ${index + 1}`}
                      >
                        {removingIndex === index ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Voice profile */}
          <section className="rounded-3xl border border-forest/10 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <WandSparkles
                  size={17}
                  className="text-terracotta"
                />

                <h2 className="font-serif text-2xl text-forest">
                  Your voice profile
                </h2>
              </div>

              <p className="mt-1 text-sm leading-6 text-forest/50">
                Analyze your samples to create a reusable profile for
                “Sound Like Me.”
              </p>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeVoice}
              disabled={isAnalyzing || voiceSamples.length < 3}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-5 py-3.5 text-sm font-semibold text-cream transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Analyzing your voice...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {voiceProfile
                    ? 'Re-analyze my voice'
                    : 'Analyze my voice'}
                </>
              )}
            </button>

            {voiceSamples.length < 3 && (
              <p className="mt-3 text-center text-xs text-forest/40">
                Add {3 - voiceSamples.length} more sample
                {3 - voiceSamples.length === 1 ? '' : 's'} to unlock
                voice analysis.
              </p>
            )}

            {voiceProfile && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-cream/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest/40">
                    Summary
                  </p>

                  <p className="mt-2 text-sm leading-6 text-forest/70">
                    {voiceProfile.summary ||
                      'Your writing voice has been analyzed and is ready to use.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Tone', voiceProfile.tone],
                    ['Formality', voiceProfile.formality],
                    [
                      'Sentence style',
                      voiceProfile.sentenceStyle,
                    ],
                    [
                      'Vocabulary',
                      voiceProfile.vocabulary,
                    ],
                    ['Rhythm', voiceProfile.rhythm],
                    [
                      'Personality',
                      voiceProfile.personality,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-forest/10 bg-white p-3.5"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-forest/35">
                        {label}
                      </p>

                      <p className="mt-1.5 text-sm leading-5 text-forest/70">
                        {value || 'Not specified'}
                      </p>
                    </div>
                  ))}
                </div>

                {Array.isArray(voiceProfile.writingPatterns) &&
                  voiceProfile.writingPatterns.length > 0 && (
                    <div className="rounded-2xl border border-forest/10 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest/40">
                        Writing patterns
                      </p>

                      <ul className="mt-3 space-y-2">
                        {voiceProfile.writingPatterns.map(
                          (pattern, index) => (
                            <li
                              key={`${pattern}-${index}`}
                              className="flex gap-2 text-sm leading-6 text-forest/65"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                              <span>{pattern}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {!voiceProfile && (
              <div className="mt-6 rounded-2xl border border-dashed border-forest/15 bg-cream/40 p-5 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-forest/50">
                  <Brain size={20} />
                </div>

                <p className="text-sm font-medium text-forest">
                  No voice profile yet
                </p>

                <p className="mt-1 text-xs leading-5 text-forest/40">
                  Add three or more samples and analyze them to create your
                  personal writing profile.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Bottom note */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-forest/10 bg-white/60 px-4 py-4">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-forest/50"
          />

          <p className="text-xs leading-5 text-forest/45">
            Your writing samples and voice profile are tied to your account,
            so your “Sound Like Me” setup can follow you across devices.
          </p>
        </div>
      </div>
    </div>
  )
}