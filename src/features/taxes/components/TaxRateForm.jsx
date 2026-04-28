import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'

const ratePattern = /^\d+(\.\d{1,6})?$/

const taxRateSchema = z.object({
  name: z.string().trim().min(1, 'errors.required').max(200, 'errors.maxLength'),
  code: z.string().trim().max(50, 'errors.maxLength').optional(),
  rate: z
    .string()
    .trim()
    .min(1, 'errors.required')
    .refine((value) => Number.isFinite(Number(value)), 'taxRates.rateInvalid')
    .refine((value) => Number(value) >= 0 && Number(value) <= 100, 'taxRates.rateRange')
    .refine((value) => ratePattern.test(value), 'taxRates.ratePrecision'),
  type: z.enum(['sales', 'purchase', 'both']),
  isActive: z.boolean(),
  description: z.string().trim().max(1000, 'errors.maxLength').optional(),
})

function toFormValues(defaultValues) {
  return {
    name: defaultValues?.name ?? '',
    code: defaultValues?.code ?? '',
    rate: defaultValues?.rate != null ? String(defaultValues.rate) : '',
    type: defaultValues?.type ?? 'both',
    isActive: defaultValues?.isActive ?? true,
    description: defaultValues?.description ?? '',
  }
}

function toPayload(values) {
  return {
    name: values.name.trim(),
    code: values.code?.trim() ? values.code.trim() : null,
    rate: values.rate.trim(),
    type: values.type,
    isActive: values.isActive,
    description: values.description?.trim() ?? '',
  }
}

export function TaxRateForm({ defaultValues, onSubmit, isSubmitting, onCancel }) {
  const { t } = useTranslation()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taxRateSchema),
    defaultValues: toFormValues(defaultValues),
  })

  const typeOptions = [
    { value: 'both', label: t('taxRates.types.both') },
    { value: 'sales', label: t('taxRates.types.sales') },
    { value: 'purchase', label: t('taxRates.types.purchase') },
  ]

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))} className="space-y-5" noValidate>
      <div className="bg-surface rounded-lg border border-border p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t('taxRates.formSection')}
        </p>

        <Input
          label={t('taxRates.name')}
          required
          error={errors.name && t(errors.name.message, { max: 200 })}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('taxRates.code')}
            error={errors.code && t(errors.code.message, { max: 50 })}
            {...register('code')}
          />
          <Input
            label={t('taxRates.rate')}
            type="number"
            min="0"
            max="100"
            step="0.000001"
            required
            error={errors.rate && t(errors.rate.message)}
            {...register('rate')}
          />
        </div>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label={t('taxRates.type')}
              value={field.value}
              onChange={field.onChange}
              options={typeOptions}
            />
          )}
        />

        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            {...register('isActive')}
          />
          <span>{t('taxRates.isActive')}</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {t('taxRates.description')}
          </label>
          <textarea
            rows={4}
            className="w-full resize-none rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-error">
              {t(errors.description.message, { max: 1000 })}
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
