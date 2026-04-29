import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/Badge'
import { Card } from '@/shared/components/Card'
import { formatDate } from '@/shared/utils/formatters'

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

function getMonthRange(year, monthIndex) {
  return {
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 0),
  }
}

export function PeriodMonthCard({
  period,
  year,
  monthIndex,
  isCurrent,
  isSelected,
  onClick,
}) {
  const { t, i18n } = useTranslation()
  const monthName = new Date(year, monthIndex, 1).toLocaleString(i18n.language, {
    month: 'long',
  })
  const fallbackRange = getMonthRange(year, monthIndex)
  const dateRange = period
    ? `${formatDate(period.startDate, i18n.language)} - ${formatDate(period.endDate, i18n.language)}`
    : `${formatDate(fallbackRange.start, i18n.language)} - ${formatDate(fallbackRange.end, i18n.language)}`

  if (!period) {
    return (
      <Card padding="sm" className="min-h-32 bg-surface-muted border-dashed shadow-none">
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-muted capitalize">{monthName}</p>
            <p className="text-xs text-text-muted mt-1">{dateRange}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="default" size="sm">
              {t('fiscalPeriods.periodNotCreated')}
            </Badge>
            {isCurrent && (
              <Badge variant="info" size="sm">
                {t('fiscalPeriods.currentPeriod')}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    )
  }

  const statusBadge = getStatusBadgeConfig(period.status, t)

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <Card
      padding="sm"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={[
        'min-h-32 cursor-pointer transition-colors outline-none hover:border-primary focus-visible:border-primary focus-visible:shadow-focus',
        isSelected ? 'border-primary shadow-focus' : '',
      ].join(' ')}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text-primary capitalize">{monthName}</p>
            <Badge variant={statusBadge.variant} size="sm">
              {statusBadge.label}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">{dateRange}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-muted">{period.name}</p>
          {isCurrent && (
            <Badge variant="info" size="sm">
              {t('fiscalPeriods.currentPeriod')}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
