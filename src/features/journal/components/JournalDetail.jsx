import { useTranslation } from 'react-i18next'
import { JournalStatusBadge } from './JournalStatusBadge'
import { formatDate, formatDateTime, formatNumber } from '@/shared/utils/formatters'
import { cn } from '@/shared/utils/cn'
import { ArrowLeftRight } from 'lucide-react'

export function JournalDetail({ entry }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const isArabic = i18n.language === 'ar'

  if (!entry) return null

  const totalDebit =
    entry.totalDebit ??
    entry.lines?.reduce((sum, line) => sum + (Number(line.debit) || 0), 0) ??
    0
  const totalCredit =
    entry.totalCredit ??
    entry.lines?.reduce((sum, line) => sum + (Number(line.credit) || 0), 0) ??
    0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wide">
              {entry.entryNumber || '-'}
            </span>
            <JournalStatusBadge status={entry.status} />
          </div>
          <div className="text-base font-semibold text-text-primary leading-snug">
            {entry.description}
          </div>
          {entry.reference && (
            <div className="text-xs text-text-muted">
              {t('journal.reference')}:{' '}
              <span className="text-text-secondary font-medium">{entry.reference}</span>
            </div>
          )}
        </div>
        <div className="text-end shrink-0">
          <div className="text-sm font-medium text-text-primary">
            {formatDate(entry.date, i18n.language)}
          </div>
        </div>
      </div>

      {(entry.reversedEntryId || entry.reversalEntryId) && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-info-soft border border-info/20 text-xs text-info">
          <ArrowLeftRight size={13} className="shrink-0 mt-0.5" />
          <span>
            {entry.reversedEntryId
              ? `${t('journal.reversalOf')}: ${entry.reversedEntryId}`
              : `${t('journal.reversedBy')}: ${entry.reversalEntryId}`}
          </span>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-2.5 bg-surface-subtle border-b border-border">
          <span className="text-xs font-semibold text-text-muted w-6 text-center">#</span>
          <span className="text-xs font-semibold text-text-muted">{t('journal.account')}</span>
          <span className="text-xs font-semibold text-text-muted w-28 text-end">
            {t('common.debit')}
          </span>
          <span className="text-xs font-semibold text-text-muted w-28 text-end">
            {t('common.credit')}
          </span>
        </div>

        <div className="divide-y divide-border">
          {entry.lines?.map((line, idx) => {
            const account =
              line.account ??
              (line.accountId && typeof line.accountId === 'object' ? line.accountId : null)
            const accountName = account
              ? isArabic
                ? account.nameAr || account.nameEn
                : account.nameEn || account.nameAr
              : null

            return (
              <div
                key={line._id || idx}
                className="grid grid-cols-[auto_1fr_auto_auto] items-start gap-3 px-4 py-3"
              >
                <span className="w-6 text-center text-xs text-text-muted pt-0.5 select-none">
                  {idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-mono text-gray-400 shrink-0">
                      {account?.code || '-'}
                    </span>
                    <span className="text-sm font-medium text-text-primary truncate">
                      {accountName || '-'}
                    </span>
                  </div>
                  {line.description && (
                    <div className="text-xs text-text-muted mt-0.5">{line.description}</div>
                  )}
                </div>

                <span
                  className={cn(
                    'text-sm w-28 text-end tabular-nums',
                    line.debit > 0 ? 'font-semibold text-text-primary' : 'text-text-muted'
                  )}
                >
                  {line.debit > 0 ? formatNumber(line.debit, locale) : '-'}
                </span>

                <span
                  className={cn(
                    'text-sm w-28 text-end tabular-nums',
                    line.credit > 0 ? 'font-semibold text-text-primary' : 'text-text-muted'
                  )}
                >
                  {line.credit > 0 ? formatNumber(line.credit, locale) : '-'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-2.5 bg-surface-subtle border-t border-border">
          <span className="w-6" />
          <span className="text-xs font-semibold text-text-secondary">{t('common.total')}</span>
          <span className="text-sm font-semibold text-text-primary w-28 text-end tabular-nums">
            {formatNumber(totalDebit, locale)}
          </span>
          <span className="text-sm font-semibold text-text-primary w-28 text-end tabular-nums">
            {formatNumber(totalCredit, locale)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {entry.createdBy && (
          <div className="text-xs text-text-muted">
            <span className="block text-text-secondary font-medium mb-0.5">
              {t('common.createdAt')}
            </span>
            {formatDateTime(entry.createdAt, i18n.language)}
            {entry.createdBy?.name && (
              <span className="text-text-primary"> - {entry.createdBy.name}</span>
            )}
          </div>
        )}
        {entry.postedAt && (
          <div className="text-xs text-text-muted">
            <span className="block text-text-secondary font-medium mb-0.5">
              {t('journal.postedAt')}
            </span>
            {formatDateTime(entry.postedAt, i18n.language)}
          </div>
        )}
        {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
          <div className="text-xs text-text-muted">
            <span className="block text-text-secondary font-medium mb-0.5">
              {t('common.updatedAt')}
            </span>
            {formatDateTime(entry.updatedAt, i18n.language)}
          </div>
        )}
      </div>
    </div>
  )
}
