import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/Badge'

const variantMap = {
  draft: 'warning',
  posted: 'success',
}

export function JournalStatusBadge({ status, size = 'md' }) {
  const { t } = useTranslation()
  return (
    <Badge variant={variantMap[status] ?? 'default'} size={size}>
      {t(`journal.${status}`, status)}
    </Badge>
  )
}
