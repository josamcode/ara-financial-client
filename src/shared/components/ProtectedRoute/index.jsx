import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/entities/auth/model/useAuth'
import { hasPermission } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { Spinner } from '@/shared/components/Spinner'

/**
 * Protects routes requiring authentication.
 * Optionally enforces a permission check.
 * Handles the setup redirect: authenticated users who haven't completed
 * tenant setup are redirected to /setup (except from /setup itself).
 */
export function ProtectedRoute({ children, permission, redirectTo }) {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    )
  }

  // Redirect to setup if tenant hasn't completed onboarding
  const setupIncomplete = user?.tenant?.isSetupComplete === false
  if (setupIncomplete && location.pathname !== ROUTES.SETUP) {
    return <Navigate to={ROUTES.SETUP} replace />
  }

  // Permission gate at the route level
  if (permission && !hasPermission(user, permission)) {
    return <Navigate to={redirectTo || ROUTES.DASHBOARD} replace />
  }

  return children
}
