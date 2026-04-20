import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  actionLabel,
  actions,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-surface-muted flex items-center justify-center mb-4">
          <Icon size={24} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {message && <p className="text-sm text-text-secondary max-w-sm">{message}</p>}
      {actions}
      {!actions && action && actionLabel && (
        <Button onClick={action} className="mt-5" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
