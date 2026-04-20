import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'react-hot-toast'
import { AppProviders } from './app/providers'
import { AppRouter } from './app/router'
import { ErrorState } from './shared/components/ErrorState'

function RootErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ErrorState
        title="حدث خطأ غير متوقع"
        message={error?.message}
        onRetry={resetErrorBoundary}
      />
    </div>
  )
}

function DirectionManager() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const apply = (lng) => {
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lng
    }
    apply(i18n.language)
    i18n.on('languageChanged', apply)
    return () => i18n.off('languageChanged', apply)
  }, [i18n])

  return null
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      <AppProviders>
        <DirectionManager />
        <AppRouter />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              whiteSpace: 'pre-line',
            },
            success: {
              iconTheme: { primary: '#15803d', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
      </AppProviders>
    </ErrorBoundary>
  )
}
