import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Scale, RefreshCw } from 'lucide-react'
import { useTrialBalance } from '@/features/reports/hooks/useReports'
import { reportApi } from '@/entities/report/api/reportApi'
import { ExportMenu, downloadBlob } from '@/features/reports/components/ExportMenu'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { ROUTES } from '@/shared/constants/routes'
import { formatNumber, formatDate } from '@/shared/utils/formatters'

const INPUT_CLASS =
  'h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus'

export default function TrialBalancePage() {
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

  const query = useTrialBalance(appliedParams)
  const reportData = query.data?.data
  const accounts = reportData?.accounts || []
  const totals = reportData?.totals
  const period = reportData?.period
  const comparison = reportData?.comparison
  const hasData = accounts.length > 0
  const showCompCols = !!comparison

  function handleSubmit(e) {
    e.preventDefault()
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (showComparison && compareStartDate) params.compareStartDate = compareStartDate
    if (showComparison && compareEndDate) params.compareEndDate = compareEndDate
    setAppliedParams(params)
  }

  async function handleExport(format) {
    if (!appliedParams) return
    setIsExporting(true)
    try {
      const blob = await reportApi.exportTrialBalance({ ...appliedParams, format })
      downloadBlob(blob, `trial-balance.${format === 'excel' ? 'xlsx' : format}`)
    } finally {
      setIsExporting(false)
    }
  }

  const colsClass = showCompCols
    ? 'grid-cols-[5rem_1fr_9rem_9rem_9rem_9rem_8rem]'
    : 'grid-cols-[5rem_1fr_9rem_9rem_9rem]'

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
        title={t('reports.trialBalance')}
        subtitle={t('reports.trialBalanceSubtitle')}
      />

      {/* Filter card */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-lg border border-border p-4 mb-5 space-y-3"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted">{t('reports.startDate')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted">{t('reports.endDate')}</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <Button type="submit" size="sm" isLoading={query.isFetching}>
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
            id="tb-comparison"
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="rounded border-border text-primary"
          />
          <label htmlFor="tb-comparison" className="text-sm text-text-secondary cursor-pointer">
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
          icon={Scale}
          title={t('reports.trialBalance')}
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
          icon={Scale}
          title={t('reports.trialBalance')}
          message={t('common.noData')}
        />
      )}

      {appliedParams && !query.isLoading && !query.isError && hasData && (
        <div className="bg-surface rounded-lg border border-border overflow-x-auto">
          {/* Header row */}
          <div
            className={`grid ${colsClass} px-4 py-2.5 border-b border-border bg-surface-subtle text-xs font-semibold text-text-muted min-w-max`}
          >
            <span>{t('reports.accountCode')}</span>
            <span>{t('reports.accountName')}</span>
            <span className="text-end">{t('reports.totalDebits')}</span>
            <span className="text-end">{t('reports.totalCredits')}</span>
            <span className="text-end">{t('common.balance')}</span>
            {showCompCols && (
              <>
                <span className="text-end">{t('reports.comparisonBalance')}</span>
                <span className="text-end">{t('reports.variance')}</span>
              </>
            )}
          </div>

          {/* Account rows */}
          <div className="divide-y divide-border/40">
            {accounts.map((account) => (
              <div
                key={account.code}
                className={`grid ${colsClass} items-center px-4 py-2.5 text-sm min-w-max`}
              >
                <span className="font-mono text-xs text-text-muted">{account.code}</span>
                <span className="text-text-primary">
                  {isAr
                    ? account.nameAr || account.nameEn
                    : account.nameEn || account.nameAr}
                </span>
                <span className="text-end tabular-nums text-text-secondary">
                  {formatNumber(account.totalDebit, locale)}
                </span>
                <span className="text-end tabular-nums text-text-secondary">
                  {formatNumber(account.totalCredit, locale)}
                </span>
                <span className="text-end tabular-nums font-medium">
                  {formatNumber(account.balance, locale)}
                </span>
                {showCompCols && (
                  <>
                    <span className="text-end tabular-nums text-text-muted">
                      {formatNumber(account.comparisonBalance, locale)}
                    </span>
                    <span className="text-end tabular-nums text-text-muted text-xs">
                      {formatNumber(account.deltaBalance, locale)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Totals row */}
          {totals && (
            <div
              className={`grid ${colsClass} items-center px-4 py-3 border-t-2 border-border bg-surface-subtle font-semibold text-sm min-w-max`}
            >
              <span />
              <span className="text-text-primary">{t('common.total')}</span>
              <span className="text-end tabular-nums">
                {formatNumber(totals.totalDebits, locale)}
              </span>
              <span className="text-end tabular-nums">
                {formatNumber(totals.totalCredits, locale)}
              </span>
              <span className="text-end tabular-nums">
                {totals.isBalanced ? (
                  <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                    {t('reports.balanced')}
                  </span>
                ) : (
                  <span className="text-error tabular-nums">
                    {formatNumber(totals.difference, locale)}
                  </span>
                )}
              </span>
              {showCompCols && comparison?.totals && (
                <>
                  <span className="text-end tabular-nums text-text-muted">
                    {formatNumber(comparison.totals.totalDebits, locale)}
                  </span>
                  <span className="text-end tabular-nums text-text-muted text-xs">
                    {formatNumber(comparison.delta?.totalDebits, locale)}
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
