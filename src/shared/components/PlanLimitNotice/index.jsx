import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, BarChart3, CreditCard, ShieldAlert } from 'lucide-react'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { ROUTES } from '@/shared/constants/routes'
import { cn } from '@/shared/utils/cn'

const NOTICE_CONFIG = {
  users: {
    titleKey: 'planLimit.title.users',
    descriptionKey: 'planLimit.description.users',
  },
  invoicesPerMonth: {
    titleKey: 'planLimit.title.invoicesPerMonth',
    descriptionKey: 'planLimit.description.invoicesPerMonth',
  },
  subscriptionInactive: {
    titleKey: 'planLimit.title.subscriptionInactive',
    descriptionKey: 'planLimit.description.subscriptionInactive',
  },
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function resolvePlanName(plan) {
  if (!plan) return null
  return plan.name ?? plan.label ?? plan.code ?? null
}

function resolveSubscriptionStatus(subscription) {
  return subscription?.status ? String(subscription.status) : null
}

function resolveUsage(usageItem) {
  if (!usageItem || typeof usageItem !== 'object') {
    return {
      hasUsage: false,
      used: 0,
      limit: 0,
      remaining: 0,
      percent: 0,
      unlimited: false,
      hasFiniteLimit: false,
    }
  }

  const used = toNumber(usageItem.used)
  const limit = toNumber(usageItem.limit)
  const unlimited = Boolean(usageItem.unlimited)
  const hasFiniteLimit = !unlimited && usageItem.limit != null && Number.isFinite(Number(usageItem.limit))
  const remaining =
    usageItem.remaining != null
      ? toNumber(usageItem.remaining)
      : hasFiniteLimit
        ? Math.max(limit - used, 0)
        : 0
  const percent =
    usageItem.percent != null
      ? toNumber(usageItem.percent)
      : hasFiniteLimit && limit > 0
        ? (used / limit) * 100
        : 0

  return {
    hasUsage: true,
    used,
    limit,
    remaining,
    percent: Math.min(100, Math.max(0, percent)),
    unlimited,
    hasFiniteLimit,
  }
}

export function PlanLimitNotice({
  type,
  usageItem,
  plan,
  subscription,
  title,
  description,
  compact = false,
  onUpgrade,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const config = NOTICE_CONFIG[type] ?? NOTICE_CONFIG.users
  const usage = resolveUsage(usageItem)
  const planName = resolvePlanName(plan)
  const subscriptionStatus = resolveSubscriptionStatus(subscription)
  const isSubscriptionInactive = type === 'subscriptionInactive'
  const isLimitReached = !isSubscriptionInactive && usage.hasFiniteLimit && usage.percent >= 100
  const isNearLimit = !isSubscriptionInactive && usage.hasFiniteLimit && usage.percent >= 80 && usage.percent < 100
  const isBlocked = isSubscriptionInactive || isLimitReached

  const resolvedTitle = title || t(config.titleKey)
  const resolvedDescription = description || t(config.descriptionKey)
  const badge = isSubscriptionInactive
    ? { label: t('billing.subscriptionInactive'), variant: 'error' }
    : isLimitReached
      ? { label: t('planLimit.limitReached'), variant: 'error' }
      : isNearLimit
        ? { label: t('planLimit.nearLimit'), variant: 'warning' }
        : null

  function handleManageBilling() {
    onUpgrade?.()
    navigate(ROUTES.BILLING)
  }

  function handleViewUsage() {
    navigate(`${ROUTES.BILLING}#usage`)
  }

  return (
    <section
      className={cn(
        'rounded-lg border bg-surface shadow-card',
        compact ? 'p-4' : 'p-5 sm:p-6',
        isBlocked ? 'border-red-200' : isNearLimit ? 'border-amber-200' : 'border-border'
      )}
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={cn(
              'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
              isBlocked
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-amber-200 bg-amber-50 text-amber-600'
            )}
          >
            {isSubscriptionInactive ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={cn('font-semibold text-text-primary', compact ? 'text-sm' : 'text-base')}>
                {resolvedTitle}
              </h2>
              {badge && (
                <Badge variant={badge.variant} size="sm">
                  {badge.label}
                </Badge>
              )}
            </div>
            <p className={cn('mt-1 leading-relaxed text-text-secondary', compact ? 'text-xs' : 'text-sm')}>
              {resolvedDescription}
            </p>

            {(planName || subscriptionStatus) && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                {planName && (
                  <span className="rounded-full border border-border bg-surface-subtle px-2 py-1">
                    {t('billing.plan')}: {planName}
                  </span>
                )}
                {subscriptionStatus && (
                  <span className="rounded-full border border-border bg-surface-subtle px-2 py-1">
                    {t('billing.status')}: {subscriptionStatus}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {!compact && (
            <Button type="button" variant="secondary" size="sm" onClick={handleViewUsage}>
              <BarChart3 size={14} />
              {t('planLimit.viewUsage')}
            </Button>
          )}
          <Button type="button" size="sm" onClick={handleManageBilling}>
            <CreditCard size={14} />
            {t('planLimit.manageBilling')}
          </Button>
        </div>
      </div>

      {usage.hasUsage && (
        <div className={cn('border-t border-border', compact ? 'mt-4 pt-4' : 'mt-5 pt-5')}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-text-muted">
                {t('billing.usage')}
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {usage.unlimited
                  ? `${usage.used} ${t('billing.unlimited')}`
                  : usage.hasFiniteLimit
                    ? t('planLimit.usedOfLimit', { used: usage.used, limit: usage.limit })
                    : usage.used}
              </p>
            </div>
            {!usage.unlimited && usage.hasFiniteLimit && (
              <p className="text-xs font-medium text-text-secondary">
                {t('planLimit.remaining', { count: usage.remaining })}
              </p>
            )}
          </div>

          {!usage.unlimited && usage.hasFiniteLimit && (
            <div className="mt-3" dir="ltr">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isLimitReached ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
                  )}
                  style={{ width: `${usage.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default PlanLimitNotice
