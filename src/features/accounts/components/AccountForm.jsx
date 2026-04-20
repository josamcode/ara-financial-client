import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Input, FormField } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { useCreateAccount, useUpdateAccount } from '@/features/accounts/hooks/useAccounts'
import { ACCOUNT_TYPES } from '@/shared/constants/app'

const schema = z.object({
  code: z.string().min(1, 'errors.required'),
  name: z.string().min(1, 'errors.required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense'], {
    required_error: 'errors.required',
  }),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export function AccountForm({ account, defaultParentId, flatAccounts, onSuccess, onCancel }) {
  const { t } = useTranslation()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const isEditing = !!account

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      type: 'asset',
      parentId: defaultParentId || null,
      isActive: true,
    },
  })

  useEffect(() => {
    if (account) {
      reset({
        code: account.code || '',
        name: account.name || account.nameAr || account.nameEn || '',
        type: account.type || 'asset',
        parentId: account.parentId || null,
        isActive: account.isActive !== false,
      })
    } else {
      reset({
        code: '',
        name: '',
        type: 'asset',
        parentId: defaultParentId || null,
        isActive: true,
      })
    }
  }, [account, defaultParentId, reset])

  async function onSubmit(values) {
    if (isEditing) {
      await updateAccount.mutateAsync({
        id: account._id,
        data: {
          nameAr: values.name,
          nameEn: values.name,
          parentId: values.parentId || undefined,
          isActive: values.isActive,
        },
      })
    } else {
      await createAccount.mutateAsync({
        code: values.code,
        nameAr: values.name,
        nameEn: values.name,
        type: values.type,
        parentId: values.parentId || undefined,
      })
    }
    onSuccess?.()
  }

  const availableParents = flatAccounts?.filter(
    (a) => !account || (a._id !== account._id)
  ) || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label={t('accounts.accountCode')}
        placeholder="1000"
        required
        error={errors.code && t(errors.code.message)}
        {...register('code')}
      />

      <Input
        label={t('accounts.accountName')}
        required
        error={errors.name && t(errors.name.message)}
        {...register('name')}
      />

      <FormField label={t('accounts.accountType')} error={errors.type && t(errors.type.message)}>
        <select
          className="h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
          {...register('type')}
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`accounts.${type}`)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t('accounts.parentAccountOptional')}>
        <select
          className="h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
          {...register('parentId')}
        >
          <option value="">{t('accounts.noParent')}</option>
          {availableParents.map((a) => (
            <option key={a._id} value={a._id}>
              {a.code} — {a.name}
            </option>
          ))}
        </select>
      </FormField>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-primary rounded"
          {...register('isActive')}
        />
        <span className="text-sm font-medium text-text-primary">{t('accounts.isActive')}</span>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          {isEditing ? t('common.save') : t('accounts.createAccount')}
        </Button>
      </div>
    </form>
  )
}
