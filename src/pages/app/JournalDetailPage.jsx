import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Send, RotateCcw, Trash2, X } from 'lucide-react'
import {
  useJournalById,
  usePostJournal,
  useReverseJournal,
  useDeleteJournal,
} from '@/features/journal/hooks/useJournal'
import { JournalDetail } from '@/features/journal/components/JournalDetail'
import { JournalEditor } from '@/features/journal/components/JournalEditor'
import { JournalStatusBadge } from '@/features/journal/components/JournalStatusBadge'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'

export default function JournalDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'post' | 'reverse' | 'delete'

  const entryQuery = useJournalById(id)
  const postJournal = usePostJournal()
  const reverseJournal = useReverseJournal()
  const deleteJournal = useDeleteJournal()

  const entry = entryQuery.data
  const isDraft = entry?.status === 'draft'
  const isPosted = entry?.status === 'posted'
  const isActionLoading =
    postJournal.isPending || reverseJournal.isPending || deleteJournal.isPending

  async function handleConfirmedAction() {
    try {
      if (confirmAction === 'post') {
        await postJournal.mutateAsync(id)
        entryQuery.refetch()
      } else if (confirmAction === 'reverse') {
        const reversed = await reverseJournal.mutateAsync(id)
        if (reversed?._id) {
          navigate(ROUTES.JOURNAL_DETAIL(reversed._id))
        } else {
          entryQuery.refetch()
        }
      } else if (confirmAction === 'delete') {
        await deleteJournal.mutateAsync(id)
        navigate(ROUTES.JOURNAL)
      }
    } finally {
      setConfirmAction(null)
    }
  }

  const confirmConfig = {
    post: {
      title: t('journal.postConfirmTitle'),
      message: t('journal.postConfirmMessage'),
      label: t('journal.post'),
      variant: 'primary',
    },
    reverse: {
      title: t('journal.reverseConfirmTitle'),
      message: t('journal.reverseConfirmMessage'),
      label: t('journal.reverse'),
      variant: 'secondary',
    },
    delete: {
      title: t('journal.deleteEntry'),
      message: t('journal.deleteConfirm'),
      label: t('common.delete'),
      variant: 'danger',
    },
  }

  if (entryQuery.isLoading) {
    return <LoadingState message={t('common.loading')} />
  }

  if (entryQuery.isError) {
    return (
      <ErrorState
        title={t('common.somethingWentWrong')}
        onRetry={() => entryQuery.refetch()}
      />
    )
  }

  if (!entry) return null

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={entry.entryNumber || t('journal.entryDetails')}
        subtitle={
          <span className="flex items-center gap-2">
            <JournalStatusBadge status={entry.status} />
            <span className="text-sm text-text-muted">{t('journal.title')}</span>
          </span>
        }
        breadcrumbs={[
          { label: t('journal.title'), href: ROUTES.JOURNAL },
          { label: entry.entryNumber || t('journal.entryDetails') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                title={t('common.cancel')}
              >
                <X size={14} />
                {t('common.cancel')}
              </Button>
            ) : (
              <>
                {isDraft && (
                  <>
                    <PermissionGate permission={PERMISSIONS.JOURNAL_UPDATE}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil size={14} />
                        {t('common.edit')}
                      </Button>
                    </PermissionGate>

                    <PermissionGate permission={PERMISSIONS.JOURNAL_POST}>
                      <Button
                        size="sm"
                        onClick={() => setConfirmAction('post')}
                        isLoading={postJournal.isPending}
                      >
                        <Send size={14} />
                        {t('journal.post')}
                      </Button>
                    </PermissionGate>

                    <PermissionGate permission={PERMISSIONS.JOURNAL_DELETE}>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirmAction('delete')}
                      >
                        <Trash2 size={14} />
                        {t('common.delete')}
                      </Button>
                    </PermissionGate>
                  </>
                )}

                {isPosted && (
                  <PermissionGate permission={PERMISSIONS.JOURNAL_POST}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setConfirmAction('reverse')}
                      isLoading={reverseJournal.isPending}
                    >
                      <RotateCcw size={14} />
                      {t('journal.reverse')}
                    </Button>
                  </PermissionGate>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="max-w-4xl">
        {isEditing ? (
          <JournalEditor
            entry={entry}
            onSuccess={() => {
              setIsEditing(false)
              entryQuery.refetch()
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="bg-surface rounded-lg border border-border p-5 sm:p-6">
            <JournalDetail entry={entry} />
          </div>
        )}
      </div>

      {/* ── Confirm dialog ── */}
      {confirmAction && (
        <ConfirmDialog
          open
          title={confirmConfig[confirmAction].title}
          message={confirmConfig[confirmAction].message}
          confirmLabel={confirmConfig[confirmAction].label}
          confirmVariant={confirmConfig[confirmAction].variant}
          isLoading={isActionLoading}
          onConfirm={handleConfirmedAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}
