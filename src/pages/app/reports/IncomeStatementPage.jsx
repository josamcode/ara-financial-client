import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, RefreshCw } from 'lucide-react'
import { Toggle } from '@/shared/components/Toggle'
import { DatePresets } from '@/shared/components/DatePresets'
import { useIncomeStatement } from '@/features/reports/hooks/useReports'
import { reportApi } from '@/entities/report/api/reportApi'
import { ExportMenu, downloadBlob } from '@/features/reports/components/ExportMenu'
import { ReportSection } from '@/features/reports/components/ReportSection'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { ROUTES } from '@/shared/constants/routes'
import { formatNumber, formatDate } from '@/shared/utils/formatters'

const INPUT_CLASS =
  'h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus'

export default function IncomeStatementPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'
  const locale = isAr ? 'ar-EG' : 'en-US'

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [compareStartDate, setCompareStartDate] = useState('')
  const [compareEndDate, setCompareEndDate] = useState('')
  const [appliedParams, setAppliedParams] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  const query = useIncomeStatement(appliedParams)
  const reportData = query.data?.data
  const revenue = reportData?.revenue || []
  const expenses = reportData?.expenses || []
  const totals = reportData?.totals
  const period = reportData?.period
  const comparison = reportData?.comparison
  const hasData = revenue.length > 0 || expenses.length > 0
  const showCompCols = !!comparison

  function handleSubmit(e) {
    e.preventDefault()
    if (!startDate || !endDate) return
    const params = { startDate, endDate }
    if (showComparison && compareStartDate) params.compareStartDate = compareStartDate
    if (showComparison && compareEndDate) params.compareEndDate = compareEndDate
    setAppliedParams(params)
  }

  async function handleExport(format) {
    if (!appliedParams) return
    setIsExporting(true)
    try {
      const blob = await reportApi.exportIncomeStatement({ ...appliedParams, format })
      downloadBlob(blob, `income-statement.${format === 'excel' ? 'xlsx' : format}`)
    } finally {
      setIsExporting(false)
    }
  }

  const sectionProps = { showComparison: showCompCols, isAr, locale }

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(ROUTES.REPORTS)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors mb-2"
      >
        <ArrowLeft size={14} />
        {t('reports.title')}
      </button>

      <PageHeader
        title={t('reports.incomeStatement')}
        subtitle={t('reports.incomeStatementSubtitle')}
      />

      {/* Filter card */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-border p-4 mb-5 space-y-3"
      >
        <DatePresets
          mode="range"
          onApply={({ startDate: s, endDate: e }) => {
            setStartDate(s)
            setEndDate(e)
            setAppliedParams({ startDate: s, endDate: e })
          }}
        />

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted">
              {t('reports.startDate')}
              <span className="text-error ms-0.5">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted">
              {t('reports.endDate')}
              <span className="text-error ms-0.5">*</span>
            </label>
            <input
              type="date"
              required
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <Button type="submit" size="sm" isLoading={query.isFetching} disabled={!startDate || !endDate}>
            {t('reports.generate')}
          </Button>

          {hasData && (
            <ExportMenu onExport={handleExport} isExporting={isExporting} disabled={!hasData} />
          )}

          {appliedParams && hasData && (
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

        {/* Comparison toggle */}
        <Toggle
          checked={showComparison}
          onChange={setShowComparison}
          label={t('reports.enableComparison')}
        />

        {showComparison && (
          <div className="flex flex-wrap items-end gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted">{t('reports.compareStartDate')}</label>
              <input
                type="date"
                value={compareStartDate}
                onChange={(e) => setCompareStartDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted">{t('reports.compareEndDate')}</label>
              <input
                type="date"
                value={compareEndDate}
                min={compareStartDate || undefined}
                onChange={(e) => setCompareEndDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        )}
      </form>

      {/* Period label */}
      {period && (
        <p className="text-xs text-text-muted mb-3">
          {formatDate(period.startDate, i18n.language)} —{' '}
          {formatDate(period.endDate, i18n.language)}
        </p>
      )}

      {/* States */}
      {!appliedParams && (
        <EmptyState
          icon={TrendingUp}
          title={t('reports.incomeStatement')}
          message={t('reports.selectPeriodFirst')}
        />
      )}

      {appliedParams && query.isLoading && <LoadingState message={t('common.loading')} />}

      {appliedParams && query.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          message={query.error?.message}
          onRetry={() => query.refetch()}
        />
      )}

      {appliedParams && !query.isLoading && !query.isError && !hasData && (
        <EmptyState
          icon={TrendingUp}
          title={t('reports.incomeStatement')}
          message={t('common.noData')}
        />
      )}

      {appliedParams && !query.isLoading && !query.isError && hasData && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {/* Column headers */}
          <div
            className={`grid ${showCompCols ? 'grid-cols-[5rem_1fr_10rem_10rem_9rem]' : 'grid-cols-[5rem_1fr_10rem]'} px-4 py-2.5 border-b border-border bg-surface-subtle text-xs font-semibold text-text-muted`}
          >
            <span>{t('reports.accountCode')}</span>
            <span>{t('reports.accountName')}</span>
            <span className="text-end">{t('common.balance')}</span>
            {showCompCols && (
              <>
                <span className="text-end">{t('reports.comparisonBalance')}</span>
                <span className="text-end">{t('reports.variance')}</span>
              </>
            )}
          </div>

          {/* Revenue section */}
          <ReportSection
            title={t('reports.revenue')}
            rows={revenue}
            subtotalLabel={t('reports.totalRevenue')}
            subtotalValue={totals?.totalRevenue}
            comparisonSubtotal={comparison?.totals?.totalRevenue}
            deltaSubtotal={comparison?.delta?.totalRevenue}
            {...sectionProps}
          />

          {/* Expenses section */}
          <ReportSection
            title={t('reports.expenses')}
            rows={expenses}
            subtotalLabel={t('reports.totalExpenses')}
            subtotalValue={totals?.totalExpenses}
            comparisonSubtotal={comparison?.totals?.totalExpenses}
            deltaSubtotal={comparison?.delta?.totalExpenses}
            {...sectionProps}
          />

          {/* Net income / loss summary */}
          {totals && (
            <div className="px-4 py-4 border-t-2 border-border bg-surface-subtle">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-text-primary">
                  {totals.isProfit ? t('reports.netIncome') : t('reports.netLoss')}
                </span>
                <span
                  className={[
                    'text-lg font-bold tabular-nums',
                    totals.isProfit ? 'text-success' : 'text-error',
                  ].join(' ')}
                >
                  {formatNumber(totals.netIncome, locale)}
                </span>
              </div>
              {showCompCols && comparison?.totals && (
                <div className="flex items-center justify-between mt-1 text-sm text-text-muted">
                  <span>{t('reports.comparisonBalance')}</span>
                  <span className="tabular-nums">
                    {formatNumber(comparison.totals.netIncome, locale)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
