import { useAuth } from '@/entities/auth/model/useAuth'
import { hasPermission } from '@/shared/constants/permissions'

/**
 * Renders children only when the current user has the required permission(s).
 * Pass an array for OR logic (any of them suffices).
 * Use `fallback` to render something else when permission is denied.
 */
export function PermissionGate({ permission, fallback = null, children }) {
  const { user } = useAuth()

  if (!hasPermission(user, permission)) {
    return fallback
  }

  return children
}
