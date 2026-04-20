import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'
import { authApi } from '@/entities/auth/api/authApi'
import { ROUTES } from '@/shared/constants/routes'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'

const schema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.emailInvalid'),
})

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    try {
      await authApi.forgotPassword(values.email)
    } catch {
      // Always show success to avoid email enumeration
    } finally {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-14 h-14 rounded-xl bg-success-soft flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={24} className="text-success" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          {t('auth.checkYourEmail')}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {t('auth.resetLinkSent')}
        </p>
        <Link to={ROUTES.LOGIN} className="text-sm text-primary font-medium hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">{t('auth.forgotPasswordTitle')}</h1>
        <p className="text-sm text-text-secondary mt-1">{t('auth.forgotPasswordSubtitle')}</p>
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

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          {t('auth.sendResetLink')}
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
