import { useTranslation } from 'react-i18next'
import { formatNumber } from '@/shared/utils/formatters'

/**
 * Renders a titled section of account rows with a subtotal footer.
 * Used by Income Statement, Balance Sheet, and Cash Flow pages.
 *
 * valueKey / comparisonKey / deltaKey allow adapting to the different
 * field names across reports (balance vs amount).
 */
export function ReportSection({
  title,
  rows = [],
  subtotalLabel,
  subtotalValue,
  comparisonSubtotal,
  deltaSubtotal,
  valueKey = 'balance',
  comparisonKey = 'comparisonBalance',
  deltaKey = 'deltaBalance',
  showComparison = false,
  isAr = false,
  locale = 'ar-EG',
}) {
  const { t } = useTranslation()

  function name(row) {
    if (isAr) return row.nameAr || row.nameEn || row.code
    return row.nameEn || row.nameAr || row.code
  }

  const cols = showComparison
    ? 'grid-cols-[5rem_1fr_10rem_10rem_9rem]'
    : 'grid-cols-[5rem_1fr_10rem]'

  return (
    <div className="mb-0">
      {/* Section header */}
      <div className="px-4 py-2 bg-surface-subtle border-t border-border">
        <span className="text-xs font-bold uppercase tracking-wide text-text-secondary">
          {title}
        </span>
      </div>

      {/* Account rows */}
      {rows.length > 0 ? (
        <div className="divide-y divide-border/40">
          {rows.map((row, idx) => (
            <div
              key={row.code || idx}
              className={`grid ${cols} items-center px-4 py-2.5 text-sm`}
            >
              <span className="font-mono text-xs text-text-muted">{row.code}</span>
              <span className="text-text-primary truncate">{name(row)}</span>
              <span className="text-end tabular-nums text-text-secondary">
                {formatNumber(row[valueKey], locale)}
              </span>
              {showComparison && (
                <>
                  <span className="text-end tabular-nums text-text-muted">
                    {formatNumber(row[comparisonKey], locale)}
                  </span>
                  <span className="text-end tabular-nums text-text-muted text-xs">
                    {formatNumber(row[deltaKey], locale)}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3 text-sm text-text-muted">{t('common.noData')}</div>
      )}

      {/* Section subtotal */}
      <div
        className={`grid ${cols} items-center px-4 py-2.5 border-t border-border bg-surface-subtle font-semibold text-sm`}
      >
        <span />
        <span className="text-text-primary">{subtotalLabel}</span>
        <span className="text-end tabular-nums">{formatNumber(subtotalValue, locale)}</span>
        {showComparison && (
          <>
            <span className="text-end tabular-nums text-text-muted">
              {formatNumber(comparisonSubtotal, locale)}
            </span>
            <span className="text-end tabular-nums text-text-muted text-xs">
              {formatNumber(deltaSubtotal, locale)}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
