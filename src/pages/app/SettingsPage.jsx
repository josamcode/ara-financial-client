import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { LANGUAGES } from '@/shared/constants/app'
import { cn } from '@/shared/utils/cn'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('settings.title')} />

      <div className="max-w-2xl space-y-5">
        <Card padding="lg">
          <h2 className="text-base font-semibold text-text-primary mb-4">
            {t('settings.language')}
          </h2>
          <div className="flex gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={cn(
                  'flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-colors',
                  i18n.language === lang.code
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-border text-text-secondary hover:border-gray-300 hover:text-text-primary'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
