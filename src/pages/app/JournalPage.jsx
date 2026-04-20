import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import { useJournalList, useDeleteJournal } from '@/features/journal/hooks/useJournal'
import { JournalList } from '@/features/journal/components/JournalList'
import { JournalDetail } from '@/features/journal/components/JournalDetail'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'

export default function JournalPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [viewEntry, setViewEntry] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [search, statusFilter, dateFrom, dateTo]
  )

  const listQuery = useJournalList(queryParams)
  const deleteJournal = useDeleteJournal()

  const entries = useMemo(() => {
    const data = listQuery.data
    if (!data) return []
    if (Array.isArray(data)) return data
    return data.entries || data.data || []
  }, [listQuery.data])

  function handleView(entry) {
    setViewEntry(entry)
  }

  function handleEdit(entry) {
    navigate(ROUTES.JOURNAL_DETAIL(entry._id))
  }

  function handleDeleteRequest(entry) {
    setDeleteTarget(entry)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    await deleteJournal.mutateAsync(deleteTarget._id)
    setDeleteTarget(null)
    if (viewEntry?._id === deleteTarget._id) setViewEntry(null)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('journal.title')}
        subtitle={t('journal.subtitle')}
        actions={
          <PermissionGate permission={PERMISSIONS.JOURNAL_CREATE}>
            <Button size="sm" onClick={() => navigate(ROUTES.JOURNAL_NEW)}>
              <Plus size={15} />
              {t('journal.createEntry')}
            </Button>
          </PermissionGate>
        }
      />

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute inset-y-0 start-3 my-auto text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder={t('journal.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-input w-full rounded-md border border-input bg-surface ps-9 pe-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-focus"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
        >
          <option value="">{t('journal.allStatuses')}</option>
          <option value="draft">{t('journal.draft')}</option>
          <option value="posted">{t('journal.posted')}</option>
          <option value="reversed">{t('journal.reversed')}</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title={t('common.from')}
          className="h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title={t('common.to')}
          className="h-input rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
        />
      </div>

      {/* ── States ── */}
      {listQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {listQuery.isError && (
        <ErrorState title={t('common.somethingWentWrong')} onRetry={() => listQuery.refetch()} />
      )}

      {!listQuery.isLoading && !listQuery.isError && !entries.length && (
        <EmptyState
          icon={FileText}
          title={t('journal.emptyTitle')}
          message={t('journal.emptyMessage')}
          actions={
            <PermissionGate permission={PERMISSIONS.JOURNAL_CREATE}>
              <Button size="sm" className="mt-5" onClick={() => navigate(ROUTES.JOURNAL_NEW)}>
                <Plus size={15} />
                {t('journal.createFirst')}
              </Button>
            </PermissionGate>
          }
        />
      )}

      {!listQuery.isLoading && !listQuery.isError && entries.length > 0 && (
        <JournalList
          entries={entries}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      {/* ── Detail slide panel ── */}
      <SlidePanel
        open={!!viewEntry}
        onClose={() => setViewEntry(null)}
        title={viewEntry?.entryNumber || t('journal.entryDetails')}
        width="lg"
        footer={
          viewEntry && (
            <div className="flex items-center gap-2 justify-end">
              {viewEntry.status === 'draft' && (
                <PermissionGate permission={PERMISSIONS.JOURNAL_UPDATE}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setViewEntry(null)
                      navigate(ROUTES.JOURNAL_DETAIL(viewEntry._id))
                    }}
                  >
                    {t('common.edit')}
                  </Button>
                </PermissionGate>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setViewEntry(null)
                  navigate(ROUTES.JOURNAL_DETAIL(viewEntry._id))
                }}
              >
                {t('journal.openEntry')}
              </Button>
            </div>
          )
        }
      >
        {viewEntry && <JournalDetail entry={viewEntry} />}
      </SlidePanel>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('journal.deleteEntry')}
        message={t('journal.deleteConfirm')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        isLoading={deleteJournal.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
