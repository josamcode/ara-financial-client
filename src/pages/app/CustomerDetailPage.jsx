import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import { useCustomerDetail } from '@/features/customers/hooks/useCustomers'
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

export default function CustomerDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  const { data, isLoading, isError, refetch } = useCustomerDetail(id)

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return null

  const { customer, invoices, summary } = data
  const currency = invoices[0]?.currency ?? 'EGP'

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: t('customers.title'), href: ROUTES.CUSTOMERS },
          { label: customer.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate(ROUTES.CUSTOMER_STATEMENT(id))}>
              <FileText size={14} className="me-1" />
              {t('customers.openStatement')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.CUSTOMERS)}>
              <ArrowLeft size={14} className="me-1" />
              {t('common.back')}
            </Button>
          </div>
        }
      />

      {/* Customer info */}
      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {customer.email && (
            <div>
              <p className="text-text-muted mb-1">{t('common.email')}</p>
              <p className="text-text-primary">{customer.email}</p>
            </div>
          )}
          {customer.phone && (
            <div>
              <p className="text-text-muted mb-1">{t('common.phone')}</p>
              <p className="text-text-primary">{customer.phone}</p>
            </div>
          )}
          {customer.address && (
            <div>
              <p className="text-text-muted mb-1">{t('customers.address')}</p>
              <p className="text-text-primary">{customer.address}</p>
            </div>
          )}
          {customer.notes && (
            <div>
              <p className="text-text-muted mb-1">{t('common.notes')}</p>
              <p className="text-text-secondary">{customer.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label={t('customers.totalInvoiced')}
          value={formatCurrency(summary.totalInvoiced, currency, locale)}
        />
        <SummaryCard
          label={t('customers.totalPaid')}
          value={formatCurrency(summary.totalPaid, currency, locale)}
        />
        <SummaryCard
          label={t('customers.outstandingBalance')}
          value={formatCurrency(summary.outstandingBalance, currency, locale)}
        />
      </div>

      {/* Invoices table */}
      {invoices.length === 0 ? (
        <EmptyState
          title={t('customers.noInvoices')}
          description={t('customers.noInvoicesDesc')}
        />
      ) : (
        <Card>
          <div className="px-4 py-3 border-b border-border bg-surface-subtle">
            <h3 className="text-sm font-semibold text-text-primary">{t('nav.invoices')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-text-muted text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-start">{t('invoices.number')}</th>
                  <th className="px-4 py-3 text-start">{t('invoices.issueDate')}</th>
                  <th className="px-4 py-3 text-start">{t('invoices.dueDate')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end">{t('invoices.total')}</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums">
                      {formatDate(inv.issueDate, i18n.language)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary tabular-nums">
                      {formatDate(inv.dueDate, i18n.language)}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums">
                      {formatCurrency(inv.total.$numberDecimal, inv.currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Link
                        to={ROUTES.INVOICE_DETAIL(inv._id)}
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
