import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'

export function ErrorState({ title, message, onRetry, compact = false, className }) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-10' : 'py-16',
        className
      )}
    >
      <div
        className={cn(
          'rounded-xl bg-error-soft flex items-center justify-center mb-4',
          compact ? 'w-10 h-10' : 'w-14 h-14'
        )}
      >
        <AlertCircle size={compact ? 18 : 24} className="text-error" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">
        {title || t('common.somethingWentWrong')}
      </h3>
      {message && (
        <p className="text-sm text-text-secondary max-w-sm mb-5">{message}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" className={message ? '' : 'mt-5'}>
          {t('common.tryAgain')}
        </Button>
      )}
    </div>
  )
}
