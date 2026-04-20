import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'

function pad(d) {
  return String(d).padStart(2, '0')
}

function fmt(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const RANGE_PRESETS = [
  {
    ar: 'هذا الشهر',
    en: 'This Month',
    get() {
      const t = new Date()
      return { startDate: fmt(new Date(t.getFullYear(), t.getMonth(), 1)), endDate: fmt(t) }
    },
  },
  {
    ar: 'الشهر الماضي',
    en: 'Last Month',
    get() {
      const t = new Date()
      const y = t.getFullYear()
      const m = t.getMonth()
      return {
        startDate: fmt(new Date(y, m - 1, 1)),
        endDate: fmt(new Date(y, m, 0)),
      }
    },
  },
  {
    ar: 'هذا الربع',
    en: 'This Quarter',
    get() {
      const t = new Date()
      const qs = Math.floor(t.getMonth() / 3) * 3
      return { startDate: fmt(new Date(t.getFullYear(), qs, 1)), endDate: fmt(t) }
    },
  },
  {
    ar: 'هذا العام',
    en: 'This Year',
    get() {
      const t = new Date()
      return { startDate: fmt(new Date(t.getFullYear(), 0, 1)), endDate: fmt(t) }
    },
  },
]

const AS_OF_PRESETS = [
  {
    ar: 'اليوم',
    en: 'Today',
    get() {
      return { asOfDate: fmt(new Date()) }
    },
  },
  {
    ar: 'نهاية الشهر الماضي',
    en: 'End of Last Month',
    get() {
      const t = new Date()
      return { asOfDate: fmt(new Date(t.getFullYear(), t.getMonth(), 0)) }
    },
  },
  {
    ar: 'نهاية العام الماضي',
    en: 'End of Last Year',
    get() {
      return { asOfDate: fmt(new Date(new Date().getFullYear() - 1, 11, 31)) }
    },
  },
]

/**
 * Quick-select buttons for date ranges (or a single as-of date).
 *
 * Props:
 *   mode     – "range" (default) | "asOf"
 *   onApply  – called with { startDate, endDate } in range mode,
 *              or { asOfDate } in asOf mode
 *   className
 */
export function DatePresets({ mode = 'range', onApply, className }) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const presets = mode === 'asOf' ? AS_OF_PRESETS : RANGE_PRESETS

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className="text-xs text-text-muted shrink-0 me-0.5">
        {isAr ? 'فترة سريعة:' : 'Quick:'}
      </span>
      {presets.map((preset) => (
        <button
          key={preset.en}
          type="button"
          onClick={() => onApply(preset.get())}
          className="text-xs px-2.5 py-1 rounded-full border border-border bg-surface
            hover:bg-primary-50 hover:border-primary/40 hover:text-primary
            text-text-secondary transition-colors duration-150"
        >
          {isAr ? preset.ar : preset.en}
        </button>
      ))}
    </div>
  )
}
