import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-700',
}

export function BillStatusBadge({ status }) {
  const { t } = useTranslation()

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {t(`bills.status.${status}`, { defaultValue: status })}
    </span>
  )
}
