import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'

export default function FiscalPeriodsPage() {
  const { t } = useTranslation()
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('fiscalPeriods.title')} />
      <EmptyState icon={Calendar} title={t('fiscalPeriods.title')} message={t('common.noData')} />
    </div>
  )
}
