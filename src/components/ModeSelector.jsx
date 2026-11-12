
import {
  MessageCircle,
  BriefcaseBusiness,
  GraduationCap,
  Smile,
  PenTool,
  Zap,
  Target,
  Check,
} from 'lucide-react'

const modes = [
  {
    id: 'sound-like-me',
    name: 'Sound Like Me',
    description: 'Write in your personal voice',
    icon: MessageCircle,
    featured: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Polished and confident',
    icon: BriefcaseBusiness,
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Structured and precise',
    icon: GraduationCap,
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed and conversational',
    icon: Smile,
  },
  {
    id: 'better-writer',
    name: 'Better Writer',
    description: 'Improve flow and readability',
    icon: PenTool,
  },
  {
    id: 'shorter-clearer',
    name: 'Shorter & Clearer',
    description: 'Get straight to the point',
    icon: Zap,
  },
  {
    id: 'persuasive',
    name: 'More Persuasive',
    description: 'Make your message compelling',
    icon: Target,
  },
]

export default function ModeSelector({ value, onChange }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink">
          Choose your writing style
        </h2>
        <p className="mt-1 text-xs text-muted">
          Every voice has its own personality. Pick yours.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isSelected = value === mode.id

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              aria-pressed={isSelected}
              className={`group relative flex min-h-[112px] flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-brand bg-[#edf2eb] shadow-sm'
                  : 'border-[#eae8e1] bg-white hover:-translate-y-0.5 hover:border-[#b9c8ba] hover:shadow-sm'
              }`}
            >
              <div className="mb-3 flex w-full items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    isSelected
                      ? 'bg-brand text-white'
                      : 'bg-[#f3f2ed] text-[#77796f] group-hover:text-brand'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </div>

                {isSelected && (
                  <Check size={16} className="text-brand" />
                )}
              </div>

              <span className="text-xs font-semibold text-ink">
                {mode.name}
              </span>

              <span className="mt-1 text-[10px] leading-relaxed text-muted">
                {mode.description}
              </span>

              {mode.featured && (
                <span className="absolute right-3 top-3 rounded-full bg-[#dce8dd] px-2 py-1 text-[8px] font-semibold tracking-wide text-brand">
                  SIGNATURE
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
