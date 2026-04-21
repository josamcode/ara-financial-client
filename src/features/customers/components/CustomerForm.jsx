import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'

export function CustomerForm({ defaultValues, onSubmit, isSubmitting, onCancel }) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: defaultValues ?? { name: '', email: '', phone: '', address: '', notes: '' } })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('common.name')}
        required
        error={errors.name?.message}
        {...register('name', { required: t('errors.required') })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('common.email')}
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('common.phone')}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>
      <Input
        label={t('customers.address')}
        error={errors.address?.message}
        {...register('address')}
      />
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">{t('common.notes')}</label>
        <textarea
          rows={3}
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
          {...register('notes')}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
