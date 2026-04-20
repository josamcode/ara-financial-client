import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'

export function AppProviders({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  )
}
