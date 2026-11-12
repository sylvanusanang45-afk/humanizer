
import { NavLink, useNavigate } from 'react-router-dom'
import {
  PenLine,
  LayoutDashboard,
  UserRound,
  Clock3,
  Settings,
  Sparkles,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
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

export default function Sidebar({
  collapsed,
  onToggle,
  mobile = false,
  onClose,
}) {
  const navigate = useNavigate()

  const handleNewWriting = () => {
    navigate('/', {
      state: { newWriting: true },
    })

    onClose?.()
  }

  const sidebarWidth = mobile
    ? 'w-[280px] px-5'
    : collapsed
      ? 'w-[84px] px-3'
      : 'w-[260px] px-5'

  return (
    <aside
      id={mobile ? 'mobile-sidebar' : undefined}
      className={`flex h-screen shrink-0 flex-col border-r border-[#eae8e1] bg-[#f5f3ed] py-7 transition-all duration-300 ${
        mobile
          ? 'fixed inset-y-0 left-0 z-50 overflow-y-auto shadow-2xl'
          : ''
      } ${sidebarWidth}`}
    >
      {/* Brand */}
      <div
        className={`mb-12 flex items-center ${
          collapsed && !mobile
            ? 'flex-col gap-5'
            : 'justify-between'
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed && !mobile ? 'justify-center' : 'gap-3'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
            <PenLine size={21} strokeWidth={1.8} />
          </div>

          {(!collapsed || mobile) && (
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight">
                humanizer<span className="text-brand">.</span>
              </h1>
              <p className="text-[10px] tracking-[2px] text-muted">
                WRITE LIKE YOU
              </p>
            </div>
          )}
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-muted transition hover:bg-white hover:text-brand"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-lg p-2 text-muted transition hover:bg-white"
          >
            {collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronLeft size={17} />
            )}
          </button>
        )}
      </div>

      {/* New writing */}
      <button
        type="button"
        onClick={handleNewWriting}
        title="New writing"
        className={`mb-9 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-3 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark ${
          collapsed && !mobile ? 'aspect-square' : ''
        }`}
      >
        <Plus size={17} />
        {(!collapsed || mobile) && 'New writing'}
      </button>

      {/* Navigation */}
      <div className="flex-1">
        {navigation.map((section) => (
          <div key={section.label}>
            {(!collapsed || mobile) && (
              <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-muted">
                {section.label}
              </p>
            )}

            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    title={collapsed && !mobile ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl py-3 text-sm transition ${
                        collapsed && !mobile
                          ? 'justify-center px-2'
                          : 'gap-3 px-3'
                      } ${
                        isActive
                          ? 'bg-white font-semibold text-brand shadow-sm'
                          : 'text-[#77796f] hover:bg-white/70 hover:text-ink'
                      }`
                    }
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {(!collapsed || mobile) && item.name}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="space-y-5">
        {(!collapsed || mobile) && (
          <div className="rounded-2xl border border-[#e7e5dc] bg-white/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-brand">
              <Sparkles size={16} />
              <span className="text-xs font-semibold">
                Your voice matters
              </span>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-muted">
              Create your personal voice profile and make every rewrite feel more like you.
            </p>

            <NavLink
              to="/my-voice"
              onClick={onClose}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Set up your voice →
            </NavLink>
          </div>
        )}

        <NavLink
          to="/settings"
          onClick={onClose}
          title={collapsed && !mobile ? 'Settings' : undefined}
          className={`flex items-center rounded-xl py-2 text-sm text-[#77796f] transition hover:bg-white ${
            collapsed && !mobile
              ? 'justify-center px-2'
              : 'gap-3 px-3'
          }`}
        >
          <Settings size={18} />
          {(!collapsed || mobile) && 'Settings'}
        </NavLink>

        {(!collapsed || mobile) && (
          <div className="border-t border-[#e7e5dc] pt-4">
            <p className="text-xs text-muted">Made for your words.</p>
            <p className="mt-1 text-[10px] text-[#aaa99f]">
              HUMANIZER © 2026
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
