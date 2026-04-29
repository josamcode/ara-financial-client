import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'

export function PeriodYearNav({ year, onPrev, onNext }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 mb-5">
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {t('fiscalPeriods.yearNav')}
        </p>
        <p className="text-lg font-semibold text-text-primary leading-tight">{year}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={onPrev}
          aria-label={t('fiscalPeriods.previousYear')}
          title={t('fiscalPeriods.previousYear')}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={onNext}
          aria-label={t('fiscalPeriods.nextYear')}
          title={t('fiscalPeriods.nextYear')}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
