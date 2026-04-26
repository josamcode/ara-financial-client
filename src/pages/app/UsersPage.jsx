import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Shield, UserX, Users, UserPlus, Search, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/entities/auth/model/useAuth'
import { useChangeUserRole, useDeactivateUser, useInviteUser, useUsers } from '@/features/users/hooks/useUsers'
import { useBillingUsage } from '@/features/billing/hooks/useBilling'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PlanLimitNotice } from '@/shared/components/PlanLimitNotice'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { formatDateTime } from '@/shared/utils/formatters'
import { buildInvitationAcceptUrl } from '@/pages/setup/utils/invitationUrl'

const PAGE_SIZE = 20

const ROLE_RANK = {
  accountant: 1,
  admin: 2,
  owner: 3,
}

const BILLING_WRITE_ERROR_KEYS = {
  PLAN_LIMIT_EXCEEDED: 'planLimit.error.planLimitExceeded',
  SUBSCRIPTION_REQUIRED: 'planLimit.error.subscriptionRequired',
  SUBSCRIPTION_INACTIVE: 'planLimit.error.subscriptionInactive',
}

const INACTIVE_SUBSCRIPTION_STATUSES = new Set(['expired', 'cancelled', 'canceled', 'past_due'])

function getBillingUsagePayload(usageData) {
  if (!usageData) return null
  return usageData?.data?.usage ? usageData.data : usageData
}

function toMetricNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function isUsageLimitReached(metric) {
  if (!metric || metric.unlimited) return false
  const percent = metric.percent != null ? toMetricNumber(metric.percent) : 0
  const used = toMetricNumber(metric.used)
  const limit = toMetricNumber(metric.limit)
  return percent >= 100 || (limit > 0 && used >= limit)
}

function isSubscriptionBlocked(subscription) {
  if (!subscription?.status) return false
  return INACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.status).toLowerCase())
}

function getBillingWriteErrorKey(error) {
  return BILLING_WRITE_ERROR_KEYS[error?.code] ?? null
}

function isBillingWriteError(error) {
  return Boolean(getBillingWriteErrorKey(error))
}

function resolveRoleName(member) {
  return member?.role?.name ?? member?.roleId?.name ?? ''
}

function resolveRoleLabel(member, t) {
  const role = member?.role ?? member?.roleId
  const roleName = resolveRoleName(member)
  return role?.label || t(`users.${roleName}`, { defaultValue: roleName || '-' })
}

function canManageTarget(currentRoleName, targetRoleName) {
  const currentRank = ROLE_RANK[currentRoleName] || 0
  const targetRank = ROLE_RANK[targetRoleName] || 0
  return currentRank > targetRank
}

function getAssignableRoles(currentRoleName) {
  const currentRank = ROLE_RANK[currentRoleName] || 0
  return ['admin', 'accountant'].filter((r) => (ROLE_RANK[r] || 0) < currentRank)
}

function getMemberStatus(member) {
  if (member?.isActive) return 'active'
  if (member?.invitationExpiresAt) {
    return new Date(member.invitationExpiresAt).getTime() >= Date.now() ? 'invited' : 'inviteExpired'
  }
  return 'inactive'
}

function getStatusBadgeConfig(status, t) {
  switch (status) {
    case 'active':      return { label: t('common.active'), variant: 'success' }
    case 'invited':     return { label: t('users.statusInvited'), variant: 'info' }
    case 'inviteExpired': return { label: t('users.statusInviteExpired'), variant: 'warning' }
    default:            return { label: t('common.inactive'), variant: 'default' }
  }
}

function PaginationControls({ pagination, onPageChange, t }) {
  if (!pagination || pagination.totalPages <= 1) return null
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 text-sm text-text-muted">
      <span>
        {t('common.showingRange', {
          from: (pagination.page - 1) * pagination.limit + 1,
          to: Math.min(pagination.page * pagination.limit, pagination.total),
          total: pagination.total,
        })}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" disabled={!pagination.hasPrevPage} onClick={() => onPageChange(pagination.page - 1)}>
          {t('common.previous')}
        </Button>
        <span className="px-2 tabular-nums">{t('common.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}</span>
        <Button size="sm" variant="secondary" disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.page + 1)}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}

// ── Invite form schema ──────────────────────────────────────────────────────
const inviteSchema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.emailInvalid'),
  name: z.string().min(2, 'errors.minLength'),
  roleName: z.enum(['admin', 'accountant']),
})

function InviteForm({ onClose, t, onBillingWriteError }) {
  const inviteMutation = useInviteUser()
  const [inviteResult, setInviteResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { roleName: 'accountant' },
  })

  async function onSubmit(values) {
    try {
      const result = await inviteMutation.mutateAsync(values)
      const invitation = result?.data?.invitation ?? result?.invitation
      const acceptUrl = buildInvitationAcceptUrl(invitation)
      setInviteResult({ ...values, acceptUrl })
      reset({ roleName: 'accountant' })
    } catch (error) {
      if (isBillingWriteError(error)) {
        onBillingWriteError?.(error)
      }
      // toast feedback is handled in mutation onError
    }
  }

  function handleCopy(url) {
    navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inviteResult) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-success/20 bg-success/5 p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">{inviteResult.name}</p>
            <p className="text-sm text-text-secondary">{inviteResult.email}</p>
          </div>
        </div>

        {inviteResult.acceptUrl ? (
          <div>
            <p className="text-sm font-medium text-text-primary mb-1.5">
              {t('setup.invitationLink')}
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteResult.acceptUrl}
                className="h-input flex-1 min-w-0 rounded-md border border-input bg-surface-subtle px-3 text-xs font-mono text-text-secondary focus:outline-none"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(inviteResult.acceptUrl)}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-1.5">{t('setup.inviteManualShareHint')}</p>
          </div>
        ) : (
          <p className="text-sm text-text-muted">{t('setup.invitationLinkUnavailable')}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setInviteResult(null)}
          >
            {t('users.inviteAnother') || (t('common.back'))}
          </Button>
          <Button type="button" size="sm" onClick={onClose}>
            {t('common.done')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label={t('common.email')}
        type="email"
        required
        error={errors.email && t(errors.email.message)}
        {...register('email')}
      />
      <Input
        label={t('common.name')}
        required
        error={errors.name && t(errors.name.message, { min: 2 })}
        {...register('name')}
      />
      <Controller
        name="roleName"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'admin', label: t('setup.roleAdmin') },
              { value: 'accountant', label: t('setup.roleAccountant') },
            ]}
            label={t('setup.role')}
          />
        )}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          <UserPlus size={14} />
          {t('setup.sendInvite')}
        </Button>
      </div>
    </form>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { t, i18n } = useTranslation()
  const { user: currentUser } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [invitePanelOpen, setInvitePanelOpen] = useState(false)
  const [forceUsersLimitNotice, setForceUsersLimitNotice] = useState(false)

  const queryParams = useMemo(() => ({ page, limit: PAGE_SIZE }), [page])

  const usersQuery = useUsers(queryParams)
  const billingUsageQuery = useBillingUsage()
  const roleMutation = useChangeUserRole()
  const deactivateMutation = useDeactivateUser()

  const allMembers = usersQuery.data?.users || []
  const billingUsagePayload = getBillingUsagePayload(billingUsageQuery.data)
  const usersUsage = billingUsagePayload?.usage?.users ?? null
  const billingSubscription = billingUsagePayload?.subscription ?? null
  const billingPlan =
    billingUsagePayload?.plan ??
    billingSubscription?.planId ??
    billingSubscription?.plan ??
    null
  const usersLimitReached = isUsageLimitReached(usersUsage)
  const subscriptionBlocked = isSubscriptionBlocked(billingSubscription)
  const userWriteBlocked = usersLimitReached || subscriptionBlocked
  const showUsersLimitNotice = subscriptionBlocked || usersLimitReached || forceUsersLimitNotice
  const pagination = usersQuery.data?.pagination
  const currentRoleName = resolveRoleName(currentUser)
  const canUpdateRoles = hasPermission(currentUser, PERMISSIONS.USER_UPDATE)
  const canDeactivateUsers = hasPermission(currentUser, PERMISSIONS.USER_DEACTIVATE)
  const canInvite = hasPermission(currentUser, PERMISSIONS.USER_UPDATE)

  // Client-side search by name or email
  const members = useMemo(() => {
    if (!search.trim()) return allMembers
    const q = search.toLowerCase()
    return allMembers.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
    )
  }, [allMembers, search])

  async function handleRoleChange(member, nextRoleName) {
    const currentRole = resolveRoleName(member)
    if (!nextRoleName || nextRoleName === currentRole) return
    await roleMutation.mutateAsync({ id: member._id, roleName: nextRoleName })
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget) return
    await deactivateMutation.mutateAsync(deactivateTarget._id)
    setDeactivateTarget(null)
  }

  function getBlockedInviteToastKey() {
    return subscriptionBlocked
      ? 'planLimit.error.subscriptionInactive'
      : 'planLimit.error.planLimitExceeded'
  }

  function handleInviteClick() {
    if (userWriteBlocked) {
      if (usersLimitReached) {
        setForceUsersLimitNotice(true)
      }
      toast.error(t(getBlockedInviteToastKey()))
      return
    }

    setInvitePanelOpen(true)
  }

  function handleBillingWriteError(error) {
    if (error?.code === 'PLAN_LIMIT_EXCEEDED') {
      setForceUsersLimitNotice(true)
    }
    billingUsageQuery.refetch()
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          canInvite && (
            <Button
              size="sm"
              variant={userWriteBlocked ? 'secondary' : 'primary'}
              className={
                userWriteBlocked
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : undefined
              }
              onClick={handleInviteClick}
            >
              <UserPlus size={15} />
              {t('users.inviteUser') || (i18n.language === 'ar' ? 'دعوة عضو' : 'Invite Member')}
            </Button>
          )
        }
      />

      {showUsersLimitNotice && (
        <div className="mb-5">
          <PlanLimitNotice
            type={subscriptionBlocked ? 'subscriptionInactive' : 'users'}
            usageItem={usersUsage}
            plan={billingPlan}
            subscription={billingSubscription}
          />
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute inset-y-0 start-3 my-auto text-text-muted pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={i18n.language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
          className="h-input w-full rounded-md border border-input bg-surface ps-9 pe-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-focus"
        />
      </div>

      {usersQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {usersQuery.isError && (
        <ErrorState title={t('common.somethingWentWrong')} onRetry={() => usersQuery.refetch()} />
      )}

      {!usersQuery.isLoading && !usersQuery.isError && !members.length && (
        <EmptyState
          icon={Users}
          title={search ? (i18n.language === 'ar' ? 'لا توجد نتائج' : 'No results found') : t('users.emptyTitle')}
          message={
            search
              ? (i18n.language === 'ar' ? `لا يوجد عضو بالاسم أو البريد "${search}"` : `No member matches "${search}"`)
              : t('users.emptyMessage')
          }
          action={search ? () => setSearch('') : undefined}
          actionLabel={search ? (i18n.language === 'ar' ? 'مسح البحث' : 'Clear search') : undefined}
        />
      )}

      {!usersQuery.isLoading && !usersQuery.isError && members.length > 0 && (
        <>
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle">
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted">{t('users.member')}</th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted w-56">{t('users.role')}</th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted w-40">{t('common.status')}</th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-text-muted w-64">{t('users.access')}</th>
                    <th className="px-4 py-3.5 text-end text-xs font-semibold text-text-muted w-32">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => {
                    const roleName = resolveRoleName(member)
                    const status = getMemberStatus(member)
                    const statusBadge = getStatusBadgeConfig(status, t)
                    const isCurrentUser = String(member._id) === String(currentUser?._id)
                    const canManageMember = canManageTarget(currentRoleName, roleName)
                    const assignableRoles = getAssignableRoles(currentRoleName)
                    const canChangeRole =
                      canUpdateRoles && !isCurrentUser && canManageMember && assignableRoles.includes(roleName)
                    const showRoleSelector = canChangeRole && assignableRoles.length > 1
                    const canDeactivateMember =
                      canDeactivateUsers && !isCurrentUser && member.isActive && canManageMember

                    return (
                      <tr key={member._id} className="hover:bg-surface-subtle/60 transition-colors cursor-default">
                        <td className="px-4 py-3.5 align-top">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Shield size={16} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-text-primary truncate">{member.name}</p>
                                {isCurrentUser && <Badge size="sm" variant="primary">{t('users.you')}</Badge>}
                              </div>
                              <p className="text-text-secondary truncate mt-0.5">{member.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <div className="space-y-2">
                            <Badge variant="default" size="sm">{resolveRoleLabel(member, t)}</Badge>
                            {showRoleSelector && (
                              <Select
                                value={roleName}
                                onChange={(newRole) => handleRoleChange(member, newRole)}
                                options={assignableRoles.map((option) => ({
                                  value: option,
                                  label: t(`users.${option}`),
                                }))}
                                disabled={roleMutation.isPending}
                              />
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <Badge variant={statusBadge.variant} size="sm">{statusBadge.label}</Badge>
                        </td>

                        <td className="px-4 py-3.5 align-top text-sm text-text-secondary">
                          {status === 'invited' && member.invitationExpiresAt ? (
                            <div>
                              <p>{t('users.pendingInviteUntil', { date: formatDateTime(member.invitationExpiresAt, i18n.language) })}</p>
                              <p className="text-xs text-text-muted mt-1">{t('users.neverLoggedIn')}</p>
                            </div>
                          ) : status === 'inviteExpired' && member.invitationExpiresAt ? (
                            <div>
                              <p>{t('users.inviteExpiredOn', { date: formatDateTime(member.invitationExpiresAt, i18n.language) })}</p>
                              <p className="text-xs text-text-muted mt-1">{t('users.neverLoggedIn')}</p>
                            </div>
                          ) : member.lastLoginAt ? (
                            <div>
                              <p>{formatDateTime(member.lastLoginAt, i18n.language)}</p>
                              <p className="text-xs text-text-muted mt-1">{t('users.lastLogin')}</p>
                            </div>
                          ) : (
                            <span className="text-text-muted">{t('users.neverLoggedIn')}</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 align-top">
                          <div className="flex justify-end">
                            {canDeactivateMember ? (
                              <Button size="sm" variant="danger" onClick={() => setDeactivateTarget(member)}>
                                <UserX size={14} />
                                {t('users.deactivate')}
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {!search && (
            <PaginationControls pagination={pagination} onPageChange={setPage} t={t} />
          )}
        </>
      )}

      {/* Invite member panel */}
      <SlidePanel
        open={invitePanelOpen}
        onClose={() => setInvitePanelOpen(false)}
        title={i18n.language === 'ar' ? 'دعوة عضو جديد' : 'Invite New Member'}
      >
        <InviteForm
          onClose={() => setInvitePanelOpen(false)}
          t={t}
          onBillingWriteError={handleBillingWriteError}
        />
      </SlidePanel>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={t('users.deactivate')}
        message={
          deactivateTarget
            ? `${deactivateTarget.name} (${deactivateTarget.email})`
            : ''
        }
        confirmLabel={t('users.deactivate')}
        confirmVariant="danger"
        isLoading={deactivateMutation.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
