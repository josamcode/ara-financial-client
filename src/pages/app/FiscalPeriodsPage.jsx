import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import {
  useCloseFiscalPeriod,
  useFiscalPeriods,
  useLockFiscalPeriod,
  useReopenFiscalPeriod,
} from '@/features/fiscalPeriods/hooks/useFiscalPeriods'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { formatDate, formatDateTime } from '@/shared/utils/formatters'

function getStatusBadgeConfig(status, t) {
  switch (status) {
    case 'open':
      return { label: t('fiscalPeriods.open'), variant: 'success' }
    case 'closed':
      return { label: t('fiscalPeriods.closed'), variant: 'warning' }
    case 'locked':
      return { label: t('fiscalPeriods.locked'), variant: 'error' }
    default:
      return { label: status || '-', variant: 'default' }
  }
}

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

export default function FiscalPeriodsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [yearInput, setYearInput] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [pendingAction, setPendingAction] = useState(null)

  const queryParams = useMemo(
    () => ({
      year: selectedYear || undefined,
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

  const counts = useMemo(
    () =>
      periods.reduce(
        (summary, period) => {
          summary.total += 1
          summary[period.status] += 1
          return summary
        },
        { total: 0, open: 0, closed: 0, locked: 0 }
      ),
    [periods]
  )

  function handleApplyYearFilter(event) {
    event.preventDefault()
    setSelectedYear(yearInput.trim())
  }

  function handleClearYearFilter() {
    setYearInput('')
    setSelectedYear('')
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

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('fiscalPeriods.title')}
        subtitle={t('fiscalPeriods.subtitle')}
      />

      <form onSubmit={handleApplyYearFilter} className="flex flex-col gap-3 sm:flex-row sm:items-end mb-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">{t('common.year')}</label>
          <input
            type="number"
            min="1900"
            max="9999"
            value={yearInput}
            onChange={(event) => setYearInput(event.target.value)}
            className="h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" type="submit">
            {t('common.apply')}
          </Button>
          {selectedYear && (
            <Button size="sm" type="button" variant="secondary" onClick={handleClearYearFilter}>
              {t('common.clear')}
            </Button>
          )}
        </div>
      </form>

      {!periodsQuery.isLoading && !periodsQuery.isError && periods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Card padding="md">
            <p className="text-sm text-text-secondary mb-1">{t('fiscalPeriods.open')}</p>
            <p className="text-2xl font-bold text-text-primary">{counts.open}</p>
          </Card>
          <Card padding="md">
            <p className="text-sm text-text-secondary mb-1">{t('fiscalPeriods.closed')}</p>
            <p className="text-2xl font-bold text-text-primary">{counts.closed}</p>
          </Card>
          <Card padding="md">
            <p className="text-sm text-text-secondary mb-1">{t('fiscalPeriods.locked')}</p>
            <p className="text-2xl font-bold text-text-primary">{counts.locked}</p>
          </Card>
        </div>
      )}

      {periodsQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {periodsQuery.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => periodsQuery.refetch()}
        />
      )}

      {!periodsQuery.isLoading && !periodsQuery.isError && !periods.length && (
        <EmptyState
          icon={Calendar}
          title={t('fiscalPeriods.emptyTitle')}
          message={t('fiscalPeriods.emptyMessage')}
        />
      )}

      {!periodsQuery.isLoading && !periodsQuery.isError && periods.length > 0 && (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-border bg-surface-subtle">
                  <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted">
                    {t('fiscalPeriods.period')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-72">
                    {t('fiscalPeriods.dateRange')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-36">
                    {t('common.status')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-56">
                    {t('fiscalPeriods.closedAt')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-56">
                    {t('fiscalPeriods.lockedAt')}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted w-44">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {periods.map((period) => {
                  const statusBadge = getStatusBadgeConfig(period.status, t)

                  return (
                    <tr key={period._id} className="hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3 align-top">
                        <div>
                          <p className="font-medium text-text-primary">{period.name}</p>
                          <p className="text-xs text-text-muted mt-1">
                            {t('fiscalPeriods.fiscalYear')}: {period.year}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top text-text-secondary">
                        {formatDate(period.startDate, i18n.language)} -{' '}
                        {formatDate(period.endDate, i18n.language)}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <Badge variant={statusBadge.variant} size="sm">
                          {statusBadge.label}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 align-top text-text-secondary">
                        {period.closedAt
                          ? formatDateTime(period.closedAt, i18n.language)
                          : '-'}
                      </td>

                      <td className="px-4 py-3 align-top text-text-secondary">
                        {period.lockedAt
                          ? formatDateTime(period.lockedAt, i18n.language)
                          : '-'}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end gap-2">
                          {period.status === 'open' && canClosePeriods && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPendingAction({ type: 'close', period })}
                            >
                              {t('fiscalPeriods.close')}
                            </Button>
                          )}

                          {period.status === 'closed' && canClosePeriods && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPendingAction({ type: 'reopen', period })}
                            >
                              {t('fiscalPeriods.reopen')}
                            </Button>
                          )}

                          {period.status !== 'locked' && canLockPeriods && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPendingAction({ type: 'lock', period })}
                            >
                              {t('fiscalPeriods.lock')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
