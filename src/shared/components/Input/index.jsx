import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export const Input = forwardRef(function Input(
  { label, error, hint, className, wrapperClassName, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ms-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary',
          'placeholder:text-text-muted',
          'transition-colors duration-200',
          'focus:outline-none focus:border-primary focus:shadow-focus',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-error focus:border-error focus:shadow-none',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
})

export const PasswordInput = forwardRef(function PasswordInput(
  { label, error, hint, className, wrapperClassName, ...props },
  ref
) {
  const [show, setShow] = useState(false)

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ms-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={cn(
            'h-input w-full rounded-md border border-input bg-surface pe-10 px-3 text-sm text-text-primary',
            'placeholder:text-text-muted',
            'transition-colors duration-200',
            'focus:outline-none focus:border-primary focus:shadow-focus',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-error focus:border-error focus:shadow-none',
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 end-0 flex items-center px-3 text-text-muted hover:text-text-primary transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
})

export const FormField = forwardRef(function FormField(
  { label, error, hint, children, wrapperClassName },
  _ref
) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
})
