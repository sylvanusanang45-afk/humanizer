
import { useState, useRef, useEffect } from 'react'
import {
  Copy,
  Check,
  GitCompareArrows,
  Sparkles,
  Pencil,
  RefreshCw,
  History,
  RotateCcw,
  Clock,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Star,
  LoaderCircle,
} from 'lucide-react'

import { useWriting } from '../context/WritingContext'

export default function ResultsPanel({
  versions = [],
  activeVersionId,
  onActiveVersionChange,
  originalText = '',
  onVersionChange,
  onRefine,
  isRefining = false,
}) {
  const [internalActiveVersionId, setInternalActiveVersionId] = useState(
    versions[0]?.id || null
  )

  const [showComparison, setShowComparison] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [refinement, setRefinement] = useState('')
  const [copied, setCopied] = useState(false)
  const [historyByVersion, setHistoryByVersion] = useState({})

  const {
    savedVersions = [],
    saveVersion,
    removeSavedVersion,
  } = useWriting()

  const lastSavedContent = useRef('')

  const selectedVersionId =
    activeVersionId || internalActiveVersionId || versions[0]?.id

  const currentVersion =
    versions.find((version) => version.id === selectedVersionId) ||
    versions[0]

  const currentContent =
    typeof currentVersion?.text === 'string'
      ? currentVersion.text
      : ''

  const currentHistory = currentVersion
    ? historyByVersion[currentVersion.id] || []
    : []

  const isSaved = currentVersion
    ? savedVersions.some(
        (version) => version.id === currentVersion.id
      )
    : false

  useEffect(() => {
    if (!versions.length) {
      setInternalActiveVersionId(null)
      return
    }

    const selectedExists = versions.some(
      (version) => version.id === selectedVersionId
    )

    if (!selectedExists) {
      setInternalActiveVersionId(versions[0].id)
      onActiveVersionChange?.(versions[0].id)
    }
  }, [versions, selectedVersionId, onActiveVersionChange])

  useEffect(() => {
    lastSavedContent.current = currentContent
    setShowHistory(false)
  }, [selectedVersionId])

  if (!versions.length || !currentVersion) return null

  const wordCount = currentContent
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  const handleSelectVersion = (versionId) => {
    setInternalActiveVersionId(versionId)
    onActiveVersionChange?.(versionId)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch (error) {
      console.error('Copy failed:', error)
      setCopied(false)
    }
  }

  const toggleSave = () => {
    if (isSaved) {
      removeSavedVersion(currentVersion.id)
      return
    }

    saveVersion(currentVersion)
  }

  const saveSnapshot = () => {
    const previousContent = lastSavedContent.current

    if (!previousContent || previousContent === currentContent) {
      return
    }

    setHistoryByVersion((previous) => ({
      ...previous,
      [currentVersion.id]: [
        {
          id: Date.now(),
          text: previousContent,
          label: 'Previous edit',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        ...(previous[currentVersion.id] || []),
      ],
    }))

    lastSavedContent.current = currentContent
  }

  const restoreSnapshot = (snapshot) => {
    const snapshotText = snapshot.text ?? snapshot.content ?? ''

    if (currentContent !== snapshotText) {
      setHistoryByVersion((previous) => ({
        ...previous,
        [currentVersion.id]: [
          {
            id: Date.now(),
            text: currentContent,
            label: 'Saved before restore',
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          ...(previous[currentVersion.id] || []),
        ],
      }))
    }

    onVersionChange?.(currentVersion.id, snapshotText)
    lastSavedContent.current = snapshotText
    setShowHistory(false)
  }

  const handleRefine = () => {
    if (!refinement.trim() || isRefining) return

    onRefine?.(refinement.trim())
    setRefinement('')
  }

  return (
    <section className="mt-10 space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand">
            <Sparkles size={17} />
            <span className="text-sm font-semibold">
              Your new versions
            </span>
          </div>

          <h2 className="mt-1 font-serif text-2xl text-ink">
            Choose the one that feels right.
          </h2>

          <p className="mt-1 text-sm text-muted">
            Three different approaches. One message, your choice.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center gap-2 rounded-xl border border-[#e5e4dc] px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-paper"
        >
          <GitCompareArrows size={16} />
          {showComparison ? 'Hide comparison' : 'Compare with original'}
        </button>
      </div>

      {/* Saved versions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eae8e1] bg-white p-4">
        <div className="flex items-center gap-2">
          <Star size={17} className="text-[#b58b4c]" />

          <span className="text-sm font-semibold text-ink">
            Saved versions
          </span>

          <span className="rounded-full bg-[#f3f2ed] px-2 py-0.5 text-xs text-muted">
            {savedVersions.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowSaved(!showSaved)}
          className="flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark"
        >
          {showSaved ? 'Hide saved' : 'View saved'}

          <ChevronDown
            size={15}
            className={`transition ${showSaved ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {showSaved && (
        <div className="rounded-2xl border border-[#e8e6dd] bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">
            Your favourite writing
          </h3>

          {savedVersions.length === 0 ? (
            <p className="text-sm leading-6 text-muted">
              You haven't saved any versions yet. Use the bookmark
              button on a version to keep it here.
            </p>
          ) : (
            <div className="space-y-3">
              {savedVersions.map((savedVersion) => {
                const savedText =
                  savedVersion.text ?? savedVersion.content ?? ''

                return (
                  <div
                    key={savedVersion.id}
                    className="rounded-xl border border-[#eeece6] bg-[#fcfbf8] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">
                          {savedVersion.label}
                        </h4>

                        <p className="mt-1 text-xs text-muted">
                          Saved {savedVersion.savedAt}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const exists = versions.some(
                            (version) => version.id === savedVersion.id
                          )

                          if (exists) {
                            handleSelectVersion(savedVersion.id)
                          }

                          setShowSaved(false)
                        }}
                        disabled={
                          !versions.some(
                            (version) => version.id === savedVersion.id
                          )
                        }
                        className="rounded-lg bg-[#edf2eb] px-3 py-2 text-xs font-semibold text-brand hover:bg-[#dfe9dc] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {versions.some(
                          (version) => version.id === savedVersion.id
                        )
                          ? 'Open version'
                          : 'Not in current results'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeSavedVersion(savedVersion.id)
                        }
                        className="rounded-lg border border-[#eae8e1] px-3 py-2 text-xs font-medium text-muted hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-ink">
                      {savedText}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Version tabs */}
      <div className="flex flex-wrap gap-2">
        {versions.map((version, index) => {
          const versionIsSaved = savedVersions.some(
            (saved) => saved.id === version.id
          )

          return (
            <button
              type="button"
              key={version.id}
              onClick={() => handleSelectVersion(version.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                currentVersion.id === version.id
                  ? 'bg-brand text-white'
                  : 'border border-[#e5e4dc] bg-white text-ink hover:bg-paper'
              }`}
            >
              Version {index + 1}

              {versionIsSaved && <BookmarkCheck size={14} />}
            </button>
          )
        })}
      </div>

      {/* Active version */}
      <div className="rounded-2xl border border-[#e8e6dd] bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efeee8] pb-4">
          <div>
            <h3 className="font-semibold text-ink">
              {currentVersion.label}
            </h3>

            <p className="mt-1 text-xs text-muted">
              {currentVersion.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleSave}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isSaved
                  ? 'bg-[#edf2eb] text-brand'
                  : 'bg-paper text-ink hover:bg-[#e9e7de]'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck size={15} />
              ) : (
                <Bookmark size={15} />
              )}

              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                showHistory
                  ? 'bg-brand text-white'
                  : 'bg-paper text-ink hover:bg-[#e9e7de]'
              }`}
            >
              <History size={15} />
              History ({currentHistory.length})

              <ChevronDown
                size={14}
                className={`transition ${showHistory ? 'rotate-180' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2 text-sm font-medium text-ink transition hover:bg-[#e9e7de]"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Edit history */}
        {showHistory && (
          <div className="mt-4 rounded-xl border border-[#eae8e1] bg-[#fcfbf8] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock size={15} className="text-brand" />

              <h4 className="text-sm font-semibold text-ink">
                Previous edits
              </h4>
            </div>

            {currentHistory.length === 0 ? (
              <p className="text-xs leading-6 text-muted">
                No previous edits yet. Edit this version and click
                outside the text box to create your first snapshot.
              </p>
            ) : (
              <div className="space-y-2">
                {currentHistory.map((snapshot, index) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#eeece6] bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {snapshot.label} {index + 1}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Saved at {snapshot.time}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted">
                        {snapshot.text ?? snapshot.content ?? ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => restoreSnapshot(snapshot)}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#edf2eb] px-3 py-2 text-xs font-semibold text-brand transition hover:bg-[#dfe9dc]"
                    >
                      <RotateCcw size={13} />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editable writing */}
        <div className="relative mt-4">
          <textarea
            value={currentContent}
            onChange={(event) =>
              onVersionChange?.(currentVersion.id, event.target.value)
            }
            onBlur={saveSnapshot}
            rows={7}
            className="w-full resize-y rounded-xl border border-transparent bg-[#fcfbf8] p-4 text-sm leading-7 text-ink outline-none transition focus:border-brand/30 focus:bg-white"
            placeholder="Your rewritten version will appear here..."
          />

          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <Pencil size={12} />
              You can edit this version
            </span>

            <span>{wordCount} words</span>
          </div>
        </div>
      </div>

      {/* Refinement */}
      <div className="rounded-2xl border border-[#e8e6dd] bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2eb] text-brand">
            <RefreshCw size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">
              Refine this version
            </h3>

            <p className="mt-1 text-xs text-muted">
              Working on Version {versions.findIndex(
                (version) => version.id === currentVersion.id
              ) + 1}
            </p>
          </div>
        </div>

        <textarea
          value={refinement}
          onChange={(event) => setRefinement(event.target.value)}
          rows={2}
          disabled={isRefining}
          placeholder="E.g. Make it warmer but still professional..."
          className="w-full resize-y rounded-xl border border-[#eae8e1] bg-[#fcfbf8] p-4 text-sm leading-7 text-ink outline-none transition placeholder:text-[#aaa99f] focus:border-[#9caf9d] disabled:opacity-60"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Your earlier version will remain available.
          </p>

          <button
            type="button"
            onClick={handleRefine}
            disabled={!refinement.trim() || isRefining}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRefining ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Refine version
              </>
            )}
          </button>
        </div>
      </div>

      {/* Original comparison */}
      {showComparison && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#e8e6dd] bg-[#f4f2eb] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Original writing
            </p>

            <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
              {originalText}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dce6dc] bg-[#f1f6f0] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">
              Rewritten version
            </p>

            <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
              {currentContent}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
