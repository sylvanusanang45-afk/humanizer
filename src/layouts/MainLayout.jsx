
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

export default function MainLayout() {
  const { user, signOut } = useAuth()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()

    if (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed((current) => !current)
          }
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />

          <Sidebar
            collapsed={false}
            mobile
            onClose={() => setMobileMenuOpen(false)}
          />
        </>
      )}

      <main className="min-w-0 flex-1">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#eae8e1] bg-white/70 px-4 py-3 sm:px-10 lg:justify-end lg:px-12">

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((current) => !current)
            }
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-sidebar"
            className="flex items-center gap-2 rounded-lg p-2 text-muted transition hover:bg-[#f3f2ed] hover:text-brand lg:hidden"
          >
            <Menu size={21} />
            <span className="text-xs font-medium">Menu</span>
          </button>

          {/* User Actions */}
          <div className="flex min-w-0 items-center justify-end gap-3">
            <span className="max-w-[160px] truncate text-xs text-muted sm:max-w-[220px]">
              {user?.email}
            </span>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-muted transition hover:bg-[#f3f2ed] hover:text-brand sm:px-3"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
