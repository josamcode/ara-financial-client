export const PERMISSIONS = {
  // Users
  USER_READ: 'user:read',
  USER_INVITE: 'user:invite',
  USER_UPDATE: 'user:update',
  USER_DEACTIVATE: 'user:deactivate',

  // Tenant
  TENANT_READ: 'tenant:read',
  TENANT_UPDATE: 'tenant:update',

  // Accounts
  ACCOUNT_READ: 'account:read',
  ACCOUNT_CREATE: 'account:create',
  ACCOUNT_UPDATE: 'account:update',
  ACCOUNT_DELETE: 'account:delete',

  // Fiscal Periods
  FISCAL_READ: 'fiscal:read',
  FISCAL_CREATE: 'fiscal:create',
  FISCAL_UPDATE: 'fiscal:update',
  FISCAL_LOCK: 'fiscal:lock',

  // Journal Entries
  JOURNAL_READ: 'journal:read',
  JOURNAL_CREATE: 'journal:create',
  JOURNAL_UPDATE: 'journal:update',
  JOURNAL_POST: 'journal:post',
  JOURNAL_DELETE: 'journal:delete',

  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // Audit
  AUDIT_READ: 'audit:read',
}

export function hasPermission(user, permission) {
  if (!user) return false
  const userPermissions = user?.role?.permissions ?? user?.roleId?.permissions ?? []
  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p))
  }
  return userPermissions.includes(permission)
}

export function hasAllPermissions(user, permissions) {
  if (!user) return false
  const userPermissions = user?.role?.permissions ?? user?.roleId?.permissions ?? []
  return permissions.every((p) => userPermissions.includes(p))
}
