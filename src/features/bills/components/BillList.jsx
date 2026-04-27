import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { Checkbox } from '@/shared/components/Checkbox'
import { BillStatusBadge } from './BillStatusBadge'
import { cn } from '@/shared/utils/cn'

export function BillList({ bills, selectedIds = [], onToggleSelect, onView }) {
  const { t, i18n } = useTranslation()

  if (!bills?.length) return null

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[2.5rem_5.5rem_1fr_1fr_5.5rem_7rem_4rem] items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-muted">
        <span />
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('bills.number')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('bills.supplier')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('bills.dueDate')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-end">{t('bills.total')}</span>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-center">{t('common.status')}</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {bills.map((bill) => {
          const isSelected = selectedIds.includes(bill._id)
          return (
            <div
              key={bill._id}
              onClick={() => onView?.(bill)}
              className={cn(
                'group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-2 px-4 py-2.5 transition-colors',
                'sm:grid-cols-[2.5rem_5.5rem_1fr_1fr_5.5rem_7rem_4rem]',
                isSelected ? 'bg-primary-50 hover:bg-primary-50' : 'hover:bg-surface-muted'
              )}
            >
              {/* Checkbox desktop */}
              <div className="hidden sm:flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onChange={(checked) => onToggleSelect?.(bill._id, checked)}
                  ariaLabel={t('common.selectRow', { value: bill.billNumber })}
                  className="gap-0"
                />
              </div>

              {/* Bill number — desktop */}
              <span className="hidden sm:block text-xs font-mono font-semibold text-text-secondary truncate">
                {bill.billNumber}
              </span>

              {/* Supplier — main cell */}
              <div className="min-w-0">
                <div className="flex items-start gap-2.5 sm:block">
                  {/* Checkbox mobile */}
                  <div className="sm:hidden shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(checked) => onToggleSelect?.(bill._id, checked)}
                      ariaLabel={t('common.selectRow', { value: bill.billNumber })}
                      className="gap-0"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">{bill.supplierName}</p>
                    {bill.supplierEmail && (
                      <p className="text-xs text-text-muted truncate hidden sm:block mt-0.5">{bill.supplierEmail}</p>
                    )}
                    {/* Mobile: number + status */}
                    <div className="flex items-center gap-2 sm:hidden mt-0.5">
                      <span className="text-xs font-mono text-text-muted">{bill.billNumber}</span>
                      <BillStatusBadge status={bill.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Due date — desktop */}
              <span className="hidden sm:block text-xs text-text-secondary tabular-nums">
                {formatDate(bill.dueDate, i18n.language)}
              </span>

              {/* Amount */}
              <span className="hidden sm:block text-sm font-bold text-text-primary text-end tabular-nums">
                {formatCurrency(bill.total, bill.currency, 'en')}
              </span>

              {/* Status — desktop */}
              <span className="hidden sm:flex justify-center">
                <BillStatusBadge status={bill.status} />
              </span>

              {/* Mobile: total + date */}
              <div className="flex flex-col items-end gap-1 sm:hidden shrink-0">
                <span className="text-sm font-bold text-text-primary tabular-nums">
                  {formatCurrency(bill.total, bill.currency, 'en')}
                </span>
                <span className="text-xs text-text-muted">{formatDate(bill.dueDate, i18n.language)}</span>
              </div>

              {/* Actions desktop — revealed on hover */}
              <div className="hidden sm:flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onView?.(bill) }}
                  className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  title={t('common.view')}
                >
                  <Eye size={13} />
                </button>
              </div>

              {/* Actions mobile */}
              <button
                onClick={(e) => { e.stopPropagation(); onView?.(bill) }}
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
