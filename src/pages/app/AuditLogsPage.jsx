import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollText } from 'lucide-react'
import { useAuditLogs } from '@/features/auditLogs/hooks/useAuditLogs'
import { useUsers } from '@/features/users/hooks/useUsers'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { formatDateTime } from '@/shared/utils/formatters'

const ACTION_OPTIONS = [
  { value: '', label: '—' },
  { value: 'journal.created', label: 'Journal: Created' },
  { value: 'journal.posted', label: 'Journal: Posted' },
  { value: 'journal.deleted', label: 'Journal: Deleted' },
  { value: 'account.created', label: 'Account: Created' },
  { value: 'account.updated', label: 'Account: Updated' },
  { value: 'account.deleted', label: 'Account: Deleted' },
  { value: 'user.invited', label: 'User: Invited' },
  { value: 'user.deactivated', label: 'User: Deactivated' },
  { value: 'user.role_changed', label: 'User: Role Changed' },
  { value: 'fiscalPeriod.closed', label: 'Period: Closed' },
  { value: 'fiscalPeriod.locked', label: 'Period: Locked' },
  { value: 'fiscalPeriod.reopened', label: 'Period: Reopened' },
  { value: 'tenant.updated', label: 'Company: Updated' },
]

const RESOURCE_TYPE_OPTIONS = [
  { value: '', label: '—' },
  { value: 'JournalEntry', label: 'JournalEntry' },
  { value: 'Account', label: 'Account' },
  { value: 'User', label: 'User' },
  { value: 'FiscalPeriod', label: 'FiscalPeriod' },
  { value: 'Tenant', label: 'Tenant' },
]

const INPUT_CLASS =
  'h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus'

const PAGE_SIZE = 20

const DEFAULT_FILTERS = {
  action: '',
  resourceType: '',
  resourceId: '',
  userId: '',
  startDate: '',
  endDate: '',
}

function cleanFilters(filters) {
  return Object.entries(filters).reduce((result, [key, value]) => {
    if (value) {
      result[key] = value
    }
    return result
  }, {})
}

function summarizeDetails(log, t) {
  const oldValues = log?.oldValues && typeof log.oldValues === 'object' && !Array.isArray(log.oldValues)
    ? log.oldValues
    : null
  const newValues = log?.newValues && typeof log.newValues === 'object' && !Array.isArray(log.newValues)
    ? log.newValues
    : null

  if (newValues && !oldValues) {
    const fields = Object.keys(newValues)
    return fields.length
      ? t('auditLogs.createdFields', { fields: fields.join(', ') })
      : t('auditLogs.noDetails')
  }

  if (oldValues && newValues) {
    const fields = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]))
      .filter((field) => JSON.stringify(oldValues[field]) !== JSON.stringify(newValues[field]))

    return fields.length
      ? t('auditLogs.changedFields', { fields: fields.join(', ') })
      : t('auditLogs.noDetails')
  }

  if (oldValues && !newValues) {
    const fields = Object.keys(oldValues)
    return fields.length
      ? t('auditLogs.removedFields', { fields: fields.join(', ') })
      : t('auditLogs.noDetails')
  }

  return log?.ip || t('auditLogs.noDetails')
}

function PaginationControls({ pagination, onPageChange, t }) {
  if (!pagination || pagination.totalPages <= 1) return null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 text-sm text-text-muted">
      <span>
        {t('common.showingRange', {
          from: (pagination.page - 1) * pagination.limit + 1,
          to: Math.min(pagination.page * pagination.limit, pagination.total),
          total: pagination.total,
        })}
      </span>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          {t('common.previous')}
        </Button>

        <span className="px-2 tabular-nums">
          {t('common.pageOf', {
            page: pagination.page,
            totalPages: pagination.totalPages,
          })}
        </span>

        <Button
          size="sm"
          variant="secondary"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}

function hasActiveFilters(filters) {
  return Object.values(filters).some(Boolean)
}

export default function AuditLogsPage() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...cleanFilters(appliedFilters),
    }),
    [appliedFilters, page]
  )

  const auditQuery = useAuditLogs(queryParams)
  const usersQuery = useUsers({ limit: 200 })
  const userOptions = useMemo(() => {
    const members = usersQuery.data?.users || []
    return [
      { value: '', label: '—' },
      ...members.map((u) => ({ value: u._id, label: u.name || u.email })),
    ]
  }, [usersQuery.data])
  const logs = auditQuery.data?.logs || []
  const pagination = auditQuery.data?.pagination

  function handleFilterChange(field, value) {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleApplyFilters(event) {
    event.preventDefault()
    setPage(1)
    setAppliedFilters(draftFilters)
  }

  function handleClearFilters() {
    setPage(1)
    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('auditLogs.title')}
        subtitle={t('auditLogs.subtitle')}
      />

      <form onSubmit={handleApplyFilters} className="bg-surface rounded-lg border border-border p-4 mb-5 space-y-3">
        {/* Row 1: Action | Resource Type | User */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              {t('auditLogs.action')}
            </label>
            <Select
              value={draftFilters.action}
              onChange={(val) => handleFilterChange('action', val)}
              options={ACTION_OPTIONS}
              placeholder={t('auditLogs.actionPlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              {t('auditLogs.resourceType')}
            </label>
            <Select
              value={draftFilters.resourceType}
              onChange={(val) => handleFilterChange('resourceType', val)}
              options={RESOURCE_TYPE_OPTIONS}
              placeholder={t('auditLogs.resourceTypePlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              {t('auditLogs.user')}
            </label>
            <Select
              value={draftFilters.userId}
              onChange={(val) => handleFilterChange('userId', val)}
              options={userOptions}
              placeholder={t('auditLogs.allUsers')}
              isLoading={usersQuery.isLoading}
            />
          </div>
        </div>

        {/* Row 2: Resource ID | From | To */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">
              {t('auditLogs.resourceId')}
            </label>
            <input
              type="text"
              value={draftFilters.resourceId}
              onChange={(event) => handleFilterChange('resourceId', event.target.value)}
              placeholder={t('auditLogs.resourceIdPlaceholder')}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">{t('common.from')}</label>
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(event) => handleFilterChange('startDate', event.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted">{t('common.to')}</label>
            <input
              type="date"
              value={draftFilters.endDate}
              onChange={(event) => handleFilterChange('endDate', event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button size="sm" type="button" variant="ghost" onClick={handleClearFilters}>
            {t('common.clear')}
          </Button>
          <Button size="sm" type="submit">
            {t('common.apply')}
          </Button>
        </div>
      </form>

      {auditQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {auditQuery.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => auditQuery.refetch()}
        />
      )}

      {!auditQuery.isLoading && !auditQuery.isError && !logs.length && (
        <EmptyState
          icon={ScrollText}
          title={hasActiveFilters(appliedFilters) ? (i18n.language === 'ar' ? 'لا توجد نتائج' : 'No results for current filters') : t('auditLogs.emptyTitle')}
          message={hasActiveFilters(appliedFilters) ? (i18n.language === 'ar' ? 'جرب تغيير الفلاتر أو مسحها' : 'Try adjusting or clearing the filters') : t('auditLogs.emptyMessage')}
          action={hasActiveFilters(appliedFilters) ? handleClearFilters : undefined}
          actionLabel={hasActiveFilters(appliedFilters) ? (i18n.language === 'ar' ? 'مسح الفلاتر' : 'Clear filters') : undefined}
        />
      )}

      {!auditQuery.isLoading && !auditQuery.isError && logs.length > 0 && (
        <>
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1040px]">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle">
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted w-48">
                      {t('auditLogs.action')}
                    </th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted w-56">
                      {t('auditLogs.resource')}
                    </th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted w-56">
                      {t('auditLogs.user')}
                    </th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted">
                      {t('auditLogs.summary')}
                    </th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted w-44">
                      {t('auditLogs.timestamp')}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-surface-subtle/60 transition-colors cursor-default">
                      <td className="px-4 py-3.5 align-top">
                        <Badge variant="info" size="sm" className="font-mono">
                          {log.action}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 align-top">
                        <div>
                          <p className="font-medium text-text-primary">{log.resourceType}</p>
                          <p className="text-xs font-mono text-text-muted mt-1 break-all">
                            {log.resourceId}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 align-top">
                        <div>
                          <p className="font-medium text-text-primary">
                            {log.userId?.name || t('auditLogs.noActor')}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {log.userId?.email || '-'}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 align-top text-text-secondary">
                        {summarizeDetails(log, t)}
                      </td>

                      <td className="px-4 py-3.5 align-top text-text-secondary whitespace-nowrap">
                        {formatDateTime(log.createdAt, i18n.language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            t={t}
          />
        </>
      )}
    </div>
  )
}
