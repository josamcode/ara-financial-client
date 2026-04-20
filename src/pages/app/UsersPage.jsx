import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, UserX, Users } from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import { useChangeUserRole, useDeactivateUser, useUsers } from '@/features/users/hooks/useUsers'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { formatDateTime } from '@/shared/utils/formatters'

const PAGE_SIZE = 20

const ROLE_RANK = {
  accountant: 1,
  admin: 2,
  owner: 3,
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

  return ['admin', 'accountant'].filter((roleName) => {
    const roleRank = ROLE_RANK[roleName] || 0
    return roleRank < currentRank
  })
}

function getMemberStatus(member) {
  if (member?.isActive) return 'active'

  if (member?.invitationExpiresAt) {
    return new Date(member.invitationExpiresAt).getTime() >= Date.now()
      ? 'invited'
      : 'inviteExpired'
  }

  return 'inactive'
}

function getStatusBadgeConfig(status, t) {
  switch (status) {
    case 'active':
      return { label: t('common.active'), variant: 'success' }
    case 'invited':
      return { label: t('users.statusInvited'), variant: 'info' }
    case 'inviteExpired':
      return { label: t('users.statusInviteExpired'), variant: 'warning' }
    default:
      return { label: t('common.inactive'), variant: 'default' }
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
        <Button
          size="sm"
          variant="secondary"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          {t('common.previous')}
        </Button>

        <span className="px-2 tabular-nums">
          {t('common.pageOf', {
            page: pagination.page,
            totalPages: pagination.totalPages,
          })}
        </span>

        <Button
          size="sm"
          variant="secondary"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { t, i18n } = useTranslation()
  const { user: currentUser } = useAuth()
  const [page, setPage] = useState(1)
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
    }),
    [page]
  )

  const usersQuery = useUsers(queryParams)
  const roleMutation = useChangeUserRole()
  const deactivateMutation = useDeactivateUser()

  const members = usersQuery.data?.users || []
  const pagination = usersQuery.data?.pagination
  const currentRoleName = resolveRoleName(currentUser)
  const canUpdateRoles = hasPermission(currentUser, PERMISSIONS.USER_UPDATE)
  const canDeactivateUsers = hasPermission(currentUser, PERMISSIONS.USER_DEACTIVATE)

  async function handleRoleChange(member, nextRoleName) {
    const currentRole = resolveRoleName(member)

    if (!nextRoleName || nextRoleName === currentRole) return

    await roleMutation.mutateAsync({
      id: member._id,
      roleName: nextRoleName,
    })
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget) return

    await deactivateMutation.mutateAsync(deactivateTarget._id)
    setDeactivateTarget(null)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
      />

      {usersQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {usersQuery.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => usersQuery.refetch()}
        />
      )}

      {!usersQuery.isLoading && !usersQuery.isError && !members.length && (
        <EmptyState
          icon={Users}
          title={t('users.emptyTitle')}
          message={t('users.emptyMessage')}
        />
      )}

      {!usersQuery.isLoading && !usersQuery.isError && members.length > 0 && (
        <>
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle">
                    <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted">
                      {t('users.member')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-56">
                      {t('users.role')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-40">
                      {t('common.status')}
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-text-muted w-64">
                      {t('users.access')}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted w-32">
                      {t('common.actions')}
                    </th>
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
                      canUpdateRoles &&
                      !isCurrentUser &&
                      canManageMember &&
                      assignableRoles.includes(roleName)
                    const showRoleSelector = canChangeRole && assignableRoles.length > 1
                    const canDeactivateMember =
                      canDeactivateUsers &&
                      !isCurrentUser &&
                      member.isActive &&
                      canManageMember

                    return (
                      <tr key={member._id} className="hover:bg-surface-muted transition-colors">
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Shield size={16} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-text-primary truncate">
                                  {member.name}
                                </p>
                                {isCurrentUser && (
                                  <Badge size="sm" variant="primary">
                                    {t('users.you')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-text-secondary truncate mt-0.5">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="space-y-2">
                            <Badge variant="default" size="sm">
                              {resolveRoleLabel(member, t)}
                            </Badge>

                            {showRoleSelector && (
                              <select
                                value={roleName}
                                onChange={(event) => handleRoleChange(member, event.target.value)}
                                disabled={roleMutation.isPending}
                                className="h-input w-full rounded-md border border-input bg-surface px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:shadow-focus disabled:opacity-60"
                              >
                                {assignableRoles.map((option) => (
                                  <option key={option} value={option}>
                                    {t(`users.${option}`)}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top">
                          <Badge variant={statusBadge.variant} size="sm">
                            {statusBadge.label}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 align-top text-sm text-text-secondary">
                          {status === 'invited' && member.invitationExpiresAt ? (
                            <div>
                              <p>{t('users.pendingInviteUntil', {
                                date: formatDateTime(member.invitationExpiresAt, i18n.language),
                              })}</p>
                              <p className="text-xs text-text-muted mt-1">
                                {t('users.neverLoggedIn')}
                              </p>
                            </div>
                          ) : status === 'inviteExpired' && member.invitationExpiresAt ? (
                            <div>
                              <p>{t('users.inviteExpiredOn', {
                                date: formatDateTime(member.invitationExpiresAt, i18n.language),
                              })}</p>
                              <p className="text-xs text-text-muted mt-1">
                                {t('users.neverLoggedIn')}
                              </p>
                            </div>
                          ) : member.lastLoginAt ? (
                            <div>
                              <p>{formatDateTime(member.lastLoginAt, i18n.language)}</p>
                              <p className="text-xs text-text-muted mt-1">
                                {t('users.lastLogin')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-text-muted">{t('users.neverLoggedIn')}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <div className="flex justify-end">
                            {canDeactivateMember ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setDeactivateTarget(member)}
                              >
                                <UserX size={14} />
                                {t('users.deactivate')}
                              </Button>
                            ) : (
                              <span className="text-xs text-text-muted pt-2">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            t={t}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deactivateTarget}
        title={t('users.deactivate')}
        message={deactivateTarget ? `${deactivateTarget.name} (${deactivateTarget.email})` : ''}
        confirmLabel={t('users.deactivate')}
        confirmVariant="danger"
        isLoading={deactivateMutation.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
