import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Waves, RefreshCw } from 'lucide-react'
import { useCashFlow } from '@/features/reports/hooks/useReports'
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

function SummaryRow({ label, value, comparison, showComparison, locale, bold, className }) {
  return (
    <div
      className={[
        'flex items-center justify-between py-2 text-sm',
        bold ? 'font-semibold' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="text-text-primary">{label}</span>
      <div className="flex items-center gap-6">
        {showComparison && comparison !== undefined && (
          <span className="tabular-nums text-text-muted text-xs">
            {formatNumber(comparison, locale)}
          </span>
        )}
        <span className="tabular-nums">{formatNumber(value, locale)}</span>
      </div>
    </div>
  )
}

export default function CashFlowPage() {
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

  const query = useCashFlow(appliedParams)
  const reportData = query.data?.data
  const operating = reportData?.operating || []
  const investing = reportData?.investing || []
  const financing = reportData?.financing || []
  const reconcilingItems = reportData?.reconcilingItems || []
  const totals = reportData?.totals
  const period = reportData?.period
  const comparison = reportData?.comparison
  const hasData =
    operating.length > 0 || investing.length > 0 || financing.length > 0
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
      const blob = await reportApi.exportCashFlow({ ...appliedParams, format })
      downloadBlob(blob, `cash-flow.${format === 'excel' ? 'xlsx' : format}`)
    } finally {
      setIsExporting(false)
    }
  }

  const sectionProps = {
    showComparison: showCompCols,
    isAr,
    locale,
    valueKey: 'amount',
    comparisonKey: 'comparisonAmount',
    deltaKey: 'deltaAmount',
  }

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
        title={t('reports.cashFlow')}
        subtitle={t('reports.cashFlowSubtitle')}
      />

      {/* Filter card */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-border p-4 mb-5 space-y-3"
      >
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

          <Button
            type="submit"
            size="sm"
            isLoading={query.isFetching}
            disabled={!startDate || !endDate}
          >
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
        <div className="flex items-center gap-2">
          <input
            id="cf-comparison"
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="rounded border-border text-primary"
          />
          <label htmlFor="cf-comparison" className="text-sm text-text-secondary cursor-pointer">
            {t('reports.enableComparison')}
          </label>
        </div>

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
          icon={Waves}
          title={t('reports.cashFlow')}
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
          icon={Waves}
          title={t('reports.cashFlow')}
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
            <span className="text-end">{t('common.amount')}</span>
            {showCompCols && (
              <>
                <span className="text-end">{t('reports.comparisonBalance')}</span>
                <span className="text-end">{t('reports.variance')}</span>
              </>
            )}
          </div>

          {/* Operating */}
          <ReportSection
            title={t('reports.operating')}
            rows={operating}
            subtotalLabel={t('reports.operatingCashFlow')}
            subtotalValue={totals?.operatingCashFlow}
            comparisonSubtotal={comparison?.totals?.operatingCashFlow}
            deltaSubtotal={
              totals && comparison?.totals
                ? Number(totals.operatingCashFlow) - Number(comparison.totals.operatingCashFlow)
                : undefined
            }
            {...sectionProps}
          />

          {/* Investing */}
          <ReportSection
            title={t('reports.investing')}
            rows={investing}
            subtotalLabel={t('reports.investingCashFlow')}
            subtotalValue={totals?.investingCashFlow}
            comparisonSubtotal={comparison?.totals?.investingCashFlow}
            deltaSubtotal={
              totals && comparison?.totals
                ? Number(totals.investingCashFlow) - Number(comparison.totals.investingCashFlow)
                : undefined
            }
            {...sectionProps}
          />

          {/* Financing */}
          <ReportSection
            title={t('reports.financing')}
            rows={financing}
            subtotalLabel={t('reports.financingCashFlow')}
            subtotalValue={totals?.financingCashFlow}
            comparisonSubtotal={comparison?.totals?.financingCashFlow}
            deltaSubtotal={
              totals && comparison?.totals
                ? Number(totals.financingCashFlow) - Number(comparison.totals.financingCashFlow)
                : undefined
            }
            {...sectionProps}
          />

          {/* Reconciling items (if any) */}
          {reconcilingItems.length > 0 && (
            <ReportSection
              title={t('reports.reconcilingItems')}
              rows={reconcilingItems}
              subtotalLabel=""
              subtotalValue={totals?.reconcilingDifference}
              {...sectionProps}
            />
          )}

          {/* Summary block */}
          {totals && (
            <div className="px-4 py-4 border-t-2 border-border bg-surface-subtle space-y-0.5">
              <SummaryRow
                label={t('reports.netIncreaseInCash')}
                value={totals.netIncreaseInCash}
                comparison={comparison?.totals?.netIncreaseInCash}
                showComparison={showCompCols}
                locale={locale}
                bold
              />
              <SummaryRow
                label={t('reports.openingCash')}
                value={totals.openingCash}
                comparison={comparison?.totals?.openingCash}
                showComparison={showCompCols}
                locale={locale}
                className="text-text-secondary"
              />
              <div className="border-t border-border my-1" />
              <SummaryRow
                label={t('reports.closingCash')}
                value={totals.closingCash}
                comparison={comparison?.totals?.closingCash}
                showComparison={showCompCols}
                locale={locale}
                bold
              />
              {totals.isReconciled === false && (
                <p className="text-xs text-error pt-1">{t('reports.notReconciled')}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
