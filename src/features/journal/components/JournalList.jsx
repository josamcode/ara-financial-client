import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { JournalStatusBadge } from './JournalStatusBadge'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { formatDate, formatNumber } from '@/shared/utils/formatters'

export function JournalList({ entries, onView, onEdit, onDelete }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  if (!entries?.length) return null

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[6rem_6rem_1fr_6rem_7rem_7rem_5rem_5rem] items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-subtle">
        <span className="text-xs font-semibold text-text-muted truncate">{t('journal.entryNumber')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('common.date')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('common.description')}</span>
        <span className="text-xs font-semibold text-text-muted truncate">{t('journal.reference')}</span>
        <span className="text-xs font-semibold text-text-muted text-end">{t('common.debit')}</span>
        <span className="text-xs font-semibold text-text-muted text-end">{t('common.credit')}</span>
        <span className="text-xs font-semibold text-text-muted text-center">{t('common.status')}</span>
        <span className="w-20" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {entries.map((entry) => {
          const totalDebit =
            entry.totalDebit ??
            entry.lines?.reduce((sum, line) => sum + (Number(line.debit) || 0), 0) ??
            0
          const totalCredit =
            entry.totalCredit ??
            entry.lines?.reduce((sum, line) => sum + (Number(line.credit) || 0), 0) ??
            0

          return (
          <div
            key={entry._id}
            className="group grid grid-cols-[1fr_auto] sm:grid-cols-[6rem_6rem_1fr_6rem_7rem_7rem_5rem_5rem] items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors"
          >
            {/* Mobile: stacked layout */}
            <div className="sm:contents">
              {/* Entry number */}
              <span className="text-xs font-mono text-gray-400 truncate hidden sm:block">
                {entry.entryNumber || '—'}
              </span>

              {/* Date */}
              <span className="text-xs text-text-secondary tabular-nums hidden sm:block">
                {formatDate(entry.date, i18n.language)}
              </span>

              {/* Description — mobile shows number + date inline */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:block">
                  <span className="text-xs font-mono text-gray-400 sm:hidden shrink-0">
                    {entry.entryNumber || '—'}
                  </span>
                  <span className="text-sm font-medium text-text-primary truncate block">
                    {entry.description || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 sm:hidden">
                  <span className="text-xs text-text-muted">
                    {formatDate(entry.date, i18n.language)}
                  </span>
                  {entry.reference && (
                    <span className="text-xs text-text-muted truncate">{entry.reference}</span>
                  )}
                </div>
              </div>

              {/* Reference (desktop) */}
              <span className="text-xs text-text-muted truncate hidden sm:block">
                {entry.reference || '—'}
              </span>

              {/* Debit */}
              <span className="text-xs tabular-nums text-text-secondary text-end hidden sm:block">
                {formatNumber(totalDebit, locale)}
              </span>

              {/* Credit */}
              <span className="text-xs tabular-nums text-text-secondary text-end hidden sm:block">
                {formatNumber(totalCredit, locale)}
              </span>

              {/* Status */}
              <span className="hidden sm:flex justify-center">
                <JournalStatusBadge status={entry.status} size="sm" />
              </span>
            </div>

            {/* Actions column */}
            <div
              className={cn(
                'flex items-center justify-end gap-0.5',
                'sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity'
              )}
            >
              {/* Mobile: status badge inline with actions */}
              <span className="sm:hidden me-1">
                <JournalStatusBadge status={entry.status} size="sm" />
              </span>

              <button
                onClick={() => onView?.(entry)}
                title={t('common.view')}
                className="p-1.5 rounded text-gray-400 hover:text-text-primary hover:bg-gray-100 transition-colors"
              >
                <Eye size={13} />
              </button>

              {entry.status === 'draft' && (
                <PermissionGate permission={PERMISSIONS.JOURNAL_UPDATE}>
                  <button
                    onClick={() => onEdit?.(entry)}
                    title={t('common.edit')}
                    className="p-1.5 rounded text-gray-400 hover:text-text-primary hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                </PermissionGate>
              )}

              {entry.status === 'draft' && (
                <PermissionGate permission={PERMISSIONS.JOURNAL_DELETE}>
                  <button
                    onClick={() => onDelete?.(entry)}
                    title={t('common.delete')}
                    className="p-1.5 rounded text-gray-400 hover:text-error hover:bg-error-soft transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </PermissionGate>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}
