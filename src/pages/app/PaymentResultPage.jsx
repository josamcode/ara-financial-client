import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Card, CardContent } from '@/shared/components/Card'
import { Badge } from '@/shared/components/Badge'
import { ROUTES } from '@/shared/constants/routes'
import { useResolvePaymentByPaymentId } from '@/features/payments/hooks/usePayments'

function formatDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString()
}

function openUrl(url) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const STATE_CONFIG = {
  verifying: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    titleKey: 'billing.verifyingPayment',
    descKey: 'billing.verifyingPaymentDesc',
    Icon: null,
  },
  paid: {
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    titleKey: 'billing.paymentSuccess',
    descKey: 'billing.paymentSuccessDesc',
    Icon: CheckCircle,
  },
  pending: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    titleKey: 'billing.paymentPending',
    descKey: 'billing.paymentPendingDesc',
    Icon: Clock,
  },
  failed: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    titleKey: 'billing.paymentFailed',
    descKey: 'billing.paymentFailedDesc',
    Icon: XCircle,
  },
  cancelled: {
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-400',
    titleKey: 'billing.paymentCancelled',
    descKey: 'billing.paymentCancelledDesc',
    Icon: XCircle,
  },
  expired: {
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-400',
    titleKey: 'billing.paymentFailed',
    descKey: 'billing.paymentFailedDesc',
    Icon: XCircle,
  },
  invalid: {
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-400',
    titleKey: 'billing.invalidPaymentRequest',
    descKey: 'billing.invalidPaymentRequestDesc',
    Icon: AlertCircle,
  },
  error: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    titleKey: 'billing.paymentFailed',
    descKey: 'billing.paymentFailedDesc',
    Icon: XCircle,
  },
}

function getStatusVariant(status) {
  const s = String(status ?? '').toLowerCase()
  if (['paid', 'success'].includes(s)) return 'success'
  if (['failed', 'cancelled', 'expired', 'error'].includes(s)) return 'error'
  if (['pending', 'processing'].includes(s)) return 'warning'
  return 'default'
}

export default function PaymentResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const paymentId =
    searchParams.get('paymentId') ||
    searchParams.get('PaymentId') ||
    searchParams.get('Id') ||
    searchParams.get('id')

  const { data, isLoading, isError, refetch } = useResolvePaymentByPaymentId(paymentId)

  const uiStatus = (() => {
    if (!paymentId) return 'invalid'
    if (isLoading) return 'verifying'
    if (isError) return 'error'
    return data?.status ?? 'failed'
  })()

  const config = STATE_CONFIG[uiStatus] ?? STATE_CONFIG.failed
  const { Icon } = config
  const attempt = data?.paymentAttempt ?? null
  const paymentUrl = attempt?.paymentUrl ?? null
  const canRetry = ['failed', 'cancelled', 'expired'].includes(uiStatus) && paymentUrl
  const canOpen = uiStatus === 'pending' && paymentUrl

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="px-8 py-10">
            {/* Status icon */}
            <div className="flex justify-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${config.iconBg}`}
              >
                {uiStatus === 'verifying' ? (
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                ) : (
                  Icon && <Icon size={32} className={config.iconColor} />
                )}
              </div>
            </div>

            {/* Title + description */}
            <div className="mt-5 text-center">
              <h1 className="text-lg font-semibold text-text-primary">
                {t(config.titleKey)}
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary">
                {t(config.descKey)}
              </p>
            </div>

            {/* Payment details */}
            {attempt && uiStatus !== 'verifying' && (
              <div className="mt-6 rounded-lg border border-border p-4 space-y-3">
                {attempt.amount != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{t('common.amount')}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {attempt.amount} {attempt.currency ?? ''}
                    </span>
                  </div>
                )}
                {attempt.status && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{t('billing.status')}</span>
                    <Badge variant={getStatusVariant(attempt.status)}>
                      {attempt.status}
                    </Badge>
                  </div>
                )}
                {attempt.providerInvoiceId && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-text-secondary shrink-0">
                      {t('payments.providerInvoiceId')}
                    </span>
                    <span className="text-sm text-text-muted truncate max-w-[180px] text-end">
                      {attempt.providerInvoiceId}
                    </span>
                  </div>
                )}
                {attempt.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{t('common.createdAt')}</span>
                    <span className="text-sm text-text-muted">
                      {formatDate(attempt.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-3">
              {canRetry && (
                <Button type="button" className="w-full" onClick={() => openUrl(paymentUrl)}>
                  <ExternalLink size={16} />
                  {t('billing.retryPayment')}
                </Button>
              )}
              {canOpen && (
                <Button type="button" className="w-full" onClick={() => openUrl(paymentUrl)}>
                  <ExternalLink size={16} />
                  {t('billing.openPaymentPage')}
                </Button>
              )}
              {uiStatus === 'error' && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => refetch()}
                >
                  <RefreshCw size={16} />
                  {t('common.tryAgain')}
                </Button>
              )}
              <Button
                type="button"
                variant={canRetry || canOpen || uiStatus === 'error' ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => navigate(ROUTES.BILLING)}
              >
                <ArrowLeft size={16} />
                {t('billing.returnToBilling')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
