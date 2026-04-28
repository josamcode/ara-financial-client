import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserPlus, Pencil, Trash2, Search } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import {
  useCustomerList,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/features/customers/hooks/useCustomers'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/entities/auth/model/useAuth'

export default function CustomersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canCreate = hasPermission(user, PERMISSIONS.CUSTOMER_CREATE)
  const canUpdate = hasPermission(user, PERMISSIONS.CUSTOMER_UPDATE)
  const canDelete = hasPermission(user, PERMISSIONS.CUSTOMER_DELETE)

  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading, isError, refetch } = useCustomerList({ page, limit: 20, search: appliedSearch || undefined })
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const deleteMutation = useDeleteCustomer()

  const customers = data?.customers ?? []
  const pagination = data?.pagination

  function openCreate() {
    setEditTarget(null)
    setPanelOpen(true)
  }

  function openEdit(customer) {
    setEditTarget(customer)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditTarget(null)
  }

  const createAction = canCreate ? (
    <Button onClick={openCreate}>
      <UserPlus size={16} />
      {t('customers.new')}
    </Button>
  ) : null

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
        actions={createAction}
      />

      {/* Search */}
      <div className="filter-bar">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            className="h-input w-full rounded-md border border-input bg-surface ps-9 pe-3 text-sm focus:outline-none focus:border-primary"
            placeholder={t('customers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : customers.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border">
          <EmptyState
            title={appliedSearch ? t('common.noResults') : t('customers.emptyTitle')}
            description={appliedSearch ? t('customers.emptySearchDesc') : t('customers.emptyDesc')}
            action={canCreate && !appliedSearch ? createAction : null}
          />
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-text-muted text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-start">{t('common.name')}</th>
                  <th className="px-4 py-3 text-start">{t('common.email')}</th>
                  <th className="px-4 py-3 text-start">{t('common.phone')}</th>
                  {(canUpdate || canDelete) && <th className="px-4 py-3 w-20" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      <button
                        onClick={() => navigate(ROUTES.CUSTOMER_DETAIL(c._id))}
                        className="hover:text-primary hover:underline transition-colors text-start"
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.phone || '—'}</td>
                    {(canUpdate || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <button
                              onClick={() => openEdit(c)}
                              className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                              title={t('common.edit')}
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                              title={t('common.delete')}
                            >
                              <Trash2 size={13} />
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

          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
            className="px-4 border-t border-border"
          />
        </Card>
      )}

      {/* Create / Edit panel */}
      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title={editTarget ? t('customers.edit') : t('customers.new')}
        width="md"
      >
        <CustomerForm
          defaultValues={editTarget ?? undefined}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={closePanel}
        />
      </SlidePanel>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('customers.deleteTitle')}
        message={t('customers.deleteMessage', { name: deleteTarget?.name })}
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
