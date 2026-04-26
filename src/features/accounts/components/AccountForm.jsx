import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { Toggle } from '@/shared/components/Toggle'
import { useCreateAccount, useUpdateAccount } from '@/features/accounts/hooks/useAccounts'
import { ACCOUNT_TYPES } from '@/shared/constants/app'
import { getAccountDisplayName } from '@/entities/account/lib/accountName'

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
  const { t, i18n } = useTranslation()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const isEditing = !!account

  const {
    register,
    handleSubmit,
    reset,
    control,
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
        name: getAccountDisplayName(account, i18n.language),
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
  }, [account, defaultParentId, i18n.language, reset])

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

  const availableParents =
    flatAccounts?.filter((a) => !account || a._id !== account._id) || []

  const typeOptions = ACCOUNT_TYPES.map((type) => ({
    value: type,
    label: t(`accounts.${type}`),
  }))

  const parentOptions = [
    { value: '', label: t('accounts.noParent') },
    ...availableParents.map((a) => ({
      value: a._id,
      label: `${a.code} - ${getAccountDisplayName(a, i18n.language)}`,
    })),
  ]

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

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={field.onChange}
            options={typeOptions}
            label={t('accounts.accountType')}
            error={errors.type && t(errors.type.message)}
          />
        )}
      />

      <Controller
        name="parentId"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ''}
            onChange={(val) => field.onChange(val || null)}
            options={parentOptions}
            label={t('accounts.parentAccountOptional')}
          />
        )}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <Toggle
            checked={field.value}
            onChange={field.onChange}
            label={t('accounts.isActive')}
          />
        )}
      />

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
