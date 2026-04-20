import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/Button'

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, isLoading, confirmLabel, confirmVariant = 'danger' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-surface rounded-xl border border-border shadow-elevated w-full max-w-sm p-6 animate-slide-up">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-error-soft flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-error" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
            <p className="text-sm text-text-secondary">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel || 'تأكيد'}
          </Button>
        </div>
      </div>
    </div>
  )
}
