import { cn } from '@/shared/utils/cn'

/**
 * Toggle / Switch component.
 * Used for on/off states (Is Active, comparison period, etc.).
 * The track element uses dir="ltr" so the thumb animation is always left→right,
 * even in RTL (Arabic) layouts — matching iOS/Android conventions.
 *
 * Props:
 *   checked   – boolean
 *   onChange  – called with the new boolean value (not a DOM event)
 *   label     – optional text label rendered beside the switch
 *   disabled  – disables interaction
 *   className – extra classes on the wrapper
 */
export function Toggle({ checked = false, onChange, label, disabled = false, className }) {
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
    // dir="ltr" keeps the whole toggle layout and thumb direction consistent
    // regardless of the document's text direction
    <div
      dir="ltr"
      className={cn(
        'inline-flex items-center gap-2.5 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      onClick={handleToggle}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-border hover:bg-text-muted/30'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
            'transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          )}
        />
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </div>
  )
}
