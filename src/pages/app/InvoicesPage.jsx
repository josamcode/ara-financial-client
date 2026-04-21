import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { LoadingState } from '@/shared/components/LoadingState'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { Select } from '@/shared/components/Select'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { useInvoiceList, useDeleteInvoice } from '@/features/invoices/hooks/useInvoices'
import { InvoiceList } from '@/features/invoices/components/InvoiceList'

const STATUS_OPTIONS = [
  { value: '', label: '' },
  { value: 'draft', label: 'draft' },
  { value: 'sent', label: 'sent' },
  { value: 'paid', label: 'paid' },
  { value: 'overdue', label: 'overdue' },
  { value: 'cancelled', label: 'cancelled' },
]

export default function InvoicesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const params = { page, limit: 20, ...(statusFilter ? { status: statusFilter } : {}) }
  const { data, isLoading, isError, refetch } = useInvoiceList(params)
  const deleteMutation = useDeleteInvoice()

  const invoices = data?.data ?? []
  const pagination = data?.meta?.pagination

  const statusOptions = STATUS_OPTIONS.map((o) => ({
    value: o.value,
    label: o.value ? t(`invoices.status.${o.value}`) : t('common.filter'),
  }))

  function handleView(invoice) {
    navigate(ROUTES.INVOICE_DETAIL(invoice._id))
  }

  function handleDelete(invoice) {
    if (window.confirm(t('invoices.confirmDelete', { number: invoice.invoiceNumber }))) {
      deleteMutation.mutate(invoice._id)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={t('nav.invoices')}
        actions={
          <PermissionGate permission={PERMISSIONS.INVOICE_CREATE}>
            <Button onClick={() => navigate(ROUTES.INVOICE_NEW)}>
              <Plus size={16} className="me-2" />
              {t('invoices.new')}
            </Button>
          </PermissionGate>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <Select
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1) }}
          options={statusOptions}
          wrapperClassName="w-40"
        />
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && invoices.length === 0 && (
        <EmptyState
          title={t('invoices.empty')}
          description={t('invoices.emptyDescription')}
          action={
            <PermissionGate permission={PERMISSIONS.INVOICE_CREATE}>
              <Button onClick={() => navigate(ROUTES.INVOICE_NEW)}>
                <Plus size={16} className="me-2" />
                {t('invoices.new')}
              </Button>
            </PermissionGate>
          }
        />
      )}

      {!isLoading && !isError && invoices.length > 0 && (
        <>
          <InvoiceList invoices={invoices} onView={handleView} onDelete={handleDelete} />

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
              <span>{t('common.noResults', { replace: '' })}</span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
