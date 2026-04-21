import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { BillStatusBadge } from '@/features/bills/components/BillStatusBadge'
import { useSupplierDetail } from '@/features/suppliers/hooks/useSuppliers'
import { ROUTES } from '@/shared/constants/routes'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'

function SummaryCard({ label, value }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-text-primary">{value}</p>
    </div>
  )
}

export default function SupplierDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  const { data, isLoading, isError, refetch } = useSupplierDetail(id)

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return null

  const { supplier, bills, summary } = data
  const currency = bills[0]?.currency ?? 'EGP'

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        breadcrumbs={[
          { label: t('suppliers.title'), href: ROUTES.SUPPLIERS },
          { label: supplier.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate(ROUTES.SUPPLIER_STATEMENT(id))}>
              <FileText size={14} className="me-1" />
              {t('suppliers.openStatement')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.SUPPLIERS)}>
              <ArrowLeft size={14} className="me-1" />
              {t('common.back')}
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {supplier.email && (
            <div>
              <p className="text-text-muted mb-1">{t('common.email')}</p>
              <p className="text-text-primary">{supplier.email}</p>
            </div>
          )}
          {supplier.phone && (
            <div>
              <p className="text-text-muted mb-1">{t('common.phone')}</p>
              <p className="text-text-primary">{supplier.phone}</p>
            </div>
          )}
          {supplier.address && (
            <div>
              <p className="text-text-muted mb-1">{t('suppliers.address')}</p>
              <p className="text-text-primary">{supplier.address}</p>
            </div>
          )}
          {supplier.notes && (
            <div>
              <p className="text-text-muted mb-1">{t('common.notes')}</p>
              <p className="text-text-secondary">{supplier.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label={t('suppliers.totalBilled')}
          value={formatCurrency(summary.totalBilled, currency, locale)}
        />
        <SummaryCard
          label={t('suppliers.totalPaid')}
          value={formatCurrency(summary.totalPaid, currency, locale)}
        />
        <SummaryCard
          label={t('suppliers.outstandingBalance')}
          value={formatCurrency(summary.outstandingBalance, currency, locale)}
        />
      </div>

      {bills.length === 0 ? (
        <EmptyState
          title={t('suppliers.noBills')}
          description={t('suppliers.noBillsDesc')}
        />
      ) : (
        <Card>
          <div className="px-4 py-3 border-b border-border bg-surface-subtle">
            <h3 className="text-sm font-semibold text-text-primary">{t('nav.bills')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-text-muted text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-start">{t('bills.number')}</th>
                  <th className="px-4 py-3 text-start">{t('bills.issueDate')}</th>
                  <th className="px-4 py-3 text-start">{t('bills.dueDate')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end">{t('bills.total')}</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{bill.billNumber}</td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums">
                      {formatDate(bill.issueDate, i18n.language)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums">
                      {formatDate(bill.dueDate, i18n.language)}
                    </td>
                    <td className="px-4 py-3">
                      <BillStatusBadge status={bill.status} />
                    </td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums">
                      {formatCurrency(bill.total, bill.currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Link
                        to={ROUTES.BILL_DETAIL(bill._id)}
                        className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors inline-flex"
                        title={t('common.view')}
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
