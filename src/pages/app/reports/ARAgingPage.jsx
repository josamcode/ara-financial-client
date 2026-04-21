import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock3, FileText, RefreshCw } from 'lucide-react'
import { DatePresets } from '@/shared/components/DatePresets'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { useARAging } from '@/features/reports/hooks/useReports'
import { ROUTES } from '@/shared/constants/routes'
import { formatDate, formatNumber } from '@/shared/utils/formatters'

const INPUT_CLASS =
  'h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus'

function getTodayDateValue() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-text-primary">{value}</p>
    </div>
  )
}

export default function ARAgingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  const [asOfDate, setAsOfDate] = useState(() => getTodayDateValue())
  const [appliedParams, setAppliedParams] = useState(() => ({ asOfDate: getTodayDateValue() }))

  const query = useARAging(appliedParams)
  const reportData = query.data?.data
  const summary = reportData?.summary
  const rows = reportData?.rows || []
  const hasData = rows.length > 0

  function handleSubmit(event) {
    event.preventDefault()
    if (!asOfDate) return
    setAppliedParams({ asOfDate })
  }

  return (
    <div className="animate-fade-in space-y-4">
      <button
        type="button"
        onClick={() => navigate(ROUTES.REPORTS)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        {t('reports.title')}
      </button>

      <PageHeader
        title={t('reports.arAging')}
        subtitle={t('reports.arAgingSubtitle')}
      />

      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-border p-4 space-y-3"
      >
        <DatePresets
          mode="asOf"
          onApply={({ asOfDate: value }) => {
            setAsOfDate(value)
            setAppliedParams({ asOfDate: value })
          }}
        />

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted">
              {t('reports.asOfDate')}
              <span className="text-error ms-0.5">*</span>
            </label>
            <input
              type="date"
              required
              value={asOfDate}
              onChange={(event) => setAsOfDate(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <Button type="submit" size="sm" isLoading={query.isFetching} disabled={!asOfDate}>
            {t('reports.generate')}
          </Button>

          {hasData && (
            <button
              type="button"
              onClick={() => query.refetch()}
              title={t('reports.refreshData')}
              className="inline-flex items-center gap-1.5 h-button-sm px-3 text-sm text-text-muted border border-border rounded-md bg-surface hover:bg-surface-muted transition-colors"
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </form>

      {reportData?.asOfDate && (
        <p className="text-xs text-text-muted">
          {t('reports.asOfDate')}: {formatDate(reportData.asOfDate, i18n.language)}
        </p>
      )}

      {query.isLoading && <LoadingState message={t('common.loading')} />}

      {query.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          message={query.error?.message}
          onRetry={() => query.refetch()}
        />
      )}

      {!query.isLoading && !query.isError && !hasData && (
        <EmptyState
          icon={Clock3}
          title={t('reports.arAging')}
          message={t('common.noData')}
        />
      )}

      {!query.isLoading && !query.isError && hasData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label={t('reports.totalOutstanding')}
              value={formatNumber(summary?.totalOutstanding, locale)}
            />
            <SummaryCard
              label={t('reports.customersWithOutstanding')}
              value={formatNumber(summary?.customersWithOutstanding, locale, 0)}
            />
            <SummaryCard
              label={t('reports.overdueInvoicesCount')}
              value={formatNumber(summary?.overdueInvoicesCount, locale, 0)}
            />
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[52rem]">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle text-text-muted text-xs font-semibold uppercase tracking-wide">
                    <th className="px-4 py-3 text-start">{t('invoices.customer')}</th>
                    <th className="px-4 py-3 text-end">{t('reports.aging0To30')}</th>
                    <th className="px-4 py-3 text-end">{t('reports.aging31To60')}</th>
                    <th className="px-4 py-3 text-end">{t('reports.aging61To90')}</th>
                    <th className="px-4 py-3 text-end">{t('reports.aging90Plus')}</th>
                    <th className="px-4 py-3 text-end">{t('reports.totalOutstanding')}</th>
                    <th className="px-4 py-3 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr
                      key={row.customerId || row.customerName}
                      className="hover:bg-surface-subtle transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{row.customerName}</td>
                      <td className="px-4 py-3 text-end tabular-nums text-text-secondary">
                        {formatNumber(row.days0_30, locale)}
                      </td>
                      <td className="px-4 py-3 text-end tabular-nums text-text-secondary">
                        {formatNumber(row.days31_60, locale)}
                      </td>
                      <td className="px-4 py-3 text-end tabular-nums text-text-secondary">
                        {formatNumber(row.days61_90, locale)}
                      </td>
                      <td className="px-4 py-3 text-end tabular-nums text-text-secondary">
                        {formatNumber(row.days90Plus, locale)}
                      </td>
                      <td className="px-4 py-3 text-end tabular-nums font-semibold text-text-primary">
                        {formatNumber(row.totalOutstanding, locale)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {row.customerId ? (
                          <Link
                            to={ROUTES.CUSTOMER_STATEMENT(row.customerId)}
                            className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors inline-flex"
                            title={t('customers.openStatement')}
                          >
                            <FileText size={14} />
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
          </Card>
        </div>
      )}
    </div>
  )
}
