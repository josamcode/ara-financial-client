import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const widths = {
  sm: 'w-80',
  md: 'w-[420px]',
  lg: 'w-[520px]',
  xl: 'w-[640px]',
}

export function SlidePanel({ open, onClose, title, children, footer, width = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — always on the inline-end side */}
      <div
        className={cn(
          'relative ms-auto h-full bg-surface border-s border-border',
          'flex flex-col shadow-elevated animate-slide-up',
          'max-w-[calc(100vw-2rem)]',
          widths[width]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-border bg-surface-subtle shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
