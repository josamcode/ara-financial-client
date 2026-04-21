import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { ROUTES } from '@/shared/constants/routes'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { BillList } from '@/features/bills/components/BillList'
import { useBillList } from '@/features/bills/hooks/useBills'

export default function BillsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useBillList({ page, limit: 20 })
  const bills = data?.data ?? []
  const pagination = data?.meta?.pagination

  function handleView(bill) {
    navigate(ROUTES.BILL_DETAIL(bill._id))
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
