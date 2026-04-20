import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/Badge'

const TYPE_VARIANT = {
  asset: 'asset',
  liability: 'liability',
  equity: 'equity',
  revenue: 'revenue',
  expense: 'expense',
}

export function AccountTypeBadge({ type, size = 'md', className }) {
  const { t } = useTranslation()
  if (!type) return null
  return (
    <Badge variant={TYPE_VARIANT[type] || 'default'} size={size} className={className}>
      {t(`accounts.${type}`)}
    </Badge>
  )
}
