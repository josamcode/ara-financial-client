import { Outlet, Navigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import { ROUTES } from '@/shared/constants/routes'
import { APP_NAME } from '@/shared/constants/app'
import { Spinner } from '@/shared/components/Spinner'

export function AuthLayout() {
  const { isAuthenticated, isInitialized, user } = useAuth()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    const dest =
      user?.tenant && !user.tenant.isSetupComplete
        ? ROUTES.SETUP
        : ROUTES.DASHBOARD
    return <Navigate to={dest} replace />
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-gradient-primary flex-col justify-between p-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <img src='/logo.jpg' className='rounded-sm' />
          </div>
          <span className="text-xl font-bold text-white">{APP_NAME}</span>
        </div>

        <div>
          <blockquote className="text-white/90 text-lg leading-relaxed font-medium">
            "نظام محاسبة متكامل يلبي متطلبات المعايير المحاسبية المصرية والدولية."
          </blockquote>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-white/30 rounded-full" />
            <div className="w-4 h-0.5 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <img src='/logo.jpg' className='rounded-sm' />
          </div>
          <span className="text-lg font-bold text-text-primary">{APP_NAME}</span>
        </div>

        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
