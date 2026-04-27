import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'

export function EmptyState({
  icon: Icon,
  title,
  message,
  description,
  action,
  actionLabel,
  actions,
  compact = false,
  className,
}) {
  const body = description ?? message

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-10' : 'py-16',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'rounded-xl bg-surface-muted flex items-center justify-center mb-4',
            compact ? 'w-10 h-10' : 'w-14 h-14'
          )}
        >
          <Icon size={compact ? 18 : 24} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      {body && (
        <p className={cn('text-sm text-text-secondary', compact ? 'max-w-xs mb-4' : 'max-w-sm mb-5')}>
          {body}
        </p>
      )}
      {actions}
      {!actions && action && typeof action === 'function' && actionLabel && (
        <Button onClick={action} size="sm">
          {actionLabel}
        </Button>
      )}
      {!actions && action && typeof action !== 'function' && action}
    </div>
  )
}
