import { cn } from '@/shared/utils/cn'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-yellow-700',
  error: 'bg-error-soft text-error',
  info: 'bg-info-soft text-info',
  asset: 'bg-primary-50 text-primary-700',
  liability: 'bg-error-soft text-error',
  equity: 'bg-info-soft text-info',
  revenue: 'bg-success-soft text-success',
  expense: 'bg-warning-soft text-yellow-700',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
}

export function Badge({ variant = 'default', size = 'md', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
