import { cn } from '@/shared/utils/cn'

export function Card({ children, className, padding = 'md', ...props }) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        'bg-surface rounded-lg border border-border shadow-card',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className }) {
  return <div className={cn('', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border',
        className
      )}
    >
      {children}
    </div>
  )
}
