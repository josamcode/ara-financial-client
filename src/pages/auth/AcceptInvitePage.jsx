import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuth } from '@/entities/auth/model/useAuth'
import { authApi } from '@/entities/auth/api/authApi'
import { ROUTES } from '@/shared/constants/routes'
import { Input, PasswordInput } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { ErrorState } from '@/shared/components/ErrorState'

const schema = z
  .object({
    name: z.string().min(2, 'errors.minLength'),
    password: z.string().min(8, 'errors.passwordMin'),
    confirmPassword: z.string().min(1, 'errors.required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export default function AcceptInvitePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [params] = useSearchParams()
  const token = params.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <ErrorState
        title={t('errors.invalidToken')}
        message="رابط الدعوة غير صالح أو منتهي الصلاحية."
      />
    )
  }

  async function onSubmit(values) {
    try {
      const response = await authApi.acceptInvite({
        token,
        name: values.name,
        password: values.password,
      })
      const { accessToken, refreshToken, user } = response.data
      const { storage } = await import('@/shared/utils/storage')
      storage.setTokens(accessToken, refreshToken)
      updateUser(user)
      toast.success(t('auth.inviteActivated'))
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(err?.message || t('errors.invalidToken'))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('auth.acceptInviteTitle')}</h1>
        <p className="text-sm text-text-secondary mt-1">{t('auth.acceptInviteSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label={t('auth.fullName')}
          autoComplete="name"
          required
          error={errors.name && t(errors.name.message, { min: 2 })}
          {...register('name')}
        />

        <PasswordInput
          label={t('auth.password')}
          autoComplete="new-password"
          required
          error={errors.password && t(errors.password.message)}
          {...register('password')}
        />

        <PasswordInput
          label={t('auth.confirmPassword')}
          autoComplete="new-password"
          required
          error={errors.confirmPassword && t(errors.confirmPassword.message)}
          {...register('confirmPassword')}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          {t('auth.acceptInviteTitle')}
        </Button>
      </form>
    </div>
  )
}
