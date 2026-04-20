import { cn } from '@/shared/utils/cn'
import { Spinner } from '@/shared/components/Spinner'

export function LoadingState({ message, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 gap-3',
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
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 rounded-md bg-gray-100 animate-pulse" />
      ))}
    </div>
  )
}

export function LoadingCard({ className }) {
  return (
    <div className={cn('rounded-lg border border-border p-5 space-y-3', className)}>
      <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
      <div className="h-8 w-1/2 rounded bg-gray-100 animate-pulse" />
      <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
    </div>
  )
}
