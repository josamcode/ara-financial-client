import { createContext, useCallback, useEffect, useReducer } from 'react'
import { storage } from '@/shared/utils/storage'
import apiClient from '@/shared/api/client'

export const AuthContext = createContext(null)

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
}

function normalizeUser(user) {
  if (!user) return null

  const resolvedUser = user.user ?? user
  const resolvedRole = resolvedUser.role ?? resolvedUser.roleId ?? user.role ?? null
  const resolvedTenantSource =
    resolvedUser.tenant && typeof resolvedUser.tenant === 'object'
      ? resolvedUser.tenant
      : user.tenant && typeof user.tenant === 'object'
      ? user.tenant
      : null
  const resolvedTenant = resolvedTenantSource
    ? {
        ...resolvedTenantSource,
        isSetupComplete:
          resolvedTenantSource.isSetupComplete ?? resolvedTenantSource.setupCompleted,
        setupCompleted:
          resolvedTenantSource.setupCompleted ?? resolvedTenantSource.isSetupComplete,
      }
    : null

  return {
    ...resolvedUser,
    ...(resolvedRole ? { role: resolvedRole } : {}),
    ...(resolvedTenant ? { tenant: resolvedTenant } : {}),
  }
}

function authReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE': {
      const user = normalizeUser(action.payload.user)
      return {
        ...state,
        user,
        isAuthenticated: !!user,
        isInitialized: true,
      }
    }
    case 'LOGIN':
      return {
        ...state,
        user: normalizeUser(action.payload.user),
        isAuthenticated: true,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      }
    case 'UPDATE_USER': {
      const updates = normalizeUser(action.payload)
      return {
        ...state,
        user: updates ? { ...state.user, ...updates } : state.user,
      }
    }
    default:
      return state
  }
}

async function fetchCurrentUser() {
  const [authResponse, tenantResponse] = await Promise.all([
    apiClient.get('/auth/me'),
    apiClient.get('/tenants'),
  ])

  return normalizeUser({
    ...(authResponse.data ?? authResponse),
    tenant: tenantResponse.data?.tenant ?? tenantResponse.tenant ?? null,
  })
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Bootstrap: restore session on mount
  useEffect(() => {
    async function bootstrap() {
      const token = storage.getAccessToken()
      if (!token) {
        dispatch({ type: 'INITIALIZE', payload: { user: null } })
        return
      }
      try {
        const user = await fetchCurrentUser()
        dispatch({ type: 'INITIALIZE', payload: { user } })
      } catch {
        storage.clearTokens()
        dispatch({ type: 'INITIALIZE', payload: { user: null } })
      }
    }
    bootstrap()
  }, [])

  // Listen for forced logout events (e.g., token refresh failure)
  useEffect(() => {
    const handleForcedLogout = () => {
      dispatch({ type: 'LOGOUT' })
    }
    window.addEventListener('ara:auth:logout', handleForcedLogout)
    return () => window.removeEventListener('ara:auth:logout', handleForcedLogout)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    const { accessToken, refreshToken } = response.data
    storage.setTokens(accessToken, refreshToken)
    const normalizedUser = await fetchCurrentUser().catch(() => normalizeUser(response.data))
    dispatch({ type: 'LOGIN', payload: { user: normalizedUser } })
    return normalizedUser
  }, [])

  const register = useCallback(async (data) => {
    const response = await apiClient.post('/auth/register', data)
    const { accessToken, refreshToken } = response.data
    storage.setTokens(accessToken, refreshToken)
    const normalizedUser = await fetchCurrentUser().catch(() => normalizeUser(response.data))
    dispatch({ type: 'LOGIN', payload: { user: normalizedUser } })
    return normalizedUser
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = storage.getRefreshToken()
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      storage.clearTokens()
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const user = await fetchCurrentUser()
      dispatch({ type: 'UPDATE_USER', payload: user })
      return user
    } catch {
      return null
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
