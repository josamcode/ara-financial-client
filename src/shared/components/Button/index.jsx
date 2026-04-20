import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { Spinner } from '@/shared/components/Spinner'

const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  secondary:
    'bg-surface text-text-primary border border-border hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  ghost:
    'text-text-secondary hover:bg-surface-muted hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  danger:
    'bg-error text-error-foreground hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2',
  link:
    'text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
}

const sizes = {
  sm: 'h-button-sm px-3 text-sm rounded-sm',
  md: 'h-button px-4 text-sm rounded-md',
  lg: 'h-button-lg px-6 text-base rounded-lg',
  icon: 'h-button w-button p-0 rounded-md',
  'icon-sm': 'h-button-sm w-button-sm p-0 rounded-sm',
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    className,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="border-current border-t-transparent" />}
      {children}
    </button>
  )
})
