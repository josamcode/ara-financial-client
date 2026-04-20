import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Plus, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '@/entities/user/api/userApi'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'

const SELECT_CLASS =
  'h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus'

const schema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.emailInvalid'),
  name: z.string().min(2, 'errors.minLength'),
  roleName: z.enum(['admin', 'accountant']),
})

export default function InviteTeamStep({ onNext, onBack, initialValues }) {
  const { t } = useTranslation()
  const [sent, setSent] = useState(initialValues?.invited || [])
  const [sending, setSending] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { roleName: 'accountant' },
  })

  async function onSendInvite(values) {
    setSending(true)
    try {
      const result = await userApi.invite(values)
      const invitation = result?.data?.invitation ?? result?.invitation
      const inviteRecord = {
        ...values,
        acceptUrl: invitation?.acceptUrl || '',
        expiresAt: invitation?.expiresAt || '',
      }

      setSent((prev) => [...prev, inviteRecord])
      toast.success(t('setup.inviteCreated', { email: values.email }))
      reset({ roleName: 'accountant' })
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    } finally {
      setSending(false)
    }
  }

  function handleContinue() {
    onNext({ invited: sent })
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        {t('setup.stepInviteTeam')}
      </h2>
      <p className="text-sm text-text-secondary mb-5">{t('setup.inviteTeamDescription')}</p>

      {sent.length > 0 && (
        <div className="mb-5 space-y-2">
          {sent.map((inv, i) => (
            <div
              key={i}
              className="px-3 py-2.5 rounded-md bg-surface-subtle border border-border text-sm"
            >
              <div className="flex items-start gap-3">
                <UserCheck size={14} className="text-success shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-text-primary">{inv.name}</span>
                    <span className="text-xs text-text-muted capitalize">{inv.roleName}</span>
                  </div>
                  <p className="text-text-muted mt-0.5">{inv.email}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {t('setup.inviteManualShareHint')}
                  </p>
                  {inv.acceptUrl ? (
                    <div className="mt-1">
                      <p className="text-xs font-medium text-text-primary">
                        {t('setup.invitationLink')}
                      </p>
                      <a
                        href={inv.acceptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary break-all hover:underline"
                      >
                        {inv.acceptUrl}
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">
                      {t('setup.invitationLinkUnavailable')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSendInvite)} noValidate className="space-y-3">
        <Input
          label={t('common.email')}
          type="email"
          error={errors.email && t(errors.email.message)}
          {...register('email')}
        />
        <Input
          label={t('common.name')}
          error={errors.name && t(errors.name.message, { min: 2 })}
          {...register('name')}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">{t('setup.role')}</label>
          <select className={SELECT_CLASS} {...register('roleName')}>
            <option value="admin">{t('setup.roleAdmin')}</option>
            <option value="accountant">{t('setup.roleAccountant')}</option>
          </select>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" isLoading={sending}>
            <Plus size={14} />
            {t('setup.sendInvite')}
          </Button>
        </div>
      </form>

      <div className="flex items-center justify-between border-t border-border mt-5 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          {t('common.back')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          {sent.length > 0 ? t('common.next') : t('setup.skip')}
        </button>
      </div>
    </Card>
  )
}
