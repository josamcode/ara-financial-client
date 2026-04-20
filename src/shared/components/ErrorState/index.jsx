import { AlertCircle } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'

export function ErrorState({ title, message, onRetry, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <div className="w-14 h-14 rounded-xl bg-error-soft flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-error" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        {title || 'حدث خطأ'}
      </h3>
      {message && (
        <p className="text-sm text-text-secondary max-w-sm">{message}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" className="mt-5">
          حاول مرة أخرى
        </Button>
      )}
    </div>
  )
}
