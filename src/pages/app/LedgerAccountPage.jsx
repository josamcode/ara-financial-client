import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RotateCcw, Download } from 'lucide-react'
import { useAccountLedger } from '@/features/ledger/hooks/useLedger'
import { LedgerTable } from '@/features/ledger/components/LedgerTable'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ledgerApi } from '@/entities/ledger/api/ledgerApi'
import { ROUTES } from '@/shared/constants/routes'

const DEFAULT_LIMIT = 50

function NatureBadge({ nature }) {
  const { t } = useTranslation()
  const isDebit = nature === 'debit'
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        isDebit
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-green-50 text-green-700 border border-green-200',
      ].join(' ')}
    >
      {isDebit ? t('ledger.debitNormal') : t('ledger.creditNormal')}
    </span>
  )
}

function Pagination({ page, totalPages, total, limit, onPageChange, t }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-text-muted">
      <span>
        {t('ledger.showingRows', {
          from: (page - 1) * limit + 1,
          to: Math.min(page * limit, total),
          total,
        })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t('common.previous')}
        </Button>
        <span className="px-2 tabular-nums">
          {t('ledger.pageOf', { page, totalPages })}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}

export default function LedgerAccountPage() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)

  const queryParams = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      limit: DEFAULT_LIMIT,
    }),
    [startDate, endDate, page]
  )

  const ledgerQuery = useAccountLedger(accountId, queryParams)

  const ledgerData = ledgerQuery.data?.data
  const pagination = ledgerQuery.data?.meta?.pagination
  const account = ledgerData?.account
  const movements = ledgerData?.movements || []
  const openingBalance = ledgerData?.openingBalance ?? '0.00'

  // Show opening balance row only on page 1 when a startDate filter is active
  const showOpeningBalance = page === 1 && !!startDate ? 'always' : false

  const accountName = account
    ? isAr
      ? account.nameAr || account.nameEn
      : account.nameEn || account.nameAr
    : '...'

  function handleReset() {
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const handleStartDateChange = useCallback((e) => {
    setStartDate(e.target.value)
    setPage(1)
  }, [])

  const handleEndDateChange = useCallback((e) => {
    setEndDate(e.target.value)
    setPage(1)
  }, [])

  async function handleExport() {
    try {
      setIsExporting(true)
      const blob = await ledgerApi.exportAccountLedger(accountId, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ledger-${account?.code || accountId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          type="button"
          onClick={() => navigate(ROUTES.LEDGER)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          {t('ledger.backToAccounts')}
        </button>
      </div>

      <PageHeader
        title={
          account ? (
            <span className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-text-muted text-base font-normal">
                {account.code}
              </span>
              <span>{accountName}</span>
              {account.nature && <NatureBadge nature={account.nature} />}
            </span>
          ) : (
            t('nav.ledger')
          )
        }
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            disabled={isExporting || !movements.length}
          >
            <Download size={14} />
            {isExporting ? t('common.loading') : t('ledger.export')}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">{t('common.from')}</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">{t('common.to')}</label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={handleEndDateChange}
            className="h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
          />
        </div>

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 h-input px-3 text-sm text-text-muted hover:text-primary transition-colors rounded-md border border-input bg-surface"
          >
            <RotateCcw size={13} />
            {t('ledger.resetFilters')}
          </button>
        )}
      </div>

      {/* States */}
      {ledgerQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {ledgerQuery.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => ledgerQuery.refetch()}
        />
      )}

      {!ledgerQuery.isLoading && !ledgerQuery.isError && (
        <>
          <LedgerTable
            movements={movements}
            openingBalance={openingBalance}
            showOpeningBalance={showOpeningBalance}
            account={account}
          />

          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={DEFAULT_LIMIT}
              onPageChange={setPage}
              t={t}
            />
          )}
        </>
      )}
    </div>
  )
}
