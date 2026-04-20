import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Network, List, Search } from 'lucide-react'
import { Select } from '@/shared/components/Select'
import { useAccountTree, useAccountList, useDeleteAccount, useApplyTemplate, useToggleAccountActive } from '@/features/accounts/hooks/useAccounts'
import { AccountTree } from '@/features/accounts/components/AccountTree'
import { AccountList } from '@/features/accounts/components/AccountList'
import { AccountForm } from '@/features/accounts/components/AccountForm'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { cn } from '@/shared/utils/cn'
import { BookOpen } from 'lucide-react'
import { ACCOUNT_TYPES } from '@/shared/constants/app'

// Flatten a tree of accounts into a single array
function flattenTree(nodes, result = []) {
  for (const node of nodes) {
    result.push(node)
    if (node.children?.length) flattenTree(node.children, result)
  }
  return result
}

export default function AccountsPage() {
  const { t } = useTranslation()

  // View mode
  const [view, setView] = useState('tree')

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [defaultParentId, setDefaultParentId] = useState(null)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null)

  // List view filter/search
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Data queries
  const treeQuery = useAccountTree()
  const listQuery = useAccountList(
    view === 'list'
      ? { search: search || undefined, type: typeFilter || undefined }
      : undefined
  )

  // Mutations
  const deleteAccount = useDeleteAccount()
  const applyTemplate = useApplyTemplate()
  const toggleActive = useToggleAccountActive()

  // Flattened list for form parent selector
  const flatAccounts = useMemo(
    () => flattenTree(treeQuery.data || []),
    [treeQuery.data]
  )

  // List accounts filtered client-side for fast feedback (backed by server)
  const displayList = useMemo(() => {
    const data = listQuery.data || []
    if (!search && !typeFilter) return data
    return data.filter((a) => {
      const matchesSearch =
        !search ||
        a.code?.toLowerCase().includes(search.toLowerCase()) ||
        a.name?.toLowerCase().includes(search.toLowerCase())
      const matchesType = !typeFilter || a.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [listQuery.data, search, typeFilter])

  function openCreate(parentNode) {
    setEditingAccount(null)
    setDefaultParentId(parentNode?._id || null)
    setPanelOpen(true)
  }

  function openEdit(account) {
    setEditingAccount(account)
    setDefaultParentId(null)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditingAccount(null)
    setDefaultParentId(null)
  }

  function confirmDelete(account) {
    setDeleteTarget(account)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    await deleteAccount.mutateAsync(deleteTarget._id)
    setDeleteTarget(null)
  }

  function handleToggleActive(account) {
    toggleActive.mutate({ id: account._id, isActive: !account.isActive })
  }

  const isLoading = view === 'tree' ? treeQuery.isLoading : listQuery.isLoading
  const isError = view === 'tree' ? treeQuery.isError : listQuery.isError
  const isEmpty =
    view === 'tree'
      ? !treeQuery.isLoading && !treeQuery.data?.length
      : !listQuery.isLoading && !displayList.length

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('accounts.chartOfAccounts')}
        subtitle={t('accounts.title')}
        actions={
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border border-border rounded-md bg-surface overflow-hidden">
              <button
                onClick={() => setView('tree')}
                title={t('accounts.treeView')}
                className={cn(
                  'p-2 transition-colors',
                  view === 'tree'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-muted'
                )}
              >
                <Network size={15} />
              </button>
              <button
                onClick={() => setView('list')}
                title={t('accounts.listView')}
                className={cn(
                  'p-2 transition-colors',
                  view === 'list'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-muted'
                )}
              >
                <List size={15} />
              </button>
            </div>

            <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
              <Button size="sm" onClick={() => openCreate(null)}>
                <Plus size={15} />
                {t('accounts.createAccount')}
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {/* List-view toolbar */}
      {view === 'list' && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute inset-y-0 start-3 my-auto text-text-muted" />
            <input
              type="search"
              placeholder={t('accounts.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-input w-full rounded-md border border-input bg-surface ps-9 pe-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-focus"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: t('accounts.allTypes') },
              ...ACCOUNT_TYPES.map((type) => ({ value: type, label: t(`accounts.${type}`) })),
            ]}
            className="w-44"
          />
        </div>
      )}

      {/* States */}
      {isLoading && <LoadingState message={t('common.loading')} />}

      {isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => view === 'tree' ? treeQuery.refetch() : listQuery.refetch()}
        />
      )}

      {isEmpty && !isLoading && !isError && (
        <EmptyState
          icon={BookOpen}
          title={t('accounts.emptyTitle')}
          message={t('accounts.emptyMessage')}
          actions={
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-5">
              <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
                <Button size="sm" onClick={() => openCreate(null)}>
                  <Plus size={15} />
                  {t('accounts.createFirst')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => applyTemplate.mutate()}
                  isLoading={applyTemplate.isPending}
                >
                  {t('accounts.applyTemplate')}
                </Button>
              </PermissionGate>
            </div>
          }
        />
      )}

      {/* Tree view */}
      {!isLoading && !isError && !isEmpty && view === 'tree' && (
        <AccountTree
          nodes={treeQuery.data}
          onEdit={openEdit}
          onDelete={confirmDelete}
          onAddChild={openCreate}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* List view */}
      {!isLoading && !isError && !isEmpty && view === 'list' && (
        <AccountList
          accounts={displayList}
          onEdit={openEdit}
          onDelete={confirmDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Create/Edit slide panel */}
      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title={editingAccount ? t('accounts.editAccount') : t('accounts.createAccount')}
      >
        <AccountForm
          account={editingAccount}
          defaultParentId={defaultParentId}
          flatAccounts={flatAccounts}
          onSuccess={closePanel}
          onCancel={closePanel}
        />
      </SlidePanel>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('accounts.deleteAccount')}
        message={t('accounts.deleteConfirm')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        isLoading={deleteAccount.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
