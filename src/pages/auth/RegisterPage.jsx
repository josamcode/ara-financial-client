import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuth } from '@/entities/auth/model/useAuth'
import { ROUTES } from '@/shared/constants/routes'
import { Input, PasswordInput } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'

const schema = z
  .object({
    name: z.string().min(2, { message: 'errors.minLength' }),
    companyName: z.string().min(2, { message: 'errors.minLength' }),
    email: z.string().min(1, 'errors.required').email('errors.emailInvalid'),
    password: z.string().min(8, 'errors.passwordMin'),
    confirmPassword: z.string().min(1, 'errors.required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    try {
      const { confirmPassword, ...payload } = values
      await registerUser(payload)
      toast.success(t('auth.registerSuccess'))
      navigate(ROUTES.SETUP, { replace: true })
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('auth.registerTitle')}</h1>
        <p className="text-sm text-text-secondary mt-1">{t('auth.registerSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label={t('auth.fullName')}
          autoComplete="name"
          required
          error={errors.name && t(errors.name.message, { min: 2 })}
          {...register('name')}
        />

        <Input
          label={t('auth.companyName')}
          required
          error={errors.companyName && t(errors.companyName.message, { min: 2 })}
          {...register('companyName')}
        />

        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          required
          error={errors.email && t(errors.email.message)}
          {...register('email')}
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

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
          {t('auth.register')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to={ROUTES.LOGIN} className="text-primary font-medium hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
