import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { JournalEditor } from '@/features/journal/components/JournalEditor'
import { PageHeader } from '@/shared/components/PageHeader'
import { ROUTES } from '@/shared/constants/routes'

export default function JournalNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('journal.createEntry')}
        subtitle={t('journal.title')}
        breadcrumbs={[
          { label: t('journal.title'), href: ROUTES.JOURNAL },
          { label: t('journal.createEntry') },
        ]}
      />

      <div className="max-w-4xl">
        <JournalEditor
          onSuccess={() => navigate(ROUTES.JOURNAL)}
          onCancel={() => navigate(ROUTES.JOURNAL)}
        />
      </div>
    </div>
  )
}
