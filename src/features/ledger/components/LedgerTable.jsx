import { useTranslation } from 'react-i18next'
import { formatDate, formatNumber } from '@/shared/utils/formatters'

function AmountCell({ value }) {
  const num = parseFloat(value)
  if (!value || isNaN(num) || num === 0) {
    return <span className="text-text-muted select-none">—</span>
  }
  return (
    <span className="tabular-nums font-mono text-text-primary">
      {formatNumber(value)}
    </span>
  )
}

function BalanceCell({ value }) {
  const num = parseFloat(value)
  if (isNaN(num)) return <span className="text-text-muted">—</span>

  const isNegative = num < 0
  const formatted = formatNumber(Math.abs(num).toFixed(2))

  return (
    <span
      className={[
        'tabular-nums font-mono font-semibold',
        isNegative ? 'text-error-600' : 'text-text-primary',
      ].join(' ')}
    >
      {isNegative ? `(${formatted})` : formatted}
    </span>
  )
}

export function LedgerTable({ movements, openingBalance, showOpeningBalance, account }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar' : 'en'

  const hasMovements = movements && movements.length > 0
  const showOpening =
    showOpeningBalance &&
    account &&
    (parseFloat(openingBalance) !== 0 || showOpeningBalance === 'always')

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-surface-subtle">
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-28">
                {t('common.date')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-24">
                {t('ledger.entryNumber')}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted">
                {t('common.description')}
              </th>
              <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted w-32">
                {t('common.debit')}
              </th>
              <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted w-32">
                {t('common.credit')}
              </th>
              <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted w-36">
                {t('ledger.runningBalance')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {/* Opening balance row — only shown on page 1 when startDate is set */}
            {showOpening && (
              <tr className="bg-primary/5">
                <td className="px-4 py-2.5 text-xs text-text-muted" colSpan={2}>
                  {t('ledger.openingBalance')}
                </td>
                <td className="px-4 py-2.5 text-xs text-text-secondary italic">
                  {t('ledger.openingBalanceDesc')}
                </td>
                <td className="px-4 py-2.5" />
                <td className="px-4 py-2.5" />
                <td className="px-4 py-2.5 text-end">
                  <BalanceCell value={openingBalance} />
                </td>
              </tr>
            )}

            {/* Movement rows */}
            {hasMovements ? (
              movements.map((row, idx) => (
                <tr
                  key={`${row.entryNumber}-${idx}`}
                  className="hover:bg-surface-muted transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-text-secondary tabular-nums whitespace-nowrap">
                    {formatDate(row.date, locale)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-text-muted">
                    #{row.entryNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">
                    <span className="truncate block max-w-xs" title={row.description}>
                      {row.description || '—'}
                    </span>
                    {row.reference && (
                      <span className="text-xs text-text-muted mt-0.5 block">{row.reference}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <AmountCell value={row.debit} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <AmountCell value={row.credit} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <BalanceCell value={row.runningBalance} />
                  </td>
                </tr>
              ))
            ) : (
              !showOpening && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-text-muted">
                    {t('ledger.emptyMessage')}
                  </td>
                </tr>
              )
            )}
          </tbody>

          {/* Footer totals row for current page */}
          {hasMovements && (
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-subtle">
                <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-text-muted">
                  {t('ledger.pageTotals')}
                </td>
                <td className="px-4 py-2.5 text-end">
                  <span className="tabular-nums font-mono text-xs font-semibold text-text-secondary">
                    {formatNumber(
                      movements
                        .reduce((sum, r) => sum + parseFloat(r.debit || '0'), 0)
                        .toFixed(2)
                    )}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-end">
                  <span className="tabular-nums font-mono text-xs font-semibold text-text-secondary">
                    {formatNumber(
                      movements
                        .reduce((sum, r) => sum + parseFloat(r.credit || '0'), 0)
                        .toFixed(2)
                    )}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-end">
                  {movements.length > 0 && (
                    <BalanceCell value={movements[movements.length - 1].runningBalance} />
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
