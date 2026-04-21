import { useTranslation } from 'react-i18next'
import { Eye, Trash2 } from 'lucide-react'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'

export function InvoiceList({ invoices, onView, onDelete }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  if (!invoices?.length) return null

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[6rem_1fr_1fr_6rem_7rem_5rem_5rem] items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-subtle">
        <span className="text-xs font-semibold text-text-muted">{t('invoices.number')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('invoices.customer')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('invoices.dueDate')}</span>
        <span className="text-xs font-semibold text-text-muted text-end">{t('invoices.total')}</span>
        <span className="text-xs font-semibold text-text-muted text-center">{t('common.status')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('common.date')}</span>
        <span className="w-16" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {invoices.map((invoice) => (
          <div
            onClick={() => onView?.(invoice)}
            key={invoice._id}
            className="group grid grid-cols-[1fr_auto] sm:grid-cols-[6rem_1fr_1fr_6rem_7rem_5rem_5rem] items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors cursor-pointer"
          >
            {/* Mobile stacked */}
            <div className="sm:contents">
              <span className="text-xs font-mono text-gray-400 hidden sm:block">
                {invoice.invoiceNumber}
              </span>

              {/* Customer */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{invoice.customerName}</p>
                {invoice.customerEmail && (
                  <p className="text-xs text-text-muted truncate hidden sm:block">{invoice.customerEmail}</p>
                )}
                {/* Mobile: number + status inline */}
                <div className="flex items-center gap-2 sm:hidden mt-0.5">
                  <span className="text-xs font-mono text-gray-400">{invoice.invoiceNumber}</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </div>

              <span className="text-xs text-text-secondary tabular-nums hidden sm:block">
                {formatDate(invoice.dueDate, i18n.language)}
              </span>

              <span className="text-xs font-medium text-text-primary text-end tabular-nums hidden sm:block">
                {formatCurrency(invoice.total, invoice.currency, locale)}
              </span>

              <span className="hidden sm:flex justify-center">
                <InvoiceStatusBadge status={invoice.status} />
              </span>

              <span className="text-xs text-text-muted tabular-nums hidden sm:block">
                {formatDate(invoice.issueDate, i18n.language)}
              </span>
            </div>

            {/* Mobile total */}
            <div className="flex flex-col items-end gap-1 sm:hidden">
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                {formatCurrency(invoice.total, invoice.currency, locale)}
              </span>
              <span className="text-xs text-text-muted">{formatDate(invoice.dueDate, i18n.language)}</span>
            </div>

            {/* Actions */}
            <div className="hidden sm:flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onView?.(invoice)}
                className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                title={t('common.view')}
              >
                <Eye size={14} />
              </button>
              <PermissionGate permission={PERMISSIONS.INVOICE_DELETE}>
                {invoice.status === 'draft' && (
                  <button
                    onClick={() => onDelete?.(invoice)}
                    className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </PermissionGate>
            </div>

            {/* Mobile view button */}
            <button
              onClick={() => onView?.(invoice)}
              className="sm:hidden p-1.5 rounded text-text-muted hover:text-primary"
            >
              <Eye size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
