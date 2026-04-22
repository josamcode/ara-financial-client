import { Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

/**
 * Custom Checkbox component.
 * Replaces native <input type="checkbox"> with a styled, accessible alternative.
 *
 * Props:
 *   checked   – boolean
 *   onChange  – called with the new boolean value (not a DOM event)
 *   label     – optional text label rendered beside the checkbox
 *   disabled  – disables interaction
 *   error     – shows error message below
 *   className – extra classes on the wrapper
 */
export function Checkbox({ checked = false, onChange, label, ariaLabel, disabled = false, error, className }) {
  function handleToggle() {
    if (!disabled) onChange?.(!checked)
  }

  function handleKeyDown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label
        className={cn(
          'flex items-center gap-2.5 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-[18px] h-[18px] rounded shrink-0 border-2 flex items-center justify-center',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            checked
              ? 'bg-primary border-primary'
              : 'bg-surface border-input hover:border-primary',
            error && !checked && 'border-error'
          )}
        >
          {checked && <Check size={11} strokeWidth={3} className="text-white" />}
        </button>
        {label && <span className="text-sm text-text-primary">{label}</span>}
      </label>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
