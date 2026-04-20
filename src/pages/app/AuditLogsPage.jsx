import { useTranslation } from 'react-i18next'
import { ScrollText } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'

export default function AuditLogsPage() {
  const { t } = useTranslation()
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('auditLogs.title')} />
      <EmptyState icon={ScrollText} title={t('auditLogs.title')} message={t('common.noData')} />
    </div>
  )
}
