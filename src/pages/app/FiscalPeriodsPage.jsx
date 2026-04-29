import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, CheckCircle2, LockKeyhole } from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import { PeriodDetailPanel } from '@/features/fiscalPeriods/components/PeriodDetailPanel'
import { PeriodMonthCard } from '@/features/fiscalPeriods/components/PeriodMonthCard'
import { PeriodYearNav } from '@/features/fiscalPeriods/components/PeriodYearNav'
import {
  useCloseFiscalPeriod,
  useFiscalPeriods,
  useLockFiscalPeriod,
  useReopenFiscalPeriod,
} from '@/features/fiscalPeriods/hooks/useFiscalPeriods'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'

const ACTION_CONFIG = {
  close: {
    titleKey: 'fiscalPeriods.closeConfirmTitle',
    messageKey: 'fiscalPeriods.closeConfirmMessage',
    confirmKey: 'fiscalPeriods.close',
    confirmVariant: 'danger',
  },
  lock: {
    titleKey: 'fiscalPeriods.lockConfirmTitle',
    messageKey: 'fiscalPeriods.lockConfirmMessage',
    confirmKey: 'fiscalPeriods.lock',
    confirmVariant: 'danger',
  },
  reopen: {
    titleKey: 'fiscalPeriods.reopenConfirmTitle',
    messageKey: 'fiscalPeriods.reopenConfirmMessage',
    confirmKey: 'fiscalPeriods.reopen',
    confirmVariant: 'primary',
  },
}

const QUARTERS = [
  { key: 'q1Label', months: [0, 1, 2] },
  { key: 'q2Label', months: [3, 4, 5] },
  { key: 'q3Label', months: [6, 7, 8] },
  { key: 'q4Label', months: [9, 10, 11] },
]

function getPeriodMonthIndex(period, selectedYear) {
  const nameMatch = period.name?.match(/(\d{4})-(\d{1,2})/)
  if (nameMatch) {
    const year = Number(nameMatch[1])
    const month = Number(nameMatch[2])
    if (year === selectedYear && month >= 1 && month <= 12) {
      return month - 1
    }
  }

  if (period.startDate) {
    const startDate = new Date(period.startDate)
    if (!Number.isNaN(startDate.getTime())) {
      return startDate.getMonth()
    }
  }

  return null
}

function SummaryItem({ icon: Icon, label, value, tone }) {
  const toneClass = {
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    error: 'bg-error-soft text-error',
  }[tone]

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${toneClass}`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
        <p className="text-lg font-semibold text-text-primary leading-tight">{value}</p>
      </div>
    </div>
  )
}

export default function FiscalPeriodsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [selectedPeriodId, setSelectedPeriodId] = useState(null)
  const [selectedPeriodSnapshot, setSelectedPeriodSnapshot] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)

  const queryParams = useMemo(
    () => ({
      year: selectedYear,
    }),
    [selectedYear]
  )

  const periodsQuery = useFiscalPeriods(queryParams)
  const closeMutation = useCloseFiscalPeriod()
  const lockMutation = useLockFiscalPeriod()
  const reopenMutation = useReopenFiscalPeriod()

  const periods = periodsQuery.data || []
  const canClosePeriods = hasPermission(user, PERMISSIONS.FISCAL_UPDATE)
  const canLockPeriods = hasPermission(user, PERMISSIONS.FISCAL_LOCK)
  const today = useMemo(() => new Date(), [])

  const counts = useMemo(
    () =>
      periods.reduce(
        (summary, period) => {
          if (summary[period.status] !== undefined) {
            summary[period.status] += 1
          }
          return summary
        },
        { open: 0, closed: 0, locked: 0 }
      ),
    [periods]
  )

  const periodsByMonth = useMemo(() => {
    const map = new Map()

    periods.forEach((period) => {
      const monthIndex = getPeriodMonthIndex(period, selectedYear)
      if (monthIndex !== null && monthIndex >= 0 && monthIndex <= 11) {
        map.set(monthIndex, period)
      }
    })

    return map
  }, [periods, selectedYear])

  const selectedPeriod =
    periods.find((period) => period._id === selectedPeriodId) || selectedPeriodSnapshot

  function handleYearChange(nextYear) {
    setSelectedYear(nextYear)
    setSelectedPeriodId(null)
    setSelectedPeriodSnapshot(null)
  }

  function handleSelectPeriod(period) {
    setSelectedPeriodId(period._id)
    setSelectedPeriodSnapshot(period)
  }

  function handlePanelAction(type) {
    if (!selectedPeriod) return
    setPendingAction({ type, period: selectedPeriod })
  }

  async function handleConfirmAction() {
    if (!pendingAction) return

    if (pendingAction.type === 'close') {
      await closeMutation.mutateAsync(pendingAction.period._id)
    } else if (pendingAction.type === 'lock') {
      await lockMutation.mutateAsync(pendingAction.period._id)
    } else if (pendingAction.type === 'reopen') {
      await reopenMutation.mutateAsync(pendingAction.period._id)
    }

    setPendingAction(null)
  }

  const activeActionConfig = pendingAction ? ACTION_CONFIG[pendingAction.type] : null
  const isSubmittingAction =
    closeMutation.isPending || lockMutation.isPending || reopenMutation.isPending
  const showPeriodGrid = !periodsQuery.isLoading && !periodsQuery.isError

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('fiscalPeriods.title')}
        subtitle={t('fiscalPeriods.subtitle')}
      />

      <PeriodYearNav
        year={selectedYear}
        onPrev={() => handleYearChange(selectedYear - 1)}
        onNext={() => handleYearChange(selectedYear + 1)}
      />

      {!periodsQuery.isLoading && !periodsQuery.isError && (
        <Card padding="sm" className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryItem
              icon={Calendar}
              label={t('fiscalPeriods.open')}
              value={counts.open}
              tone="success"
            />
            <SummaryItem
              icon={CheckCircle2}
              label={t('fiscalPeriods.closed')}
              value={counts.closed}
              tone="warning"
            />
            <SummaryItem
              icon={LockKeyhole}
              label={t('fiscalPeriods.locked')}
              value={counts.locked}
              tone="error"
            />
          </div>
        </Card>
      )}

      {periodsQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {periodsQuery.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => periodsQuery.refetch()}
        />
      )}

      {showPeriodGrid && !periods.length && (
        <EmptyState
          compact
          icon={Calendar}
          title={t('fiscalPeriods.emptyTitle')}
          message={t('fiscalPeriods.emptyMessage')}
          className="mb-2"
        />
      )}

      {showPeriodGrid && (
        <div className="space-y-5">
          {QUARTERS.map((quarter) => (
            <section key={quarter.key} className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-text-primary mb-3">
                {t(`fiscalPeriods.${quarter.key}`)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quarter.months.map((monthIndex) => {
                  const period = periodsByMonth.get(monthIndex) || null
                  const isCurrent =
                    selectedYear === today.getFullYear() && monthIndex === today.getMonth()

                  return (
                    <PeriodMonthCard
                      key={monthIndex}
                      period={period}
                      year={selectedYear}
                      monthIndex={monthIndex}
                      isCurrent={isCurrent}
                      isSelected={!!period && period._id === selectedPeriodId}
                      onClick={() => handleSelectPeriod(period)}
                    />
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <PeriodDetailPanel
        period={selectedPeriod}
        open={!!selectedPeriodId}
        onClose={() => {
          setSelectedPeriodId(null)
          setSelectedPeriodSnapshot(null)
        }}
        canClose={canClosePeriods}
        canLock={canLockPeriods}
        onAction={handlePanelAction}
      />

      <ConfirmDialog
        open={!!pendingAction}
        title={activeActionConfig ? t(activeActionConfig.titleKey) : ''}
        message={activeActionConfig ? t(activeActionConfig.messageKey) : ''}
        confirmLabel={activeActionConfig ? t(activeActionConfig.confirmKey) : ''}
        confirmVariant={activeActionConfig?.confirmVariant || 'primary'}
        isLoading={isSubmittingAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}
