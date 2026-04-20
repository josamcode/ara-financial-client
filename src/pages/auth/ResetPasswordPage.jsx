import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { authApi } from '@/entities/auth/api/authApi'
import { ROUTES } from '@/shared/constants/routes'
import { PasswordInput } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { ErrorState } from '@/shared/components/ErrorState'

const schema = z
  .object({
    password: z.string().min(8, 'errors.passwordMin'),
    confirmPassword: z.string().min(1, 'errors.required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
        onRetry={() => navigate(ROUTES.FORGOT_PASSWORD)}
      />
    )
  }

  async function onSubmit(values) {
    try {
      await authApi.resetPassword({ token, password: values.password })
      toast.success(t('auth.passwordResetSuccess'))
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      toast.error(err?.message || t('errors.invalidToken'))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('auth.resetPasswordTitle')}</h1>
        <p className="text-sm text-text-secondary mt-1">{t('auth.resetPasswordSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <PasswordInput
          label={t('auth.newPassword')}
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
          {t('auth.resetPassword')}
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link to={ROUTES.LOGIN} className="text-sm text-primary font-medium hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  )
}
