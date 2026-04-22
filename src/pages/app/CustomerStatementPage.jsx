import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ExternalLink, Printer } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { useCustomerStatement } from '@/features/customers/hooks/useCustomers'
import { ROUTES } from '@/shared/constants/routes'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'

function SummaryCard({ label, value }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-text-primary">{value}</p>
    </div>
  )
}

function TransactionTypeCell({ type, label }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        type === 'invoice'
          ? 'bg-primary/10 text-primary'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      ].join(' ')}
    >
      {label}
    </span>
  )
}

export default function CustomerStatementPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  const { data, isLoading, isError, refetch } = useCustomerStatement(id, { page, limit: 20 })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data) return null

  const { customer, summary, transactions, pagination } = data
  const currency = transactions[0]?.currency ?? 'EGP'

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('customers.statement')}
        subtitle={customer.name}
        breadcrumbs={[
          { label: t('customers.title'), href: ROUTES.CUSTOMERS },
          { label: customer.name, href: ROUTES.CUSTOMER_DETAIL(customer._id) },
          { label: t('customers.statement') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.CUSTOMER_STATEMENT_PRINT(customer._id))}
            >
              <Printer size={14} className="me-1" />
              {t('invoices.print')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.CUSTOMER_DETAIL(customer._id))}>
              <ArrowLeft size={14} className="me-1" />
              {t('common.back')}
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-text-muted mb-1">{t('common.name')}</p>
            <p className="text-text-primary">{customer.name}</p>
          </div>
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
        </div>
      </Card>

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

      {transactions.length === 0 ? (
        <EmptyState
          title={t('customers.statementEmptyTitle')}
          description={t('customers.statementEmptyDesc')}
        />
      ) : (
        <Card>
          <div className="px-4 py-3 border-b border-border bg-surface-subtle">
            <h3 className="text-sm font-semibold text-text-primary">{t('customers.statementTable')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-text-muted text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-start">{t('common.date')}</th>
                  <th className="px-4 py-3 text-start">{t('customers.transactionType')}</th>
                  <th className="px-4 py-3 text-start">{t('customers.reference')}</th>
                  <th className="px-4 py-3 text-end">{t('common.debit')}</th>
                  <th className="px-4 py-3 text-end">{t('common.credit')}</th>
                  <th className="px-4 py-3 text-end">{t('common.balance')}</th>
                  <th className="px-4 py-3 text-end">{t('common.view')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.journalEntryId || `${transaction.type}-${transaction.invoiceId}-${transaction.date}-${index}`}
                    className="hover:bg-surface-subtle transition-colors"
                  >
                    <td className="px-4 py-3 text-text-secondary tabular-nums">
                      {formatDate(transaction.date, i18n.language)}
                    </td>
                    <td className="px-4 py-3">
                      <TransactionTypeCell
                        type={transaction.type}
                        label={transaction.type === 'invoice' ? t('customers.statementInvoice') : t('customers.statementPayment')}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{transaction.reference}</td>
                    <td className="px-4 py-3 text-end tabular-nums">
                      {formatCurrency(transaction.debit, currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-end tabular-nums">
                      {formatCurrency(transaction.credit, currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums">
                      {formatCurrency(transaction.runningBalance, currency, locale)}
                    </td>
                    <td className="px-4 py-3 text-end">
                      {transaction.invoiceId ? (
                        <Link
                          to={ROUTES.INVOICE_DETAIL(transaction.invoiceId)}
                          className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors inline-flex"
                          title={t('common.view')}
                        >
                          <ExternalLink size={14} />
                        </Link>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination?.totalPages > 1 && (
            <div className="border-t border-border px-4 py-3">
              <PaginationControls
                pagination={pagination}
                onPageChange={setPage}
                className="mt-0"
              />
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
