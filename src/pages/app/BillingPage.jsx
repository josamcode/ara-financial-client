import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RefreshCw, ExternalLink, Check, AlertTriangle, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/Card'
import { Badge } from '@/shared/components/Badge'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/entities/auth/model/useAuth'
import {
  useBillingPlans,
  useCurrentSubscription,
  useBillingUsage,
  useCheckoutPlan,
  useSyncBillingPayment,
} from '@/features/billing/hooks/useBilling'
import {
  usePaymentAttempts,
  useVerifyPaymentAttempt,
} from '@/features/payments/hooks/usePayments'

// ─── Status helpers ───────────────────────────────────────────────────────────
function getStatusVariant(status) {
  const s = String(status ?? '').toLowerCase()
  if (['active', 'paid', 'success', 'succeeded', 'captured'].includes(s)) return 'success'
  if (['cancelled', 'canceled', 'failed', 'expired', 'error'].includes(s)) return 'error'
  if (['trialing', 'trial', 'pending', 'initiated', 'processing'].includes(s)) return 'warning'
  return 'default'
}

function getStatusLabel(status, t) {
  if (!status) return null
  const key = `billing.statusLabel.${String(status).toLowerCase()}`
  const translated = t(key, { defaultValue: '' })
  return translated || status
}

// ─── Plan display helpers (Arabic-first, backend fallback) ────────────────────
function getPlanDisplayName(plan, t) {
  const code = String(plan?.code ?? '').toLowerCase()
  if (code) {
    const translated = t(`billing.planNames.${code}`, { defaultValue: '' })
    if (translated) return translated
  }
  return plan?.name || code || '-'
}

function getPlanDescription(plan, t) {
  const code = String(plan?.code ?? '').toLowerCase()
  if (code) {
    const translated = t(`billing.planDescriptions.${code}`, { defaultValue: '' })
    if (translated) return translated
  }
  return plan?.description || ''
}

function getPlanFeatures(plan, t) {
  const code = String(plan?.code ?? '').toLowerCase()
  if (code) {
    const translated = t(`billing.planFeatures.${code}`, { returnObjects: true, defaultValue: null })
    if (Array.isArray(translated) && translated.length > 0) return translated
  }
  if (Array.isArray(plan?.features)) {
    return plan.features.map((f) => (typeof f === 'string' ? f : f.label ?? f.name ?? String(f)))
  }
  return []
}

function getPlanCycleLabel(cycle, t) {
  if (!cycle) return null
  const key = `billing.cycleLabel.${String(cycle).toLowerCase()}`
  const translated = t(key, { defaultValue: '' })
  return translated || cycle
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString()
}

function formatDateTime(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString()
}

function openUrl(url) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

// ─── Info block ───────────────────────────────────────────────────────────────
function InfoBlock({ label, value, children }) {
  if (!value && !children) return null
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm font-medium text-text-primary">{children ?? value}</p>
    </div>
  )
}

// ─── Current Subscription Card ────────────────────────────────────────────────
function CurrentSubscriptionCard({ subscription, isLoading, isError, refetch }) {
  const { t } = useTranslation()

  // Safely resolve the plan object — API returns planId populated
  const subscriptionPlan = subscription?.planId ?? subscription?.plan ?? null
  const displayName = getPlanDisplayName(subscriptionPlan, t)
  const billingCycle =
    subscription?.billingCycle ??
    subscription?.interval ??
    subscriptionPlan?.billingCycle ??
    null
  const cycleLabel = getPlanCycleLabel(billingCycle, t)
  const status = subscription?.status
  const statusLabel = getStatusLabel(status, t)
  const isFreePlan =
    !subscriptionPlan?.price || Number(subscriptionPlan?.price) === 0
  const isTrialing = String(status ?? '').toLowerCase() === 'trialing'
  const periodStart = formatDate(subscription?.currentPeriodStart)
  const periodEnd = formatDate(subscription?.currentPeriodEnd)
  const period = periodStart && periodEnd ? `${periodStart} — ${periodEnd}` : null
  const trialEnd = formatDate(subscription?.trialEndsAt)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('billing.currentSubscription')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={refetch} />}

        {!isLoading && !isError && !subscription && (
          <div className="rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm font-semibold text-text-primary">
              {t('billing.noActiveSubscription')}
            </p>
            <p className="mt-1.5 text-xs text-text-secondary">{t('billing.choosePlanHint')}</p>
          </div>
        )}

        {!isLoading && !isError && subscription && (
          <div>
            {/* Plan name + status badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-text-primary">{displayName}</p>
                {cycleLabel && (
                  <p className="mt-0.5 text-sm text-text-secondary">{cycleLabel}</p>
                )}
              </div>
              {status && (
                <Badge variant={getStatusVariant(status)}>{statusLabel ?? status}</Badge>
              )}
            </div>

            {/* Free plan / trial message */}
            {isTrialing && isFreePlan && (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {t('billing.freePlanMessage')}
              </p>
            )}

            {/* Info summary grid */}
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3">
              <InfoBlock label={t('billing.plan')} value={displayName} />
              {cycleLabel && (
                <InfoBlock label={t('billing.billingCycle')} value={cycleLabel} />
              )}
              {period && (
                <InfoBlock label={t('billing.currentPeriod')} value={period} />
              )}
              {trialEnd && (
                <InfoBlock label={t('billing.trialEnds')} value={trialEnd} />
              )}
              {subscription.cancelAtPeriodEnd && (
                <InfoBlock label={t('billing.cancelAtPeriodEnd')}>
                  <Badge variant="warning">{t('common.yes')}</Badge>
                </InfoBlock>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, currentPlanId, onCheckout, isLoading, canManage }) {
  const { t } = useTranslation()

  const resolvedCurrentId =
    typeof currentPlanId === 'object' ? currentPlanId?._id : currentPlanId
  const isCurrent = !!(plan._id && resolvedCurrentId && plan._id === resolvedCurrentId)
  const isEnterprise = String(plan.code ?? plan.name ?? '').toLowerCase().includes('enterprise')
  const isFree = !isEnterprise && (!plan.price || Number(plan.price) === 0)

  const displayName = getPlanDisplayName(plan, t)
  const description = getPlanDescription(plan, t)
  const features = getPlanFeatures(plan, t)
  const cycleLabel = getPlanCycleLabel(plan.billingCycle, t)

  return (
    <div
      className={[
        'flex flex-col rounded-xl border bg-card shadow-sm transition-all hover:shadow-md',
        isCurrent
          ? 'ring-2 ring-primary border-primary/30'
          : 'border-border hover:border-border/80',
      ].join(' ')}
    >
      {/* Top accent bar for current plan */}
      {isCurrent && (
        <div className="h-1 w-full rounded-t-xl bg-primary/70" />
      )}

      <div className="flex flex-1 flex-col p-6">
        {/* Plan label + current badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {displayName}
          </span>
          {isCurrent && (
            <Badge variant="success" className="shrink-0">
              {t('billing.currentPlan')}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mt-3">
          {isFree ? (
            <p className="text-3xl font-bold text-text-secondary">{t('billing.free')}</p>
          ) : isEnterprise ? (
            <p className="text-3xl font-bold text-text-secondary">{t('billing.custom')}</p>
          ) : (
            <p className="flex items-baseline gap-1 text-3xl font-bold text-text-primary">
              {plan.price}
              <span className="text-sm font-normal text-text-secondary">{plan.currency}</span>
              {cycleLabel && (
                <span className="text-sm font-normal text-text-secondary">/ {cycleLabel}</span>
              )}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* Description */}
        {description && (
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">{description}</p>
        )}

        {/* Features — flex-1 keeps all cards equal height */}
        <ul className="flex-1 space-y-2.5">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
              <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA — always at bottom */}
        <div className="mt-6">
          {isCurrent ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <Check size={14} />
              {t('billing.currentPlan')}
            </div>
          ) : isFree ? (
            <p className="text-sm font-medium text-text-secondary">{t('billing.included')}</p>
          ) : isEnterprise ? (
            <Button type="button" variant="secondary" className="w-full" disabled>
              {t('billing.contactSales')}
            </Button>
          ) : (
            <PermissionGate permission={PERMISSIONS.BILLING_MANAGE}>
              <Button
                type="button"
                className="w-full"
                onClick={() => onCheckout(plan)}
                isLoading={isLoading}
                disabled={isLoading || !canManage}
              >
                {t('billing.upgradeToPlan', { name: displayName })}
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Checkout Result Card ─────────────────────────────────────────────────────
function CheckoutResultCard({ result, onSync, syncLoading }) {
  const { t } = useTranslation()
  const attempt = result?.paymentAttempt ?? null
  const paymentUrl = result?.paymentUrl ?? attempt?.paymentUrl ?? null

  if (!attempt && !paymentUrl) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('billing.checkoutStarted')}</CardTitle>
        {attempt?.status && (
          <Badge variant={getStatusVariant(attempt.status)}>{attempt.status}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {attempt?.amount != null && (
          <p className="mb-4 text-2xl font-bold text-text-primary">
            {attempt.amount}
            <span className="ms-1.5 text-base font-normal text-text-secondary">
              {attempt.currency ?? ''}
            </span>
          </p>
        )}
        {attempt?.providerInvoiceId && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-muted">{t('payments.providerInvoiceId')}</span>
            <span className="max-w-[200px] truncate font-mono text-xs text-text-secondary">
              {attempt.providerInvoiceId}
            </span>
          </div>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          {attempt?._id && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onSync(attempt._id)}
              isLoading={syncLoading}
              disabled={syncLoading}
            >
              {!syncLoading && <RefreshCw size={14} />}
              {t('billing.syncPayment')}
            </Button>
          )}
          {paymentUrl && (
            <Button type="button" size="sm" onClick={() => openUrl(paymentUrl)}>
              <ExternalLink size={14} />
              {t('billing.openPaymentPage')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Recent Payments Card ─────────────────────────────────────────────────────
function RecentPaymentsCard({
  attempts,
  isLoading,
  isError,
  refetch,
  onVerify,
  onSync,
  verifyPending,
  syncPending,
  verifyVariables,
  syncVariables,
}) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('billing.recentPayments')}</CardTitle>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
        >
          <RefreshCw size={14} />
          {t('common.refresh')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={refetch} />}

        {!isLoading && !isError && attempts.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm font-medium text-text-primary">{t('payments.noAttempts')}</p>
            <p className="mt-1 text-xs text-text-secondary">{t('billing.paymentsEmptyHint')}</p>
          </div>
        )}

        {!isLoading && !isError && attempts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t('common.createdAt')}
                  </th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t('common.amount')}
                  </th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t('billing.status')}
                  </th>
                  <th className="px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t('payments.providerInvoiceId')}
                  </th>
                  <th className="px-3 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((attempt) => {
                  const isVerifying = verifyPending && verifyVariables === attempt._id
                  const isSyncing = syncPending && syncVariables === attempt._id
                  const showSync = ['paid', 'pending', 'initiated'].includes(
                    String(attempt.status ?? '').toLowerCase()
                  )
                  return (
                    <tr
                      key={attempt._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-3 py-3.5 text-text-secondary">
                        {formatDateTime(attempt.createdAt) ?? '-'}
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-text-primary">
                        {attempt.amount} {attempt.currency}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={getStatusVariant(attempt.status)}>
                          {attempt.status || '-'}
                        </Badge>
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-3.5 font-mono text-xs text-text-muted">
                        {attempt.providerInvoiceId || '-'}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openUrl(attempt.paymentUrl)}
                            disabled={!attempt.paymentUrl}
                            title={t('billing.openPaymentPage')}
                          >
                            <ExternalLink size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onVerify(attempt._id)}
                            isLoading={isVerifying}
                            disabled={verifyPending}
                            title={t('payments.verify')}
                          >
                            {!isVerifying && <RefreshCw size={14} />}
                          </Button>
                          {showSync && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onSync(attempt._id)}
                              isLoading={isSyncing}
                              disabled={syncPending}
                              title={t('billing.syncPayment')}
                            >
                              {!isSyncing && <RefreshCw size={14} />}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Subscription Inactive Warning ────────────────────────────────────────────
const INACTIVE_STATUSES = ['expired', 'cancelled', 'canceled', 'past_due']

function SubscriptionInactiveWarning({ subscription }) {
  const { t } = useTranslation()
  if (!subscription) return null
  const status = String(subscription.status ?? '').toLowerCase()
  if (!INACTIVE_STATUSES.includes(status)) return null

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-4">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-900">
          {t('billing.subscriptionInactive')}
        </p>
        <p className="mt-0.5 text-sm text-red-800">
          {t('billing.subscriptionInactiveDescription')}
        </p>
        <p className="mt-2 text-sm font-medium text-red-800">
          {t('billing.renewPlan')}
        </p>
      </div>
    </div>
  )
}

// ─── Usage Metric Card ────────────────────────────────────────────────────────
function getUsagePayload(usageData) {
  if (!usageData) return null
  return usageData?.data?.usage ? usageData.data : usageData
}

function hasUsageMetric(metric) {
  return !!metric && typeof metric === 'object' && Object.keys(metric).length > 0
}

function toMetricNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function UsageMetricCard({ title, description, metric }) {
  const { t } = useTranslation()

  const hasMetric = hasUsageMetric(metric)
  const unlimited = Boolean(metric?.unlimited)
  const hasLimit = unlimited || metric?.limit != null

  if (!hasMetric || !hasLimit) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        )}
        <p className="mt-4 text-sm text-text-secondary">{t('billing.usageUnavailable')}</p>
      </div>
    )
  }

  const used = toMetricNumber(metric?.used)
  const limit = toMetricNumber(metric?.limit)
  const remaining =
    metric?.remaining != null
      ? toMetricNumber(metric.remaining)
      : Math.max(limit - used, 0)
  const rawPercent =
    metric?.percent != null
      ? toMetricNumber(metric.percent)
      : limit > 0
        ? (used / limit) * 100
        : 0
  const clampedPercent = Math.min(100, Math.max(0, rawPercent))
  const isLimitReached = !unlimited && clampedPercent >= 100
  const isNearLimit = !unlimited && clampedPercent >= 80 && clampedPercent < 100

  let barColor = 'bg-green-500'
  let statusText = t('billing.usageNormal')
  let statusTextClass = 'text-text-secondary'

  if (isLimitReached) {
    barColor = 'bg-red-500'
    statusText = t('billing.limitReached')
    statusTextClass = 'text-red-600 font-semibold'
  } else if (isNearLimit) {
    barColor = 'bg-amber-500'
    statusText = t('billing.nearLimit')
    statusTextClass = 'text-amber-600 font-medium'
  }

  return (
    <div
      className={[
        'rounded-xl border bg-card p-5 shadow-sm',
        isLimitReached ? 'border-red-300' : isNearLimit ? 'border-amber-300' : 'border-border',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
          )}
        </div>
        {(isLimitReached || isNearLimit) && (
          <AlertTriangle
            size={16}
            className={[
              'shrink-0',
              isLimitReached ? 'text-red-500' : 'text-amber-500',
            ].join(' ')}
          />
        )}
      </div>

      <div className="mt-4">
        {unlimited ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold text-text-primary">{used}</span>
              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                {t('billing.unlimited')}
              </span>
            </div>

            <div className="mt-3" dir="ltr">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted" />
            </div>

            <p className="mt-2 text-xs text-text-secondary">{t('billing.unlimited')}</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {t('billing.usedOfLimit', { used, limit })}
              </span>
              <span className="text-xs text-text-secondary">
                {t('billing.remainingCount', { count: remaining })}
              </span>
            </div>

            <div className="mt-3" dir="ltr">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={['h-full rounded-full transition-all', barColor].join(' ')}
                  style={{ width: `${clampedPercent}%` }}
                />
              </div>
            </div>

            <p className={['mt-2 text-xs', statusTextClass].join(' ')}>{statusText}</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Plan Usage Section ───────────────────────────────────────────────────────
function PlanUsageSection({ usageData, isLoading, isError, refetch }) {
  const { t } = useTranslation()

  const sectionHeader = (
    <div className="mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
        {t('billing.usage')}
      </h2>
      <p className="mt-0.5 text-xs text-text-secondary">{t('billing.usageSubtitle')}</p>
    </div>
  )

  if (isLoading) {
    return (
      <div>
        {sectionHeader}
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="space-y-3">
                <div className="h-4 w-2/5 rounded bg-muted" />
                <div className="h-3 w-3/5 rounded bg-muted" />
                <div className="mt-4 h-8 w-1/3 rounded bg-muted" />
                <div className="h-2 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        {sectionHeader}
        <ErrorState onRetry={refetch} />
      </div>
    )
  }

  const usagePayload = getUsagePayload(usageData)
  const usage = usagePayload?.usage ?? null

  if (!usage) {
    return (
      <div>
        {sectionHeader}
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-text-secondary">{t('billing.usageUnavailable')}</p>
        </div>
      </div>
    )
  }

  const { users = null, invoicesPerMonth = null } = usage

  return (
    <div>
      {sectionHeader}
      <div className="grid gap-5 sm:grid-cols-2">
        <UsageMetricCard
          title={t('billing.usersUsage')}
          description={t('billing.usersUsageDescription')}
          metric={users}
        />
        <UsageMetricCard
          title={t('billing.invoicesUsage')}
          description={t('billing.invoicesUsageDescription')}
          metric={invoicesPerMonth}
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canManage = hasPermission(user, PERMISSIONS.BILLING_MANAGE)
  const canRead = hasPermission(user, [PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_MANAGE])

  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useBillingPlans()

  const {
    data: subscription,
    isLoading: subLoading,
    isError: subError,
    refetch: refetchSub,
  } = useCurrentSubscription()

  const {
    data: usageData,
    isLoading: usageLoading,
    isError: usageError,
    refetch: refetchUsage,
  } = useBillingUsage()

  const checkout = useCheckoutPlan()
  const syncPayment = useSyncBillingPayment()
  const verifyPayment = useVerifyPaymentAttempt()

  const [checkoutResult, setCheckoutResult] = useState(null)
  const [emailRequiredBanner, setEmailRequiredBanner] = useState(false)

  const {
    data: recentPaymentsResponse,
    isLoading: recentLoading,
    isError: recentError,
    refetch: refetchRecent,
  } = usePaymentAttempts(
    { referenceType: 'subscription', page: 1, limit: 10 },
    { enabled: canRead }
  )

  // currentPlanId: the planId object or its _id — PlanCard resolves both
  const currentPlanId = subscription?.planId ?? subscription?.plan?._id ?? subscription?.plan
  const planList = Array.isArray(plansData) ? plansData : (plansData?.plans ?? [])
  const recentAttempts = recentPaymentsResponse?.data ?? []
  const usagePayload = getUsagePayload(usageData)
  const inactiveWarningSubscription = subscription ?? usagePayload?.subscription ?? null

  async function handleCheckout(plan) {
    if (!canManage) return
    if (!plan.code) {
      toast.error(t('billing.planCodeMissing'))
      return
    }
    try {
      const result = await checkout.mutateAsync({
        planCode: plan.code,
        billingCycle: plan.billingCycle,
      })
      setEmailRequiredBanner(false)
      setCheckoutResult(result)
      const url = result?.paymentUrl ?? result?.paymentAttempt?.paymentUrl
      if (url) openUrl(url)
    } catch (e) {
      if (e?.code === 'BILLING_CUSTOMER_EMAIL_REQUIRED') {
        setEmailRequiredBanner(true)
      }
      // other errors handled by hook toast
    }
  }

  async function handleSync(paymentAttemptId) {
    try {
      await syncPayment.mutateAsync(paymentAttemptId)
      refetchSub()
      refetchRecent()
    } catch (_) {
      // handled by hook toast
    }
  }

  async function handleVerify(attemptId) {
    try {
      const result = await verifyPayment.mutateAsync(attemptId)
      if (result?.paymentAttempt) {
        setCheckoutResult({
          paymentAttempt: result.paymentAttempt,
          paymentUrl: result.paymentAttempt.paymentUrl,
        })
      }
      refetchRecent()
    } catch (_) {
      // handled by hook toast
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title={t('billing.title')} subtitle={t('billing.subtitle')} />

      <div className="space-y-6">
        <CurrentSubscriptionCard
          subscription={subscription}
          isLoading={subLoading}
          isError={subError}
          refetch={refetchSub}
        />

        <SubscriptionInactiveWarning subscription={inactiveWarningSubscription} />

        <PlanUsageSection
          usageData={usageData}
          isLoading={usageLoading}
          isError={usageError}
          refetch={refetchUsage}
        />

        {checkoutResult && (
          <CheckoutResultCard
            result={checkoutResult}
            onSync={handleSync}
            syncLoading={syncPayment.isPending}
          />
        )}

        {emailRequiredBanner && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                {t('billing.companyEmailRequired')}
              </p>
              <p className="mt-0.5 text-sm text-amber-800">
                {t('billing.companyEmailRequiredDesc')}{' '}
                <Link
                  to={ROUTES.SETTINGS}
                  className="font-semibold underline underline-offset-2 hover:no-underline"
                >
                  {t('billing.goToSettings')}
                </Link>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailRequiredBanner(false)}
              className="shrink-0 rounded p-0.5 text-amber-600 hover:bg-amber-100"
              aria-label={t('common.close')}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
            {t('billing.availablePlans')}
          </h2>
          {plansLoading && <LoadingState />}
          {plansError && <ErrorState onRetry={refetchPlans} />}
          {!plansLoading && !plansError && planList.length === 0 && (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-text-secondary">
              {t('billing.noPlans')}
            </div>
          )}
          {!plansLoading && !plansError && planList.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {planList.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  currentPlanId={currentPlanId}
                  onCheckout={handleCheckout}
                  isLoading={checkout.isPending}
                  canManage={canManage}
                />
              ))}
            </div>
          )}
        </div>

        {canRead && (
          <RecentPaymentsCard
            attempts={recentAttempts}
            isLoading={recentLoading}
            isError={recentError}
            refetch={refetchRecent}
            onVerify={handleVerify}
            onSync={handleSync}
            verifyPending={verifyPayment.isPending}
            syncPending={syncPayment.isPending}
            verifyVariables={verifyPayment.variables}
            syncVariables={syncPayment.variables}
          />
        )}
      </div>
    </div>
  )
}
