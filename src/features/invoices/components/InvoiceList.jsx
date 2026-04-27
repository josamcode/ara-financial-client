import { useTranslation } from 'react-i18next'
import { Eye, Trash2 } from 'lucide-react'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'
import { Checkbox } from '@/shared/components/Checkbox'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { cn } from '@/shared/utils/cn'

export function InvoiceList({ invoices, selectedIds = [], onToggleSelect, onView, onDelete }) {
  const { t, i18n } = useTranslation()

  if (!invoices?.length) return null

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[2.5rem_5.5rem_1fr_1fr_5.5rem_7rem_4.5rem_4rem] items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-muted">
        <span />
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('invoices.number')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('invoices.customer')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('invoices.dueDate')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-end">{t('invoices.total')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-center">{t('common.status')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('invoices.issueDate')}</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {invoices.map((invoice) => {
          const isSelected = selectedIds.includes(invoice._id)
          return (
            <div
              key={invoice._id}
              onClick={() => onView?.(invoice)}
              className={cn(
                'group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-2 px-4 py-2.5 transition-colors',
                'sm:grid-cols-[2.5rem_5.5rem_1fr_1fr_5.5rem_7rem_4.5rem_4rem]',
                isSelected ? 'bg-primary-50 hover:bg-primary-50' : 'hover:bg-surface-muted'
              )}
            >
              {/* Checkbox desktop */}
              <div className="hidden sm:flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onChange={(checked) => onToggleSelect?.(invoice._id, checked)}
                  ariaLabel={t('common.selectRow', { value: invoice.invoiceNumber })}
                  className="gap-0"
                />
              </div>

              {/* Invoice number — desktop */}
              <span className="hidden sm:block text-xs font-mono font-semibold text-text-secondary truncate">
                {invoice.invoiceNumber}
              </span>

              {/* Customer — main cell */}
              <div className="min-w-0">
                <div className="flex items-start gap-2.5 sm:block">
                  {/* Checkbox mobile */}
                  <div className="sm:hidden shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(checked) => onToggleSelect?.(invoice._id, checked)}
                      ariaLabel={t('common.selectRow', { value: invoice.invoiceNumber })}
                      className="gap-0"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">{invoice.customerName}</p>
                    {invoice.customerEmail && (
                      <p className="text-xs text-text-muted truncate hidden sm:block mt-0.5">{invoice.customerEmail}</p>
                    )}
                    {/* Mobile: number + status */}
                    <div className="flex items-center gap-2 sm:hidden mt-0.5">
                      <span className="text-xs font-mono text-text-muted">{invoice.invoiceNumber}</span>
                      <InvoiceStatusBadge status={invoice.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Due date — desktop */}
              <span className="hidden sm:block text-xs text-text-secondary tabular-nums">
                {formatDate(invoice.dueDate, i18n.language)}
              </span>

              {/* Amount */}
              <span className="hidden sm:block text-sm font-bold text-text-primary text-end tabular-nums">
                {formatCurrency(invoice.total, invoice.currency, 'en')}
              </span>

              {/* Status — desktop */}
              <span className="hidden sm:flex justify-center">
                <InvoiceStatusBadge status={invoice.status} />
              </span>

              {/* Issue date — desktop */}
              <span className="hidden sm:block text-xs text-text-muted tabular-nums">
                {formatDate(invoice.issueDate, i18n.language)}
              </span>

              {/* Mobile: total + date */}
              <div className="flex flex-col items-end gap-1 sm:hidden shrink-0">
                <span className="text-sm font-bold text-text-primary tabular-nums">
                  {formatCurrency(invoice.total, invoice.currency, 'en')}
                </span>
                <span className="text-xs text-text-muted">{formatDate(invoice.dueDate, i18n.language)}</span>
              </div>

              {/* Actions — desktop, revealed on hover */}
              <div className="hidden sm:flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onView?.(invoice) }}
                  className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  title={t('common.view')}
                >
                  <Eye size={13} />
                </button>
                <PermissionGate permission={PERMISSIONS.INVOICE_DELETE}>
                  {invoice.status === 'draft' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete?.(invoice) }}
                      className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </PermissionGate>
              </div>

              {/* Actions — mobile */}
              <button
                onClick={(e) => { e.stopPropagation(); onView?.(invoice) }}
                className="sm:hidden p-1.5 rounded text-text-muted hover:text-primary"
              >
                <Eye size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
