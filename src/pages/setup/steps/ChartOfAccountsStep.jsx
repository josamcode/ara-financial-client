import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { accountApi } from '@/entities/account/api/accountApi'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

export default function ChartOfAccountsStep({ onNext, onBack, initialValues }) {
  const { t } = useTranslation()
  const [applying, setApplying] = useState(false)
  const applied = !!initialValues?.applied

  async function handleApply() {
    setApplying(true)
    try {
      const result = await accountApi.applyTemplate()
      const count = result?.data?.count ?? result?.count ?? null
      toast.success(t('accounts.templateApplied'))
      onNext({
        applied: true,
        alreadyExisted: false,
        skipped: false,
        count,
      })
    } catch (err) {
      if (err?.message?.includes('only be applied once')) {
        onNext({
          applied: true,
          alreadyExisted: true,
          skipped: false,
          count: initialValues?.count ?? null,
        })
      } else {
        toast.error(err?.message || t('common.somethingWentWrong'))
      }
    } finally {
      setApplying(false)
    }
  }

  function handleSkip() {
    onNext({
      applied: false,
      alreadyExisted: false,
      skipped: true,
      count: null,
    })
  }

  function handleContinue() {
    onNext({
      ...initialValues,
      applied: true,
      skipped: false,
    })
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        {t('setup.stepChartOfAccounts')}
      </h2>
      <p className="text-sm text-text-secondary mb-6">{t('setup.chartOfAccountsDescription')}</p>
      <p className="text-xs text-text-muted mb-6">{t('setup.onlyAvailableTemplate')}</p>

      <div className="border border-border rounded-lg p-4 mb-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{t('setup.egyptianTemplate')}</p>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('setup.egyptianTemplateDescription')}
          </p>
        </div>
        {applied && (
          <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          {t('common.back')}
        </button>
        <div className="flex items-center gap-3">
          {applied ? (
            <Button onClick={handleContinue}>{t('common.next')}</Button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                {t('setup.skip')}
              </button>
              <Button onClick={handleApply} isLoading={applying}>
                {t('setup.applyTemplate')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
