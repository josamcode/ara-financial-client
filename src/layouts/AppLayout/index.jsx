import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/widgets/AppSidebar'
import { AppHeader } from '@/widgets/AppHeader'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
