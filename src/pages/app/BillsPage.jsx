import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { Select } from '@/shared/components/Select'
import { ROUTES } from '@/shared/constants/routes'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { BillList } from '@/features/bills/components/BillList'
import { useBillList } from '@/features/bills/hooks/useBills'

const STATUS_OPTIONS = [
  { value: '', label: '' },
  { value: 'draft', label: 'draft' },
  { value: 'posted', label: 'posted' },
  { value: 'partially_paid', label: 'partially_paid' },
  { value: 'paid', label: 'paid' },
  { value: 'overdue', label: 'overdue' },
  { value: 'cancelled', label: 'cancelled' },
]

const STATUS_VALUES = new Set(STATUS_OPTIONS.map((option) => option.value).filter(Boolean))

export default function BillsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const statusParam = searchParams.get('status') ?? ''
  const statusFilter = STATUS_VALUES.has(statusParam) ? statusParam : ''

  const { data, isLoading, isError, refetch } = useBillList({
    page,
    limit: 20,
    ...(statusFilter ? { status: statusFilter } : {}),
  })
  const bills = data?.data ?? []
  const pagination = data?.meta?.pagination
  const statusOptions = STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.value ? t(`bills.status.${option.value}`) : t('common.filter'),
  }))

  function handleView(bill) {
    navigate(ROUTES.BILL_DETAIL(bill._id))
  }

  function handleStatusChange(nextStatus) {
    const nextParams = new URLSearchParams(searchParams)
    if (STATUS_VALUES.has(nextStatus) && nextStatus) {
      nextParams.set('status', nextStatus)
    } else {
      nextParams.delete('status')
    }
    setPage(1)
    setSearchParams(nextParams)
  }

  const createAction = (
    <PermissionGate permission={PERMISSIONS.BILL_CREATE}>
      <Button onClick={() => navigate(ROUTES.BILL_NEW)}>
        <Plus size={16} className="me-2" />
        {t('bills.new')}
      </Button>
    </PermissionGate>
  )

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title={t('nav.bills')} actions={createAction} />

      <div className="mb-4 flex items-center gap-3">
        <Select
          value={statusFilter}
          onChange={handleStatusChange}
          options={statusOptions}
          wrapperClassName="w-40"
        />
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && bills.length === 0 && (
        <EmptyState
          title={t('bills.empty')}
          message={t('bills.emptyDescription')}
          actions={createAction}
        />
      )}

      {!isLoading && !isError && bills.length > 0 && (
        <>
          <BillList bills={bills} onView={handleView} />

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
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
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((value) => value - 1)}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((value) => value + 1)}
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
