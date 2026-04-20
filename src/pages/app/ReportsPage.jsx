import { useTranslation } from 'react-i18next'
import { BarChart2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'

export default function ReportsPage() {
  const { t } = useTranslation()
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('reports.title')} />
      <EmptyState icon={BarChart2} title={t('reports.title')} message={t('common.noData')} />
    </div>
  )
}
