import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fiscalPeriodApi } from '@/entities/fiscalPeriod/api/fiscalPeriodApi'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { Card } from '@/shared/components/Card'

const MONTHS = [
  { value: 1, ar: 'يناير', en: 'January' },
  { value: 2, ar: 'فبراير', en: 'February' },
  { value: 3, ar: 'مارس', en: 'March' },
  { value: 4, ar: 'أبريل', en: 'April' },
  { value: 5, ar: 'مايو', en: 'May' },
  { value: 6, ar: 'يونيو', en: 'June' },
  { value: 7, ar: 'يوليو', en: 'July' },
  { value: 8, ar: 'أغسطس', en: 'August' },
  { value: 9, ar: 'سبتمبر', en: 'September' },
  { value: 10, ar: 'أكتوبر', en: 'October' },
  { value: 11, ar: 'نوفمبر', en: 'November' },
  { value: 12, ar: 'ديسمبر', en: 'December' },
]

const schema = z.object({
  year: z.coerce
    .number()
    .int('Year must be an integer')
    .min(1900, 'Year must be at least 1900')
    .max(9999, 'Year must be at most 9999'),
  startMonth: z.coerce.number().int().min(1).max(12),
})

function formatMonthLabel(month, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
  }).format(new Date(Date.UTC(2024, month - 1, 1)))
}

export default function FiscalYearStep({
  onNext,
  onBack,
  defaultStartMonth = 1,
  initialValues,
}) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const created = !!initialValues?.created

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      year: initialValues?.year || new Date().getFullYear(),
      startMonth: initialValues?.startMonth || defaultStartMonth,
    },
  })
  const submitFiscalYear = handleSubmit(onSubmit)

  async function onSubmit(values) {
    try {
      await fiscalPeriodApi.create({
        year: Number(values.year),
        startMonth: Number(values.startMonth),
      })
      onNext({
        year: Number(values.year),
        startMonth: Number(values.startMonth),
        created: true,
        skipped: false,
      })
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    }
  }

  function handleSkip() {
    const values = getValues()
    onNext({
      year: Number(values.year),
      startMonth: Number(values.startMonth),
      created: false,
      skipped: true,
    })
  }

  function handleContinue() {
    onNext({
      ...initialValues,
      created: true,
      skipped: false,
    })
  }

  if (created) {
    return (
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-text-primary mb-1">
          {t('setup.stepFiscalYear')}
        </h2>
        <p className="text-sm text-text-secondary mb-6">{t('setup.fiscalYearDescription')}</p>

        <div className="rounded-lg border border-success/20 bg-success/5 p-4 flex items-start gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{initialValues?.year}</p>
            <p className="text-xs text-text-secondary mt-1">
              {formatMonthLabel(initialValues?.startMonth || defaultStartMonth, i18n.language)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="text-sm text-text-muted hover:text-primary transition-colors"
          >
            {t('common.back')}
          </button>
          <Button type="button" onClick={handleContinue}>
            {t('common.next')}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        {t('setup.stepFiscalYear')}
      </h2>
      <p className="text-sm text-text-secondary mb-6">{t('setup.fiscalYearDescription')}</p>

      <form onSubmit={submitFiscalYear} noValidate className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            {t('setup.fiscalYear')}
            <span className="text-error ms-1">*</span>
          </label>
          <input
            type="number"
            min={1900}
            max={9999}
            className="h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
            {...register('year')}
          />
          {errors.year && <p className="text-xs text-error">{errors.year.message}</p>}
        </div>

        <Controller
          name="startMonth"
          control={control}
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onChange={(val) => field.onChange(Number(val))}
              options={MONTHS.map((m) => ({
                value: String(m.value),
                label: isAr ? m.ar : m.en,
              }))}
              label={t('setup.fiscalYearStartMonth')}
            />
          )}
        />

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-text-muted hover:text-primary transition-colors"
          >
            {t('common.back')}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              {t('setup.skip')}
            </button>
            <Button type="button" onClick={submitFiscalYear} isLoading={isSubmitting}>
              {t('common.next')}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
