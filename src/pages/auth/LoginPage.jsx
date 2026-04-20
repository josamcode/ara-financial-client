import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuth } from '@/entities/auth/model/useAuth'
import { ROUTES } from '@/shared/constants/routes'
import { Input, PasswordInput } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'

const schema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.emailInvalid'),
  password: z.string().min(1, 'errors.required'),
})

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    try {
      const user = await login(values)
      const from = location.state?.from?.pathname
      const dest =
        user?.tenant && !user.tenant.isSetupComplete
          ? ROUTES.SETUP
          : from || ROUTES.DASHBOARD
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err?.message || t('auth.loginError'))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('auth.loginTitle')}</h1>
        <p className="text-sm text-text-secondary mt-1">{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          autoComplete="current-password"
          required
          error={errors.password && t(errors.password.message)}
          {...register('password')}
        />

        <div className="flex items-center justify-end">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-primary hover:underline"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
          {t('auth.login')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.dontHaveAccount')}{' '}
        <Link to={ROUTES.REGISTER} className="text-primary font-medium hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </div>
  )
}
