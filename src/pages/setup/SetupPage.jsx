import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/entities/auth/model/useAuth'
import { tenantApi } from '@/entities/tenant/api/tenantApi'
import { ROUTES } from '@/shared/constants/routes'
import { CURRENCIES } from '@/shared/constants/app'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

const schema = z.object({
  companyName: z.string().min(2, 'errors.minLength'),
  currency: z.string().min(1, 'errors.required'),
  useTemplate: z.boolean().optional(),
})

export default function SetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'EGP', useTemplate: true },
  })

  async function onSubmit(values) {
    try {
      await tenantApi.updateSettings({
        name: values.companyName,
        currency: values.currency,
      })
      await tenantApi.completeSetup()
      await refreshUser()
      toast.success(t('setup.setupComplete'))
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">{t('setup.title')}</h1>
        <p className="text-sm text-text-secondary mt-2">{t('setup.subtitle')}</p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            label={t('setup.companyName')}
            required
            error={errors.companyName && t(errors.companyName.message, { min: 2 })}
            {...register('companyName')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              {t('setup.currency')} <span className="text-error ms-1">*</span>
            </label>
            <select
              className="h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus"
              {...register('currency')}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-md bg-primary-50 border border-primary-100">
            <input
              type="checkbox"
              id="useTemplate"
              className="mt-0.5 w-4 h-4 accent-primary rounded"
              {...register('useTemplate')}
            />
            <label htmlFor="useTemplate" className="flex flex-col cursor-pointer">
              <span className="text-sm font-medium text-text-primary">
                {t('setup.useTemplate')}
              </span>
              <span className="text-xs text-text-secondary mt-0.5">
                {t('setup.useTemplateDescription')}
              </span>
            </label>
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
            {t('setup.completeSetup')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
