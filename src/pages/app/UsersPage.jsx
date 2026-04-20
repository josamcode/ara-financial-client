import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'

export default function UsersPage() {
  const { t } = useTranslation()
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('users.title')} />
      <EmptyState icon={Users} title={t('users.title')} message={t('common.noData')} />
    </div>
  )
}
