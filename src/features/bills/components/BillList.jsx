import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { BillStatusBadge } from './BillStatusBadge'

export function BillList({ bills, onView }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  if (!bills?.length) return null

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="hidden grid-cols-[6.5rem_1fr_1fr_6rem_7rem_5rem] items-center gap-3 border-b border-border bg-surface-subtle px-4 py-2.5 sm:grid">
        <span className="text-xs font-semibold text-text-muted">{t('bills.number')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('bills.supplier')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('bills.dueDate')}</span>
        <span className="text-end text-xs font-semibold text-text-muted">{t('bills.total')}</span>
        <span className="text-center text-xs font-semibold text-text-muted">{t('common.status')}</span>
        <span className="w-16" />
      </div>

      <div className="divide-y divide-border">
        {bills.map((bill) => (
          <div
            key={bill._id}
            onClick={() => onView?.(bill)}
            className="group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted sm:grid-cols-[6.5rem_1fr_1fr_6rem_7rem_5rem]"
          >
            <div className="sm:contents">
              <span className="hidden text-xs font-mono text-gray-400 sm:block">
                {bill.billNumber}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{bill.supplierName}</p>
                {bill.supplierEmail && (
                  <p className="hidden truncate text-xs text-text-muted sm:block">{bill.supplierEmail}</p>
                )}
                <div className="mt-0.5 flex items-center gap-2 sm:hidden">
                  <span className="text-xs font-mono text-gray-400">{bill.billNumber}</span>
                  <BillStatusBadge status={bill.status} />
                </div>
              </div>

              <span className="hidden text-xs tabular-nums text-text-secondary sm:block">
                {formatDate(bill.dueDate, i18n.language)}
              </span>

              <span className="hidden text-end text-xs font-medium tabular-nums text-text-primary sm:block">
                {formatCurrency(bill.total, bill.currency, locale)}
              </span>

              <span className="hidden justify-center sm:flex">
                <BillStatusBadge status={bill.status} />
              </span>
            </div>

            <div className="flex flex-col items-end gap-1 sm:hidden">
              <span className="text-sm font-semibold tabular-nums text-text-primary">
                {formatCurrency(bill.total, bill.currency, locale)}
              </span>
              <span className="text-xs text-text-muted">{formatDate(bill.dueDate, i18n.language)}</span>
            </div>

            <div className="hidden items-center justify-end opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
              <button
                onClick={() => onView?.(bill)}
                className="rounded p-1.5 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                title={t('common.view')}
              >
                <Eye size={14} />
              </button>
            </div>

            <button
              onClick={() => onView?.(bill)}
              className="rounded p-1.5 text-text-muted hover:text-primary sm:hidden"
            >
              <Eye size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
