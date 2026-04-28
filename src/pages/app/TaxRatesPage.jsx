import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Pencil, Percent, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { Select } from '@/shared/components/Select'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { TaxRateForm } from '@/features/taxes/components/TaxRateForm'
import {
  useCreateTaxRate,
  useSetTaxRateActiveStatus,
  useTaxRates,
  useUpdateTaxRate,
} from '@/features/taxes/hooks/useTaxRates'
import { useAuth } from '@/entities/auth/model/useAuth'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'

const PAGE_SIZE = 20

function formatRate(value, language) {
  const rate = Number(value)
  if (!Number.isFinite(rate)) return '-'
  return `${rate.toLocaleString(language, { maximumFractionDigits: 6 })}%`
}

export default function TaxRatesPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  const canManage = hasPermission(user, PERMISSIONS.TAX_MANAGE)

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: appliedSearch || undefined,
      type: type || undefined,
      isActive: status || undefined,
    }),
    [appliedSearch, page, status, type]
  )

  const { data, isLoading, isError, refetch } = useTaxRates(queryParams)
  const createMutation = useCreateTaxRate()
  const updateMutation = useUpdateTaxRate()
  const statusMutation = useSetTaxRateActiveStatus()

  const taxRates = data?.taxRates ?? []
  const pagination = data?.pagination ?? null

  const createAction = canManage ? (
    <Button onClick={openCreate}>
      <Plus size={16} />
      {t('taxRates.new')}
    </Button>
  ) : null

  function openCreate() {
    setEditTarget(null)
    setPanelOpen(true)
  }

  function openEdit(taxRate) {
    setEditTarget(taxRate)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditTarget(null)
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'Enter') {
      setAppliedSearch(search.trim())
      setPage(1)
    }
  }

  function handleTypeChange(nextType) {
    setType(nextType)
    setPage(1)
  }

  function handleStatusChange(nextStatus) {
    setStatus(nextStatus)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setAppliedSearch('')
    setType('')
    setStatus('')
    setPage(1)
  }

  async function handleFormSubmit(formData) {
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget._id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    closePanel()
  }

  async function handleActivate(taxRate) {
    await statusMutation.mutateAsync({ id: taxRate._id, isActive: true })
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget) return
    await statusMutation.mutateAsync({ id: deactivateTarget._id, isActive: false })
    setDeactivateTarget(null)
  }

  const hasFilters = Boolean(appliedSearch || type || status)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('taxRates.title')}
        subtitle={t('taxRates.subtitle')}
        actions={createAction}
      />

      <div className="filter-bar">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="h-input w-full rounded-md border border-input bg-surface ps-9 pe-3 text-sm focus:border-primary focus:outline-none"
            placeholder={t('taxRates.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={type}
            onChange={handleTypeChange}
            options={[
              { value: '', label: t('taxRates.allTypes') },
              { value: 'both', label: t('taxRates.types.both') },
              { value: 'sales', label: t('taxRates.types.sales') },
              { value: 'purchase', label: t('taxRates.types.purchase') },
            ]}
          />
        </div>

        <div className="w-full sm:w-40">
          <Select
            value={status}
            onChange={handleStatusChange}
            options={[
              { value: '', label: t('taxRates.allStatuses') },
              { value: 'true', label: t('common.active') },
              { value: 'false', label: t('common.inactive') },
            ]}
          />
        </div>

        {hasFilters && (
          <Button type="button" variant="secondary" onClick={clearFilters}>
            {t('common.clear')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState message={t('common.loading')} />
      ) : isError ? (
        <ErrorState title={t('common.somethingWentWrong')} onRetry={refetch} />
      ) : taxRates.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border">
          <EmptyState
            icon={Percent}
            title={hasFilters ? t('common.noResults') : t('taxRates.emptyTitle')}
            message={hasFilters ? t('taxRates.emptySearchDesc') : t('taxRates.emptyDesc')}
            actions={canManage && !hasFilters ? createAction : null}
          />
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 text-start">{t('taxRates.name')}</th>
                  <th className="px-4 py-3 text-start w-36">{t('taxRates.code')}</th>
                  <th className="px-4 py-3 text-start w-28">{t('taxRates.rate')}</th>
                  <th className="px-4 py-3 text-start w-36">{t('taxRates.type')}</th>
                  <th className="px-4 py-3 text-start w-32">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end w-28">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {taxRates.map((taxRate) => (
                  <tr key={taxRate._id} className="transition-colors hover:bg-surface-subtle">
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-text-primary">{taxRate.name}</p>
                      {taxRate.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                          {taxRate.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      {taxRate.code || '-'}
                    </td>
                    <td className="px-4 py-3 align-top font-medium tabular-nums text-text-primary">
                      {formatRate(taxRate.rate, i18n.language)}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      {t(`taxRates.types.${taxRate.type}`, { defaultValue: taxRate.type || '-' })}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={taxRate.isActive ? 'success' : 'default'} size="sm">
                        {taxRate.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(taxRate)}
                              className="rounded p-1.5 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                              title={t('common.edit')}
                            >
                              <Pencil size={13} />
                            </button>
                            {taxRate.isActive ? (
                              <button
                                type="button"
                                onClick={() => setDeactivateTarget(taxRate)}
                                className="rounded p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                                title={t('taxRates.deactivate')}
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActivate(taxRate)}
                                className="rounded p-1.5 text-text-muted transition-colors hover:bg-success/10 hover:text-success"
                                title={t('taxRates.activate')}
                                disabled={statusMutation.isPending}
                              >
                                <CheckCircle2 size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={(nextPage) => setPage(nextPage)}
            className="px-4 border-t border-border"
          />
        </Card>
      )}

      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title={editTarget ? t('taxRates.edit') : t('taxRates.new')}
        width="md"
      >
        <TaxRateForm
          defaultValues={editTarget ?? undefined}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={closePanel}
        />
      </SlidePanel>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={t('taxRates.deleteTitle')}
        message={t('taxRates.deleteMessage', { name: deactivateTarget?.name })}
        confirmLabel={t('taxRates.deactivate')}
        confirmVariant="danger"
        isLoading={statusMutation.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
