import { Outlet, Navigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import { ROUTES } from '@/shared/constants/routes'
import { APP_NAME } from '@/shared/constants/app'

export function SetupLayout() {
  const { user } = useAuth()

  // Already set up → go to dashboard
  if (user?.tenant?.isSetupComplete) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 bg-surface border-b border-border flex items-center px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <img src='/logo.jpg' className='rounded-sm' />
          </div>
          <span className="text-base font-bold text-text-primary">{APP_NAME}</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
