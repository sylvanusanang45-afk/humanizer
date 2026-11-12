import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Clock3,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Copy,
  History as HistoryIcon,
  X,
  ArrowUpRight,
} from 'lucide-react'

import { useWriting } from '../context/WritingContext'

const MODE_LABELS = {
  'sound-like-me': 'Sound Like Me',
  professional: 'Professional',
  academic: 'Academic',
  casual: 'Casual',
  'better-writer': 'Better Writer',
  'shorter-clearer': 'Shorter & Clearer',
  persuasive: 'More Persuasive',
}

function formatDate(date) {
  if (!date) return 'Date unavailable'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable'
  }

  return parsedDate.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function History() {
  const navigate = useNavigate()

  const {
    writingHistory,
    removeHistoryEntry,
    clearWritingHistory,
  } = useWriting()

  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return writingHistory

    return writingHistory.filter((entry) => {
      const mode = MODE_LABELS[entry.mode] || entry.mode || ''
      const original = entry.originalText || ''
      const instructions = entry.instructions || ''

      const versions = (entry.versions || [])
        .map((version) => `${version.label || ''} ${version.content || ''}`)
        .join(' ')

      return `${mode} ${original} ${instructions} ${versions}`
        .toLowerCase()
        .includes(query)
    })
  }, [writingHistory, searchTerm])

  const totalAlternatives = writingHistory.reduce(
    (total, entry) => total + (entry.versions?.length || 0),
    0
  )

  const handleCopy = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)

      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (error) {
      console.error('Unable to copy writing:', error)
    }
  }

  const handleDelete = (id) => {
    removeHistoryEntry(id)

    if (expandedId === id) {
      setExpandedId(null)
    }
  }

  const handleClearAll = () => {
    if (
      window.confirm(
        'Delete all your writing history? This cannot be undone.'
      )
    ) {
      clearWritingHistory()
      setExpandedId(null)
    }
  }

  const handleReopen = (entry) => {
    navigate('/', {
      state: {
        restoreHistoryEntry: entry,
      },
    })
  }

  return (
    <div className="min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-9">
        {/* Header */}
        <header>
          <p className="mb-2 text-xs font-medium uppercase tracking-[2px] text-muted">
            Your personal archive
          </p>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Your writing history.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                Every idea you've transformed, all in one place. Pick up
                where you left off whenever you're ready.
              </p>
            </div>

            {writingHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex w-fit items-center gap-2 rounded-xl border border-[#eae8e1] bg-white px-4 py-2.5 text-xs font-medium text-muted transition hover:border-[#e8c9c3] hover:text-[#b65d4e]"
              >
                <Trash2 size={14} />
                Clear history
              </button>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#eae8e1] bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2eb] text-brand">
              <HistoryIcon size={18} />
            </div>

            <p className="text-2xl font-semibold text-ink">
              {writingHistory.length}
            </p>

            <p className="mt-1 text-xs text-muted">
              Saved generations
            </p>
          </div>

          <div className="rounded-2xl border border-[#eae8e1] bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f0e9] text-[#a17a52]">
              <Sparkles size={18} />
            </div>

            <p className="text-2xl font-semibold text-ink">
              {totalAlternatives}
            </p>

            <p className="mt-1 text-xs text-muted">
              Writing alternatives
            </p>
          </div>
        </section>

        {/* Search */}
        <section>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search your writing history..."
              className="w-full rounded-xl border border-[#eae8e1] bg-white py-3.5 pl-11 pr-11 text-sm text-ink outline-none transition placeholder:text-[#aaa99f] focus:border-[#9caf9d]"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <p className="mt-3 text-xs text-muted">
            Showing {filteredHistory.length} of {writingHistory.length} generations
          </p>
        </section>

        {/* History entries */}
        <section className="space-y-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((entry) => {
              const isExpanded = expandedId === entry.id

              return (
                <article
                  key={entry.id}
                  className="overflow-hidden rounded-2xl border border-[#eae8e1] bg-white shadow-[0_4px_20px_rgba(37,42,37,0.02)]"
                >
                  {/* Entry header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#edf2eb] px-3 py-1 text-[10px] font-semibold text-brand">
                            {MODE_LABELS[entry.mode] || entry.mode}
                          </span>

                          <span className="flex items-center gap-1.5 text-[10px] text-muted">
                            <Clock3 size={12} />
                            {formatDate(entry.createdAt)}
                          </span>

                          {entry.updatedAt &&
                            entry.updatedAt !== entry.createdAt && (
                              <span className="text-[10px] text-muted">
                                Edited {formatDate(entry.updatedAt)}
                              </span>
                            )}
                        </div>

                        <p className="text-sm leading-7 text-ink">
                          {(entry.originalText || '').length > 180
                            ? `${entry.originalText.slice(0, 180)}...`
                            : entry.originalText}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted">
                          <span className="flex items-center gap-1.5">
                            <FileText size={13} />
                            {(entry.versions || []).length} alternatives
                          </span>

                          {entry.instructions && (
                            <span className="flex items-center gap-1.5">
                              <Sparkles size={13} />
                              Custom instructions
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          title="Delete generation"
                          aria-label="Delete generation"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-[#fff3f0] hover:text-[#b65d4e]"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : entry.id)
                          }
                          className="flex items-center gap-2 rounded-lg border border-[#eae8e1] px-3 py-2 text-xs font-medium text-ink transition hover:bg-[#fcfbf8]"
                        >
                          {isExpanded ? 'Close' : 'View results'}

                          {isExpanded ? (
                            <ChevronUp size={15} />
                          ) : (
                            <ChevronDown size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded entry */}
                  {isExpanded && (
                    <div className="space-y-5 border-t border-[#eeece6] bg-[#fcfbf8] p-5 sm:p-6">
                      {/* Original text */}
                      <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                          Original writing
                        </h3>

                        <p className="whitespace-pre-wrap rounded-xl border border-[#eae8e1] bg-white p-4 text-sm leading-7 text-ink">
                          {entry.originalText}
                        </p>
                      </div>

                      {/* Instructions */}
                      {entry.instructions && (
                        <div>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                            Additional instructions
                          </h3>

                          <p className="rounded-xl border border-[#eae8e1] bg-white p-4 text-sm leading-6 text-ink">
                            {entry.instructions}
                          </p>
                        </div>
                      )}

                      {/* Generated alternatives */}
                      <div>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                          Generated alternatives
                        </h3>

                        <div className="space-y-3">
                          {(entry.versions || []).map((version, index) => {
                            const copyId = `${entry.id}-${version.id || index}`

                            return (
                              <div
                                key={version.id || index}
                                className="rounded-xl border border-[#eae8e1] bg-white p-4"
                              >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-ink">
                                      {version.label || `Version ${index + 1}`}
                                    </p>

                                    {version.description && (
                                      <p className="mt-1 text-[11px] text-muted">
                                        {version.description}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(version.content, copyId)
                                    }
                                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8e1] px-3 py-2 text-[11px] font-medium text-muted transition hover:bg-[#edf2eb] hover:text-brand"
                                  >
                                    <Copy size={13} />
                                    {copiedId === copyId ? 'Copied' : 'Copy'}
                                  </button>
                                </div>

                                <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
                                  {version.content}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Reopen in workspace */}
                      <div className="flex flex-col justify-between gap-3 border-t border-[#eae8e1] pt-5 sm:flex-row sm:items-center">
                        <p className="text-xs leading-6 text-muted">
                          Continue editing these alternatives in your writing workspace.
                        </p>

                        <button
                          type="button"
                          onClick={() => handleReopen(entry)}
                          className="flex w-fit items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-semibold text-white transition hover:bg-brand-dark"
                        >
                          Reopen in workspace
                          <ArrowUpRight size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-[#dcded4] bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2eb] text-brand">
                {searchTerm ? (
                  <Search size={23} />
                ) : (
                  <HistoryIcon size={23} />
                )}
              </div>

              <h2 className="font-serif text-xl font-semibold text-ink">
                {searchTerm
                  ? 'No matching writing found.'
                  : 'Your story starts here.'}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
                {searchTerm
                  ? 'Try another search term to find what you are looking for.'
                  : 'Once you generate your first three writing alternatives, they will appear here automatically.'}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-5 text-xs font-semibold text-brand hover:text-brand-dark"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}