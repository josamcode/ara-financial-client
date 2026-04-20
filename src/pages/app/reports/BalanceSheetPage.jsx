import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, RefreshCw, AlertTriangle } from 'lucide-react'
import { useBalanceSheet } from '@/features/reports/hooks/useReports'
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

export default function BalanceSheetPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'
  const locale = isAr ? 'ar-EG' : 'en-US'

  const [asOfDate, setAsOfDate] = useState('')
  const [showComparison, setShowComparison] = useState(false)
  const [compareAsOfDate, setCompareAsOfDate] = useState('')
  const [appliedParams, setAppliedParams] = useState(null)
  const [isExporting, setIsExporting] = useState(false)

  const query = useBalanceSheet(appliedParams)
  const reportData = query.data?.data
  const assets = reportData?.assets || []
  const liabilities = reportData?.liabilities || []
  const equity = reportData?.equity || []
  const totals = reportData?.totals
  const asOfDateReturned = reportData?.asOfDate
  const yearClose = reportData?.yearClose
  const comparison = reportData?.comparison
  const hasData = assets.length > 0 || liabilities.length > 0 || equity.length > 0
  const showCompCols = !!comparison

  const pendingClosures = yearClose?.pendingPriorYearClosures ?? []

  function handleSubmit(e) {
    e.preventDefault()
    if (!asOfDate) return
    const params = { asOfDate }
    if (showComparison && compareAsOfDate) params.compareAsOfDate = compareAsOfDate
    setAppliedParams(params)
  }

  async function handleExport(format) {
    if (!appliedParams) return
    setIsExporting(true)
    try {
      const blob = await reportApi.exportBalanceSheet({ ...appliedParams, format })
      downloadBlob(blob, `balance-sheet.${format === 'excel' ? 'xlsx' : format}`)
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
        title={t('reports.balanceSheet')}
        subtitle={t('reports.balanceSheetSubtitle')}
      />

      {/* Filter card */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-border p-4 mb-5 space-y-3"
      >
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
              onChange={(e) => setAsOfDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <Button type="submit" size="sm" isLoading={query.isFetching} disabled={!asOfDate}>
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
            id="bs-comparison"
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="rounded border-border text-primary"
          />
          <label htmlFor="bs-comparison" className="text-sm text-text-secondary cursor-pointer">
            {t('reports.enableComparison')}
          </label>
        </div>

        {showComparison && (
          <div className="flex flex-wrap items-end gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted">{t('reports.compareAsOfDate')}</label>
              <input
                type="date"
                value={compareAsOfDate}
                onChange={(e) => setCompareAsOfDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        )}
      </form>

      {/* As-of date label */}
      {asOfDateReturned && (
        <p className="text-xs text-text-muted mb-3">
          {t('reports.asOfDate')}: {formatDate(asOfDateReturned, i18n.language)}
        </p>
      )}

      {/* Pending year closure warning */}
      {pendingClosures.length > 0 && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border border-yellow-300 bg-yellow-50 text-sm text-yellow-800">
          <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <span>
            {t('reports.pendingClosureWarning', { count: pendingClosures.length })}
            {' '}({pendingClosures.join(', ')})
          </span>
        </div>
      )}

      {/* States */}
      {!appliedParams && (
        <EmptyState
          icon={Building2}
          title={t('reports.balanceSheet')}
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
          icon={Building2}
          title={t('reports.balanceSheet')}
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

          {/* Assets */}
          <ReportSection
            title={t('reports.assets')}
            rows={assets}
            subtotalLabel={t('reports.totalAssets')}
            subtotalValue={totals?.totalAssets}
            comparisonSubtotal={comparison?.totals?.totalAssets}
            deltaSubtotal={comparison?.delta?.totalAssets}
            {...sectionProps}
          />

          {/* Liabilities */}
          <ReportSection
            title={t('reports.liabilities')}
            rows={liabilities}
            subtotalLabel={t('reports.totalLiabilities')}
            subtotalValue={totals?.totalLiabilities}
            comparisonSubtotal={comparison?.totals?.totalLiabilities}
            deltaSubtotal={comparison?.delta?.totalLiabilities}
            {...sectionProps}
          />

          {/* Equity */}
          <ReportSection
            title={t('reports.equity')}
            rows={equity}
            subtotalLabel={t('reports.totalEquity')}
            subtotalValue={totals?.totalEquity}
            comparisonSubtotal={comparison?.totals?.totalEquity}
            deltaSubtotal={comparison?.delta?.totalEquity}
            {...sectionProps}
          />

          {/* Grand total: Liabilities + Equity */}
          {totals && (
            <div
              className={`grid ${showCompCols ? 'grid-cols-[5rem_1fr_10rem_10rem_9rem]' : 'grid-cols-[5rem_1fr_10rem]'} items-center px-4 py-3 border-t-2 border-border bg-surface-subtle font-bold text-sm`}
            >
              <span />
              <span className="text-text-primary flex items-center gap-2">
                {t('reports.liabilitiesAndEquity')}
                {totals.isBalanced ? (
                  <span className="text-xs font-medium text-success">({t('reports.balanced')})</span>
                ) : (
                  <span className="text-xs font-medium text-error">({t('reports.notBalanced')})</span>
                )}
              </span>
              <span className="text-end tabular-nums">
                {formatNumber(totals.totalLiabilitiesAndEquity, locale)}
              </span>
              {showCompCols && comparison?.totals && (
                <>
                  <span className="text-end tabular-nums text-text-muted">
                    {formatNumber(comparison.totals.totalLiabilitiesAndEquity, locale)}
                  </span>
                  <span className="text-end tabular-nums text-text-muted text-xs">
                    {formatNumber(
                      Number(totals.totalLiabilitiesAndEquity) -
                        Number(comparison.totals.totalLiabilitiesAndEquity),
                      locale
                    )}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
