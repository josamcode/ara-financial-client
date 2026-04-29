import { CheckCircle2, Circle, LockKeyhole } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STEPS = [
  { status: 'open', icon: Circle },
  { status: 'closed', icon: CheckCircle2 },
  { status: 'locked', icon: LockKeyhole },
]

const STEP_INDEX = {
  open: 0,
  closed: 1,
  locked: 2,
}

export function PeriodStatusLifecycle({ status }) {
  const { t } = useTranslation()
  const currentIndex = STEP_INDEX[status] ?? 0

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
        {t('fiscalPeriods.statusLifecycle')}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isReached = index <= currentIndex
          const isCurrent = index === currentIndex

          return (
            <div
              key={step.status}
              className={[
                'rounded-md border px-3 py-2 text-center',
                isReached ? 'border-border bg-surface' : 'border-border bg-surface-muted',
                isCurrent ? 'shadow-card' : '',
              ].join(' ')}
            >
              <Icon
                size={16}
                className={[
                  'mx-auto mb-1',
                  isReached ? 'text-primary' : 'text-text-muted',
                ].join(' ')}
              />
              <p
                className={[
                  'text-xs font-medium',
                  isReached ? 'text-text-primary' : 'text-text-muted',
                ].join(' ')}
              >
                {t(`fiscalPeriods.${step.status}`)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
