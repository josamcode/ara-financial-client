import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'

export function PaginationControls({
  pagination,
  onPageChange,
  className,
  rangeLabelKey = 'common.showingRange',
  pageLabelKey = 'common.pageOf',
}) {
  const { t } = useTranslation()

  if (!pagination || pagination.totalPages <= 1) return null

  const from = (pagination.page - 1) * pagination.limit + 1
  const to = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <span>
        {t(rangeLabelKey, {
          from,
          to,
          total: pagination.total,
        })}
      </span>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange?.(pagination.page - 1)}
        >
          {t('common.previous')}
        </Button>

        <span className="px-2 tabular-nums">
          {t(pageLabelKey, {
            page: pagination.page,
            totalPages: pagination.totalPages,
          })}
        </span>

        <Button
          size="sm"
          variant="secondary"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange?.(pagination.page + 1)}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}
