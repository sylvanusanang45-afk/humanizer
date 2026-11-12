
import { NavLink } from 'react-router-dom'
import {
  PenLine,
  LayoutDashboard,
  UserRound,
  Clock3,
  Settings,
  Sparkles,
  Plus,
  ChevronLeft,
} from 'lucide-react'

const navigation = [
  {
    label: 'Workspace',
    items: [
      { name: 'Home', path: '/', icon: LayoutDashboard },
      { name: 'My Voice', path: '/my-voice', icon: UserRound },
      { name: 'History', path: '/history', icon: Clock3 },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#eae8e1] bg-[#f5f3ed] px-5 py-7">

      {/* Brand */}
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
            <PenLine size={21} strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="font-serif text-xl font-semibold tracking-tight">
              humanizer<span className="text-brand">.</span>
            </h1>
            <p className="text-[10px] tracking-[2px] text-muted">
              WRITE LIKE YOU
            </p>
          </div>
        </div>

        <button
          aria-label="Collapse sidebar"
          className="rounded-lg p-2 text-muted transition hover:bg-white"
        >
          <ChevronLeft size={17} />
        </button>
      </div>

      {/* New writing */}
      <button
        className="mb-9 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
      >
        <Plus size={17} />
        New writing
      </button>

      {/* Navigation */}
      <div className="flex-1">
        {navigation.map((section) => (
          <div key={section.label}>
            <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-muted">
              {section.label}
            </p>

            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                        isActive
                          ? 'bg-white font-semibold text-brand shadow-sm'
                          : 'text-[#77796f] hover:bg-white/70 hover:text-ink'
                      }`
                    }
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {item.name}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#e7e5dc] bg-white/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-brand">
            <Sparkles size={16} />
            <span className="text-xs font-semibold">Your voice matters</span>
          </div>

          <p className="mb-3 text-xs leading-relaxed text-muted">
            Create your personal voice profile and make every rewrite feel more like you.
          </p>

          <NavLink
            to="/my-voice"
            className="text-xs font-semibold text-brand hover:underline"
          >
            Set up your voice →
          </NavLink>
        </div>

        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#77796f] transition hover:bg-white"
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <div className="border-t border-[#e7e5dc] pt-4">
          <p className="text-xs text-muted">Made for your words.</p>
          <p className="mt-1 text-[10px] text-[#aaa99f]">
            HUMANIZER © 2026
          </p>
        </div>
      </div>
    </aside>
  )
}
