import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Badge } from '@/shared/components/Badge'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { CURRENCIES } from '@/shared/constants/app'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { useAuth } from '@/entities/auth/model/useAuth'
import { useCreateMyFatoorahPayment } from '@/features/payments/hooks/usePayments'

const INITIAL_FORM = {
  amount: '',
  currency: 'EGP',
  customerName: '',
  customerEmail: '',
  customerMobile: '',
  description: '',
}

function getStatusVariant(status) {
  const normalizedStatus = String(status ?? '').toLowerCase()

  if (['paid', 'success', 'succeeded', 'captured'].includes(normalizedStatus)) {
    return 'success'
  }

  if (['failed', 'error', 'cancelled', 'canceled'].includes(normalizedStatus)) {
    return 'error'
  }

  if (['pending', 'initiated', 'processing'].includes(normalizedStatus)) {
    return 'warning'
  }

  return 'default'
}

function DetailRow({ label, value, children }) {
  if (!value && !children) return null

  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-text-secondary">{label}</dt>
      <dd className="min-w-0 text-sm text-text-primary sm:col-span-2">
        {children ?? value}
      </dd>
    </div>
  )
}

export default function PaymentsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const createPayment = useCreateMyFatoorahPayment()
  const [form, setForm] = useState(INITIAL_FORM)
  const [lastResult, setLastResult] = useState(null)
  const canCreate = hasPermission(user, PERMISSIONS.PAYMENT_CREATE)

  const currencyOptions = useMemo(
    () => CURRENCIES.map((currency) => ({
      value: currency.code,
      label: currency.code,
    })),
    []
  )

  const paymentAttempt = lastResult?.paymentAttempt
  const paymentUrl = lastResult?.paymentUrl || paymentAttempt?.paymentUrl

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canCreate) return

    const payload = {
      amount: Number(form.amount),
      currency: form.currency,
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerMobile: form.customerMobile.trim(),
    }

    const description = form.description.trim()
    if (description) {
      payload.description = description
    }

    const result = await createPayment.mutateAsync(payload)
    setLastResult(result)
  }

  function openPaymentPage() {
    if (!paymentUrl) return
    window.open(paymentUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={t('payments.title')}
        subtitle={t('payments.subtitle')}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard size={18} />
              {t('payments.createPayment')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Input
                  label={t('payments.amount')}
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(event) => updateField('amount', event.target.value)}
                  disabled={!canCreate || createPayment.isPending}
                  required
                />
                <Select
                  label={t('payments.currency')}
                  value={form.currency}
                  onChange={(value) => updateField('currency', value)}
                  options={currencyOptions}
                  disabled={!canCreate || createPayment.isPending}
                  required
                />
              </div>

              <Input
                label={t('payments.customerName')}
                value={form.customerName}
                onChange={(event) => updateField('customerName', event.target.value)}
                disabled={!canCreate || createPayment.isPending}
                required
              />
              <Input
                label={t('payments.customerEmail')}
                type="email"
                value={form.customerEmail}
                onChange={(event) => updateField('customerEmail', event.target.value)}
                disabled={!canCreate || createPayment.isPending}
                required
              />
              <Input
                label={t('payments.customerMobile')}
                type="tel"
                value={form.customerMobile}
                onChange={(event) => updateField('customerMobile', event.target.value)}
                disabled={!canCreate || createPayment.isPending}
                required
              />
              <Input
                label={t('payments.description')}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                disabled={!canCreate || createPayment.isPending}
              />

              <div className="flex justify-end pt-2">
                <PermissionGate
                  permission={PERMISSIONS.PAYMENT_CREATE}
                  fallback={
                    <Button type="button" disabled>
                      {t('payments.createPayment')}
                    </Button>
                  }
                >
                  <Button type="submit" isLoading={createPayment.isPending}>
                    {t('payments.createPayment')}
                  </Button>
                </PermissionGate>
              </div>
            </form>
          </CardContent>
        </Card>

        {paymentAttempt && (
          <Card>
            <CardHeader>
              <CardTitle>{t('payments.paymentCreated')}</CardTitle>
              {paymentAttempt.status && (
                <Badge variant={getStatusVariant(paymentAttempt.status)}>
                  {paymentAttempt.status}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <dl>
                <DetailRow label="_id" value={paymentAttempt._id} />
                <DetailRow label={t('payments.status')}>
                  <Badge variant={getStatusVariant(paymentAttempt.status)}>
                    {paymentAttempt.status || '-'}
                  </Badge>
                </DetailRow>
                <DetailRow label={t('payments.amount')} value={paymentAttempt.amount} />
                <DetailRow label={t('payments.currency')} value={paymentAttempt.currency} />
                <DetailRow label={t('payments.customerName')} value={paymentAttempt.customerName} />
                <DetailRow label={t('payments.customerEmail')} value={paymentAttempt.customerEmail} />
                <DetailRow label={t('payments.customerMobile')} value={paymentAttempt.customerMobile} />
                <DetailRow label={t('payments.providerInvoiceId')} value={paymentAttempt.providerInvoiceId} />
                <DetailRow label={t('payments.providerPaymentId')} value={paymentAttempt.providerPaymentId} />
                <DetailRow label="providerStatus" value={paymentAttempt.providerStatus} />
                <DetailRow label={t('common.createdAt')} value={paymentAttempt.createdAt} />
                <DetailRow label={t('common.updatedAt')} value={paymentAttempt.updatedAt} />
                <DetailRow label={t('payments.paymentUrl')}>
                  <span className="block truncate">{paymentUrl}</span>
                </DetailRow>
              </dl>

              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  onClick={openPaymentPage}
                  disabled={!paymentUrl}
                >
                  <ExternalLink size={16} />
                  {t('payments.openPaymentPage')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
