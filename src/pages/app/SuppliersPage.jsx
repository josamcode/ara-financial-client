import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { SupplierForm } from '@/features/suppliers/components/SupplierForm'
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSupplierList,
  useUpdateSupplier,
} from '@/features/suppliers/hooks/useSuppliers'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { useAuth } from '@/entities/auth/model/useAuth'

export default function SuppliersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canCreate = hasPermission(user, PERMISSIONS.SUPPLIER_CREATE)
  const canUpdate = hasPermission(user, PERMISSIONS.SUPPLIER_UPDATE)
  const canDelete = hasPermission(user, PERMISSIONS.SUPPLIER_DELETE)

  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isError, refetch } = useSupplierList({
    page,
    limit: 20,
    search: appliedSearch || undefined,
  })
  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const deleteMutation = useDeleteSupplier()

  const suppliers = data?.suppliers ?? []
  const pagination = data?.pagination

  function openCreate() {
    setEditTarget(null)
    setPanelOpen(true)
  }

  function openEdit(supplier) {
    setEditTarget(supplier)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditTarget(null)
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'Enter') {
      setAppliedSearch(search)
      setPage(1)
    }
  }

  async function handleFormSubmit(formData) {
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget._id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }

    closePanel()
  }

  const createAction = canCreate ? (
    <Button onClick={openCreate}>
      <Plus size={16} className="me-2" />
      {t('suppliers.new')}
    </Button>
  ) : null

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader title={t('suppliers.title')} subtitle={t('suppliers.subtitle')} actions={createAction} />

      <Card className="p-4">
        <div className="relative max-w-xs">
          <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="h-input w-full rounded-md border border-input bg-surface ps-9 pe-3 text-sm focus:border-primary focus:outline-none"
            placeholder={t('suppliers.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </Card>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : suppliers.length === 0 ? (
        <EmptyState
          title={appliedSearch ? t('common.noResults') : t('suppliers.emptyTitle')}
          message={appliedSearch ? t('suppliers.emptySearchDesc') : t('suppliers.emptyDesc')}
          actions={canCreate && !appliedSearch ? createAction : null}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 text-start">{t('common.name')}</th>
                  <th className="px-4 py-3 text-start">{t('common.email')}</th>
                  <th className="px-4 py-3 text-start">{t('common.phone')}</th>
                  {(canUpdate || canDelete) && <th className="w-20 px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suppliers.map((supplier) => (
                  <tr key={supplier._id} className="transition-colors hover:bg-surface-subtle">
                    <td className="px-4 py-3 font-medium text-text-primary">{supplier.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{supplier.email || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary">{supplier.phone || '-'}</td>
                    {(canUpdate || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <button
                              onClick={() => openEdit(supplier)}
                              className="rounded p-1.5 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                              title={t('common.edit')}
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(supplier)}
                              className="rounded p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                              title={t('common.delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
              <span>
                {t('common.showingRange', {
                  from: (pagination.page - 1) * pagination.limit + 1,
                  to: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title={editTarget ? t('suppliers.edit') : t('suppliers.new')}
        width="md"
      >
        <SupplierForm
          defaultValues={editTarget ?? undefined}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={closePanel}
        />
      </SlidePanel>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('suppliers.deleteTitle')}
        message={t('suppliers.deleteMessage', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(deleteTarget._id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
