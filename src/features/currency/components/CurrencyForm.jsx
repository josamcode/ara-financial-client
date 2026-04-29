import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'

const currencySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'currencies.codeInvalid')
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, 'errors.required').max(100, 'errors.maxLength'),
  symbol: z.string().trim().min(1, 'errors.required').max(20, 'errors.maxLength'),
  decimalPlaces: z.coerce
    .number()
    .int('currencies.decimalPlacesInvalid')
    .min(0, 'currencies.decimalPlacesRange')
    .max(6, 'currencies.decimalPlacesRange'),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int('currencies.sortOrderInvalid'),
})

function toFormValues(defaultValues) {
  return {
    code: defaultValues?.code ?? '',
    name: defaultValues?.name ?? '',
    symbol: defaultValues?.symbol ?? '',
    decimalPlaces: defaultValues?.decimalPlaces ?? 2,
    isActive: defaultValues?.isActive ?? true,
    sortOrder: defaultValues?.sortOrder ?? 0,
  }
}

function toPayload(values, isEditing) {
  const payload = {
    name: values.name.trim(),
    symbol: values.symbol.trim(),
    decimalPlaces: Number(values.decimalPlaces),
    isActive: values.isActive,
    sortOrder: Number(values.sortOrder),
  }

  if (!isEditing) {
    payload.code = values.code.trim().toUpperCase()
  }

  return payload
}

export function CurrencyForm({ defaultValues, onSubmit, isSubmitting, onCancel }) {
  const { t } = useTranslation()
  const isEditing = Boolean(defaultValues)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currencySchema),
    defaultValues: toFormValues(defaultValues),
  })

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          ...toPayload(values, isEditing),
          ...(defaultValues?.isDefault ? { isActive: true } : {}),
        })
      )}
      className="space-y-5"
      noValidate
    >
      <div className="bg-surface rounded-lg border border-border p-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t('currencies.formSection')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('currencies.code')}
            required
            readOnly={isEditing}
            error={errors.code && t(errors.code.message)}
            {...register('code')}
          />

          <Input
            label={t('currencies.name')}
            required
            error={errors.name && t(errors.name.message, { max: 100 })}
            {...register('name')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('currencies.symbol')}
            required
            error={errors.symbol && t(errors.symbol.message, { max: 20 })}
            {...register('symbol')}
          />

          <Input
            label={t('currencies.decimalPlaces')}
            type="number"
            min="0"
            max="6"
            step="1"
            required
            error={errors.decimalPlaces && t(errors.decimalPlaces.message)}
            {...register('decimalPlaces')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('currencies.sortOrder')}
            type="number"
            step="1"
            error={errors.sortOrder && t(errors.sortOrder.message)}
            {...register('sortOrder')}
          />

          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Select
                label={t('common.status')}
                value={field.value ? 'true' : 'false'}
                onChange={(value) => field.onChange(value === 'true')}
                disabled={defaultValues?.isDefault}
                options={[
                  { value: 'true', label: t('common.active') },
                  { value: 'false', label: t('common.inactive') },
                ]}
              />
            )}
          />
        </div>

        {defaultValues?.isDefault && (
          <p className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-sm text-text-secondary">
            {t('currencies.defaultReadOnlyHint', { code: defaultValues.code })}
          </p>
        )}
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
