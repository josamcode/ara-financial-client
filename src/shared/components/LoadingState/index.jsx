import { cn } from '@/shared/utils/cn'
import { Spinner } from '@/shared/components/Spinner'

export function LoadingState({ message, compact = false, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        compact ? 'py-10' : 'py-16',
        className
      )}
    >
      <Spinner size="lg" />
      {message && <p className="text-sm text-text-secondary">{message}</p>}
    </div>
  )
}

export function LoadingRows({ count = 5, className }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-11 rounded-md bg-surface-muted animate-pulse"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  )
}

export function LoadingCard({ className }) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface p-5 space-y-3', className)}>
      <div className="h-3.5 w-1/3 rounded bg-surface-muted animate-pulse" />
      <div className="h-8 w-1/2 rounded bg-surface-muted animate-pulse" />
      <div className="h-3 w-full rounded bg-surface-muted animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-surface-muted animate-pulse" />
    </div>
  )
}
