import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { tenantApi } from '@/entities/tenant/api/tenantApi'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { CURRENCIES } from '@/shared/constants/app'

const SELECT_CLASS =
  'h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus'

const INDUSTRIES = [
  { value: 'general', ar: 'عام', en: 'General' },
  { value: 'retail', ar: 'تجزئة', en: 'Retail' },
  { value: 'manufacturing', ar: 'تصنيع', en: 'Manufacturing' },
  { value: 'services', ar: 'خدمات', en: 'Services' },
  { value: 'construction', ar: 'مقاولات', en: 'Construction' },
  { value: 'healthcare', ar: 'رعاية صحية', en: 'Healthcare' },
  { value: 'education', ar: 'تعليم', en: 'Education' },
  { value: 'hospitality', ar: 'ضيافة', en: 'Hospitality' },
]

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
  name: z.string().min(2, 'errors.minLength'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.string().min(1),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
})

export default function CompanyInfoStep({
  onNext,
  initialValues,
  currencyCode = 'EGP',
}) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const currency = CURRENCIES.find((item) => item.code === currencyCode)
  const currencyLabel = isAr
    ? currency?.label || currencyCode
    : currency?.labelEn || currency?.label || currencyCode

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name || '',
      legalName: initialValues?.legalName || '',
      taxId: initialValues?.taxId || '',
      industry: initialValues?.industry || 'general',
      fiscalYearStartMonth: initialValues?.fiscalYearStartMonth || 1,
    },
  })

  async function onSubmit(values) {
    const payload = {
      name: values.name.trim(),
      legalName: values.legalName?.trim() || undefined,
      taxId: values.taxId?.trim() || undefined,
      industry: values.industry,
      fiscalYearStartMonth: Number(values.fiscalYearStartMonth),
    }

    try {
      await tenantApi.updateSettings(payload)
      onNext(payload)
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    }
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-text-primary mb-5">
        {t('setup.stepCompanyInfo')}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label={t('setup.companyName')}
          required
          error={errors.name && t(errors.name.message, { min: 2 })}
          {...register('name')}
        />

        <Input
          label={t('setup.legalName')}
          hint={t('common.optional')}
          {...register('legalName')}
        />

        <Input
          label={t('setup.taxId')}
          hint={t('common.optional')}
          {...register('taxId')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            {t('setup.industry')}
          </label>
          <select className={SELECT_CLASS} {...register('industry')}>
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {isAr ? ind.ar : ind.en}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            {t('setup.fiscalYearStartMonth')}
          </label>
          <select className={SELECT_CLASS} {...register('fiscalYearStartMonth')}>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {isAr ? m.ar : m.en}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border border-dashed border-border bg-surface-subtle p-4">
          <p className="text-sm font-medium text-text-primary">{t('setup.currency')}</p>
          <p className="text-sm text-text-primary mt-1">
            {currencyCode} - {currencyLabel}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {t('setup.currencyDisplayOnlyHint')}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            {t('common.next')}
          </Button>
        </div>
      </form>
    </Card>
  )
}
