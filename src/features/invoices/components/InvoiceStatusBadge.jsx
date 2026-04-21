import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-500 line-through',
}

export function InvoiceStatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {t(`invoices.status.${status}`, { defaultValue: status })}
    </span>
  )
}
