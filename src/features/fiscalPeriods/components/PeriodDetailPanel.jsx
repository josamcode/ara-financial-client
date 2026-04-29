import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { formatDate, formatDateTime } from '@/shared/utils/formatters'
import { PeriodStatusLifecycle } from './PeriodStatusLifecycle'

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

function getMonthName(period, language) {
  const source = period?.startDate ? new Date(period.startDate) : null
  if (!source || Number.isNaN(source.getTime())) return period?.name || '-'

  return source.toLocaleString(language, { month: 'long' })
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text-primary text-end">{value}</dd>
    </div>
  )
}

export function PeriodDetailPanel({
  period,
  open,
  onClose,
  canClose,
  canLock,
  onAction,
}) {
  const { t, i18n } = useTranslation()

  if (!period) return null

  const statusBadge = getStatusBadgeConfig(period.status, t)
  const monthName = getMonthName(period, i18n.language)
  const actions = []

  if (period.status === 'open') {
    if (canClose) actions.push({ type: 'close', label: t('fiscalPeriods.close'), variant: 'secondary' })
    if (canLock) actions.push({ type: 'lock', label: t('fiscalPeriods.lock'), variant: 'danger' })
  } else if (period.status === 'closed') {
    if (canClose) actions.push({ type: 'reopen', label: t('fiscalPeriods.reopen'), variant: 'primary' })
    if (canLock) actions.push({ type: 'lock', label: t('fiscalPeriods.lock'), variant: 'danger' })
  }

  return (
    <SlidePanel open={open} onClose={onClose} title={t('fiscalPeriods.periodDetails')} width="lg">
      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-semibold text-text-primary capitalize">{monthName}</p>
              <p className="text-sm text-text-secondary mt-1">{period.name}</p>
            </div>
            <Badge variant={statusBadge.variant} size="md">
              {statusBadge.label}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mt-4">
            {formatDate(period.startDate, i18n.language)} - {formatDate(period.endDate, i18n.language)}
          </p>
        </div>

        <PeriodStatusLifecycle status={period.status} />

        <dl className="rounded-lg border border-border bg-surface px-4">
          <DetailRow label={t('fiscalPeriods.fiscalYear')} value={period.year || '-'} />
          <DetailRow
            label={t('fiscalPeriods.closedAt')}
            value={period.closedAt ? formatDateTime(period.closedAt, i18n.language) : '-'}
          />
          <DetailRow
            label={t('fiscalPeriods.lockedAt')}
            value={period.lockedAt ? formatDateTime(period.lockedAt, i18n.language) : '-'}
          />
        </dl>

        <div className="rounded-lg border border-border bg-surface p-4">
          {actions.length > 0 ? (
            <div className="space-y-3">
              {actions.some((action) => action.type === 'lock') && (
                <div className="flex gap-2 rounded-md bg-error-soft px-3 py-2 text-sm text-error">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <p>{t('fiscalPeriods.lockActionWarning')}</p>
                </div>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.type}
                    type="button"
                    size="sm"
                    variant={action.variant}
                    onClick={() => onAction(action.type)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              {t('fiscalPeriods.noActionAvailable')}
            </p>
          )}
        </div>
      </div>
    </SlidePanel>
  )
}
