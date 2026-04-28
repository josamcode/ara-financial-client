import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { useCurrencies } from '@/features/currency/hooks/useCurrencies'

const ratePattern = /^\d+(\.\d{1,12})?$/

const exchangeRateSchema = z.object({
  fromCurrency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'exchangeRates.currencyInvalid')
    .transform((value) => value.toUpperCase()),
  toCurrency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'exchangeRates.currencyInvalid')
    .transform((value) => value.toUpperCase()),
  rate: z
    .string()
    .trim()
    .min(1, 'errors.required')
    .refine((value) => Number.isFinite(Number(value)), 'exchangeRates.rateInvalid')
    .refine((value) => Number(value) > 0, 'exchangeRates.ratePositive')
    .refine((value) => ratePattern.test(value), 'exchangeRates.ratePrecision'),
  effectiveDate: z.string().trim().min(1, 'errors.required'),
  source: z.enum(['manual', 'api', 'central_bank', 'company_rate']),
  provider: z.string().trim().max(100, 'errors.maxLength').optional(),
  isActive: z.boolean(),
  notes: z.string().trim().max(1000, 'errors.maxLength').optional(),
})

function normalizeCurrencyList(response) {
  const payload = response ?? {}
  const data = payload.data ?? payload

  if (Array.isArray(data)) return data

  return data.currencies ?? data.items ?? data.data?.currencies ?? []
}

function toDateInput(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

function toFormValues(defaultValues) {
  return {
    fromCurrency: defaultValues?.fromCurrency ?? '',
    toCurrency: defaultValues?.toCurrency ?? 'SAR',
    rate: defaultValues?.rate != null ? String(defaultValues.rate) : '',
    effectiveDate: toDateInput(defaultValues?.effectiveDate),
    source: defaultValues?.source ?? 'manual',
    provider: defaultValues?.provider ?? '',
    isActive: defaultValues?.isActive ?? true,
    notes: defaultValues?.notes ?? '',
  }
}

function toPayload(values) {
  return {
    fromCurrency: values.fromCurrency.trim().toUpperCase(),
    toCurrency: values.toCurrency.trim().toUpperCase(),
    rate: values.rate.trim(),
    effectiveDate: values.effectiveDate,
    source: values.source,
    provider: values.provider?.trim() ? values.provider.trim() : null,
    isActive: values.isActive,
    notes: values.notes?.trim() ?? '',
  }
}

export function ExchangeRateForm({ defaultValues, onSubmit, isSubmitting, onCancel }) {
  const { t } = useTranslation()
  const currenciesQuery = useCurrencies({ isActive: true })
  const currencies = normalizeCurrencyList(currenciesQuery.data)
  const hasSar = currencies.some((currency) => currency.code === 'SAR')
  const currencyOptions = [
    ...(hasSar ? [] : [{ value: 'SAR', label: 'SAR' }]),
    ...currencies.map((currency) => ({
      value: currency.code,
      label: `${currency.code} - ${currency.name}`,
    })),
  ]

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(exchangeRateSchema),
    defaultValues: toFormValues(defaultValues),
  })

  const sourceOptions = [
    { value: 'manual', label: t('exchangeRates.sources.manual') },
    { value: 'api', label: t('exchangeRates.sources.api') },
    { value: 'central_bank', label: t('exchangeRates.sources.central_bank') },
    { value: 'company_rate', label: t('exchangeRates.sources.company_rate') },
  ]

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))} className="space-y-5" noValidate>
      <div className="bg-surface rounded-lg border border-border p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t('exchangeRates.formSection')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="fromCurrency"
            control={control}
            render={({ field }) => (
              <Select
                label={t('exchangeRates.fromCurrency')}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: '', label: t('exchangeRates.selectCurrency') },
                  ...currencyOptions,
                ]}
                error={errors.fromCurrency && t(errors.fromCurrency.message)}
              />
            )}
          />

          <Controller
            name="toCurrency"
            control={control}
            render={({ field }) => (
              <Select
                label={t('exchangeRates.toCurrency')}
                value={field.value}
                onChange={field.onChange}
                options={currencyOptions}
                error={errors.toCurrency && t(errors.toCurrency.message)}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('exchangeRates.rate')}
            type="number"
            min="0"
            step="0.000000000001"
            required
            error={errors.rate && t(errors.rate.message)}
            {...register('rate')}
          />

          <Input
            label={t('exchangeRates.effectiveDate')}
            type="date"
            required
            error={errors.effectiveDate && t(errors.effectiveDate.message)}
            {...register('effectiveDate')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select
                label={t('exchangeRates.source')}
                value={field.value}
                onChange={field.onChange}
                options={sourceOptions}
              />
            )}
          />

          <Input
            label={t('exchangeRates.provider')}
            error={errors.provider && t(errors.provider.message, { max: 100 })}
            {...register('provider')}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            {...register('isActive')}
          />
          <span>{t('exchangeRates.isActive')}</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {t('exchangeRates.notes')}
          </label>
          <textarea
            rows={4}
            className="w-full resize-none rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            {...register('notes')}
          />
          {errors.notes && (
            <p className="mt-1 text-xs text-error">
              {t(errors.notes.message, { max: 1000 })}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
