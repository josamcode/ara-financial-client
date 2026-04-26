import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Checkbox } from '@/shared/components/Checkbox'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingState } from '@/shared/components/LoadingState'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { PlanLimitNotice } from '@/shared/components/PlanLimitNotice'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { downloadBlob } from '@/shared/utils/downloadBlob'
import { useBillingUsage } from '@/features/billing/hooks/useBilling'
import {
  useExportInvoices,
  useInvoiceList,
  useDeleteInvoice,
  useBulkCancelInvoices,
  useBulkDeleteInvoices,
} from '@/features/invoices/hooks/useInvoices'
import { InvoiceList } from '@/features/invoices/components/InvoiceList'

const STATUS_OPTIONS = [
  { value: '', label: '' },
  { value: 'draft', label: 'draft' },
  { value: 'sent', label: 'sent' },
  { value: 'partially_paid', label: 'partially_paid' },
  { value: 'paid', label: 'paid' },
  { value: 'overdue', label: 'overdue' },
  { value: 'cancelled', label: 'cancelled' },
]

const STATUS_VALUES = new Set(STATUS_OPTIONS.map((option) => option.value).filter(Boolean))
const INACTIVE_SUBSCRIPTION_STATUSES = new Set(['expired', 'cancelled', 'canceled', 'past_due'])

function getBillingUsagePayload(usageData) {
  if (!usageData) return null
  return usageData?.data?.usage ? usageData.data : usageData
}

function toMetricNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function isUsageLimitReached(metric) {
  if (!metric || metric.unlimited) return false
  const percent = metric.percent != null ? toMetricNumber(metric.percent) : 0
  const used = toMetricNumber(metric.used)
  const limit = toMetricNumber(metric.limit)
  return percent >= 100 || (limit > 0 && used >= limit)
}

function isSubscriptionBlocked(subscription) {
  if (!subscription?.status) return false
  return INACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.status).toLowerCase())
}

export default function InvoicesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([])
  const [bulkAction, setBulkAction] = useState(null)
  const [forceInvoicesLimitNotice, setForceInvoicesLimitNotice] = useState(false)
  const statusParam = searchParams.get('status') ?? ''
  const statusFilter = STATUS_VALUES.has(statusParam) ? statusParam : ''
  const searchFilter = searchParams.get('search') ?? ''
  const dateFromFilter = searchParams.get('dateFrom') ?? searchParams.get('startDate') ?? ''
  const dateToFilter = searchParams.get('dateTo') ?? searchParams.get('endDate') ?? ''
  const minAmountFilter = searchParams.get('minAmount') ?? ''
  const maxAmountFilter = searchParams.get('maxAmount') ?? ''
  const searchParamsKey = searchParams.toString()
  const hasActiveFilters = Boolean(
    statusFilter || searchFilter || dateFromFilter || dateToFilter || minAmountFilter || maxAmountFilter
  )

  useEffect(() => {
    setPage(1)
    setSelectedInvoiceIds([])
  }, [searchParamsKey])

  const filterParams = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(searchFilter ? { search: searchFilter } : {}),
    ...(dateFromFilter ? { dateFrom: dateFromFilter } : {}),
    ...(dateToFilter ? { dateTo: dateToFilter } : {}),
    ...(minAmountFilter ? { minAmount: minAmountFilter } : {}),
    ...(maxAmountFilter ? { maxAmount: maxAmountFilter } : {}),
  }
  const listParams = {
    page,
    limit: 20,
    ...filterParams,
  }
  const { data, isLoading, isError, refetch } = useInvoiceList(listParams)
  const billingUsageQuery = useBillingUsage()
  const exportMutation = useExportInvoices()
  const deleteMutation = useDeleteInvoice()
  const bulkCancelMutation = useBulkCancelInvoices()
  const bulkDeleteMutation = useBulkDeleteInvoices()

  const invoices = data?.data ?? []
  const billingUsagePayload = getBillingUsagePayload(billingUsageQuery.data)
  const invoicesUsage = billingUsagePayload?.usage?.invoicesPerMonth ?? null
  const billingSubscription = billingUsagePayload?.subscription ?? null
  const billingPlan =
    billingUsagePayload?.plan ??
    billingSubscription?.planId ??
    billingSubscription?.plan ??
    null
  const invoicesLimitReached = isUsageLimitReached(invoicesUsage)
  const subscriptionBlocked = isSubscriptionBlocked(billingSubscription)
  const invoiceCreateBlocked = invoicesLimitReached || subscriptionBlocked
  const showInvoicesLimitNotice = subscriptionBlocked || invoicesLimitReached || forceInvoicesLimitNotice
  const pagination = data?.meta?.pagination
  const allInvoiceIds = invoices.map((invoice) => invoice._id)
  const selectedInvoices = invoices.filter((invoice) => selectedInvoiceIds.includes(invoice._id))
  const selectedCount = selectedInvoiceIds.length
  const allSelected = allInvoiceIds.length > 0 && allInvoiceIds.every((id) => selectedInvoiceIds.includes(id))
  const canBulkDelete = selectedCount > 0 && selectedInvoices.every((invoice) => invoice.status === 'draft')
  const canBulkCancel = selectedCount > 0 && selectedInvoices.every((invoice) => !['paid', 'cancelled'].includes(invoice.status))

  const statusOptions = STATUS_OPTIONS.map((o) => ({
    value: o.value,
    label: o.value ? t(`invoices.status.${o.value}`) : t('common.filter'),
  }))

  function getBlockedInvoiceToastKey() {
    return subscriptionBlocked
      ? 'planLimit.error.subscriptionInactive'
      : 'planLimit.error.planLimitExceeded'
  }

  function handleCreateInvoice() {
    if (invoiceCreateBlocked) {
      if (invoicesLimitReached) {
        setForceInvoicesLimitNotice(true)
      }
      toast.error(t(getBlockedInvoiceToastKey()))
      return
    }

    navigate(ROUTES.INVOICE_NEW)
  }

  function updateFilters(updates) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('startDate')
    nextParams.delete('endDate')

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value)
      } else {
        nextParams.delete(key)
      }
    })

    setPage(1)
    setSearchParams(nextParams, { replace: true })
  }

  function handleStatusChange(nextStatus) {
    updateFilters({ status: STATUS_VALUES.has(nextStatus) ? nextStatus : '' })
  }

  function handleClearFilters() {
    setPage(1)
    setSearchParams({}, { replace: true })
  }

  function clearSelection() {
    setSelectedInvoiceIds([])
  }

  function handleToggleSelect(invoiceId, checked) {
    setSelectedInvoiceIds((current) => {
      if (checked) {
        return current.includes(invoiceId) ? current : [...current, invoiceId]
      }

      return current.filter((id) => id !== invoiceId)
    })
  }

  function handleToggleSelectAll(checked) {
    setSelectedInvoiceIds(checked ? allInvoiceIds : [])
  }

  function handleView(invoice) {
    navigate(ROUTES.INVOICE_DETAIL(invoice._id))
  }

  function handleDelete(invoice) {
    if (window.confirm(t('invoices.confirmDelete', { number: invoice.invoiceNumber }))) {
      deleteMutation.mutate(invoice._id)
    }
  }

  async function handleExport() {
    try {
      const blob = await exportMutation.mutateAsync(filterParams)
      downloadBlob(blob, 'invoices.csv')
    } catch (_error) {
      // Error feedback is handled by the mutation.
    }
  }

  async function handleBulkConfirm() {
    if (!selectedCount || !bulkAction) return

    if (bulkAction === 'delete') {
      await bulkDeleteMutation.mutateAsync(selectedInvoiceIds)
    }

    if (bulkAction === 'cancel') {
      await bulkCancelMutation.mutateAsync(selectedInvoiceIds)
    }

    setBulkAction(null)
    clearSelection()
    await refetch()
  }

  function handlePreviousPage() {
    clearSelection()
    setPage((currentPage) => currentPage - 1)
  }

  function handleNextPage() {
    clearSelection()
    setPage((currentPage) => currentPage + 1)
  }

  const bulkMutation = bulkAction === 'delete' ? bulkDeleteMutation : bulkCancelMutation

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={t('nav.invoices')}
        actions={
          <PermissionGate permission={PERMISSIONS.INVOICE_CREATE}>
            <Button
              variant={invoiceCreateBlocked ? 'secondary' : 'primary'}
              className={
                invoiceCreateBlocked
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : undefined
              }
              onClick={handleCreateInvoice}
            >
              <Plus size={16} className="me-2" />
              {t('invoices.new')}
            </Button>
          </PermissionGate>
        }
      />

      {showInvoicesLimitNotice && (
        <div className="mb-5">
          <PlanLimitNotice
            type={subscriptionBlocked ? 'subscriptionInactive' : 'invoicesPerMonth'}
            usageItem={invoicesUsage}
            plan={billingPlan}
            subscription={billingSubscription}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Input
          type="search"
          value={searchFilter}
          onChange={(event) => updateFilters({ search: event.target.value })}
          placeholder={t('common.search')}
          wrapperClassName="w-full sm:w-56"
        />
        <Select
          value={statusFilter}
          onChange={handleStatusChange}
          options={statusOptions}
          wrapperClassName="w-full sm:w-40"
        />
        <Input
          type="date"
          value={dateFromFilter}
          onChange={(event) => updateFilters({ dateFrom: event.target.value })}
          aria-label={t('common.from')}
          wrapperClassName="w-full sm:w-40"
        />
        <Input
          type="date"
          value={dateToFilter}
          onChange={(event) => updateFilters({ dateTo: event.target.value })}
          aria-label={t('common.to')}
          wrapperClassName="w-full sm:w-40"
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={minAmountFilter}
          onChange={(event) => updateFilters({ minAmount: event.target.value })}
          placeholder={`${t('common.from')} ${t('common.amount')}`}
          wrapperClassName="w-full sm:w-36"
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={maxAmountFilter}
          onChange={(event) => updateFilters({ maxAmount: event.target.value })}
          placeholder={`${t('common.to')} ${t('common.amount')}`}
          wrapperClassName="w-full sm:w-36"
        />
        <Button variant="secondary" size="sm" onClick={handleClearFilters} disabled={!hasActiveFilters}>
          {t('common.clear')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          isLoading={exportMutation.isPending}
          onClick={handleExport}
        >
          {!exportMutation.isPending && <Download size={14} />}
          {t('common.export')}
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && invoices.length === 0 && (
        <EmptyState
          title={t('invoices.empty')}
          description={t('invoices.emptyDescription')}
          action={
            <PermissionGate permission={PERMISSIONS.INVOICE_CREATE}>
              <Button
                variant={invoiceCreateBlocked ? 'secondary' : 'primary'}
                className={
                  invoiceCreateBlocked
                    ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : undefined
                }
                onClick={handleCreateInvoice}
              >
                <Plus size={16} className="me-2" />
                {t('invoices.new')}
              </Button>
            </PermissionGate>
          }
        />
      )}

      {!isLoading && !isError && invoices.length > 0 && (
        <>
          {selectedCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                  label={t('common.selectCurrentPage')}
                />
                <span className="text-sm text-text-secondary">
                  {t('common.selectedCount', { count: selectedCount })}
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection} disabled={!selectedCount}>
                  {t('common.clear')}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <PermissionGate permission={PERMISSIONS.INVOICE_DELETE}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setBulkAction('delete')}
                    disabled={!canBulkDelete || bulkDeleteMutation.isPending}
                  >
                    {t('invoices.deleteSelected')}
                  </Button>
                </PermissionGate>

                <PermissionGate permission={PERMISSIONS.INVOICE_UPDATE}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setBulkAction('cancel')}
                    disabled={!canBulkCancel || bulkCancelMutation.isPending}
                  >
                    {t('invoices.cancelSelected')}
                  </Button>
                </PermissionGate>
              </div>
            </div>
          )}

          <InvoiceList
            invoices={invoices}
            selectedIds={selectedInvoiceIds}
            onToggleSelect={handleToggleSelect}
            onView={handleView}
            onDelete={handleDelete}
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
              <span>{t('common.noResults', { replace: '' })}</span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={handlePreviousPage}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={handleNextPage}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={bulkAction === 'delete'}
        title={t('invoices.deleteSelected')}
        message={t('invoices.confirmBulkDelete', { count: selectedCount })}
        confirmLabel={t('invoices.deleteSelected')}
        confirmVariant="danger"
        isLoading={bulkMutation.isPending}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkAction(null)}
      />

      <ConfirmDialog
        open={bulkAction === 'cancel'}
        title={t('invoices.cancelSelected')}
        message={t('invoices.confirmBulkCancel', { count: selectedCount })}
        confirmLabel={t('invoices.cancelSelected')}
        confirmVariant="danger"
        isLoading={bulkMutation.isPending}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  )
}
