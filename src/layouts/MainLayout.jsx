
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

export default function MainLayout() {
  const { user, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()

    if (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      <main className="min-w-0 flex-1">
        <div className="flex items-center justify-end gap-3 border-b border-[#eae8e1] bg-white/70 px-6 py-3 sm:px-10 lg:px-12">
          <span className="max-w-[220px] truncate text-xs text-muted">
            {user?.email}
          </span>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted transition hover:bg-[#f3f2ed] hover:text-brand"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
