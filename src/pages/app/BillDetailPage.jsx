import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { ROUTES } from '@/shared/constants/routes'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { useBill } from '@/features/bills/hooks/useBills'
import { BillStatusBadge } from '@/features/bills/components/BillStatusBadge'

export default function BillDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  const { data: bill, isLoading, isError, refetch } = useBill(id)

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!bill) return null

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <PageHeader
        title={bill.billNumber}
        breadcrumbs={[
          { label: t('nav.bills'), href: ROUTES.BILLS },
          { label: bill.billNumber },
        ]}
        actions={<BillStatusBadge status={bill.status} />}
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <p className="mb-1 text-text-muted">{t('bills.supplier')}</p>
              <p className="font-medium text-text-primary">{bill.supplierName}</p>
              {bill.supplierEmail && (
                <p className="text-xs text-text-secondary">{bill.supplierEmail}</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.issueDate')}</p>
              <p className="font-medium tabular-nums">{formatDate(bill.issueDate, i18n.language)}</p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.dueDate')}</p>
              <p className="font-medium tabular-nums">{formatDate(bill.dueDate, i18n.language)}</p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.currency')}</p>
              <p className="font-medium text-text-primary">{bill.currency}</p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.total')}</p>
              <p className="text-lg font-semibold tabular-nums text-text-primary">
                {formatCurrency(bill.total, bill.currency, locale)}
              </p>
            </div>
          </div>

          {bill.notes && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-1 text-xs text-text-muted">{t('common.notes')}</p>
              <p className="text-sm text-text-secondary">{bill.notes}</p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-subtle px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">{t('bills.lineItems')}</h3>
          </div>
          <div className="divide-y divide-border">
            {(bill.lineItems ?? []).map((item) => (
              <div key={item._id} className="grid grid-cols-[1fr_5rem_6rem_6rem] gap-3 px-4 py-3 text-sm">
                <span className="text-text-primary">{item.description}</span>
                <span className="text-end tabular-nums text-text-secondary">{item.quantity}</span>
                <span className="text-end tabular-nums text-text-secondary">{item.unitPrice}</span>
                <span className="text-end font-medium tabular-nums">{item.lineTotal}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-border px-4 py-3">
            <div className="w-48 space-y-1 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>{t('bills.subtotal')}</span>
                <span className="tabular-nums">{formatCurrency(bill.subtotal, bill.currency, locale)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold text-text-primary">
                <span>{t('bills.total')}</span>
                <span className="tabular-nums">{formatCurrency(bill.total, bill.currency, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
