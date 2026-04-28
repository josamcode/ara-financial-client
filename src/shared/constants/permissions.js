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

  // Customers
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',

  // Suppliers
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_DELETE: 'supplier:delete',

  // Invoices
  INVOICE_READ: 'invoice:read',
  INVOICE_CREATE: 'invoice:create',
  INVOICE_UPDATE: 'invoice:update',
  INVOICE_DELETE: 'invoice:delete',
  INVOICE_SEND: 'invoice:send',

  // Payments
  PAYMENT_READ: 'payment:read',
  PAYMENT_CREATE: 'payment:create',

  // Bills
  BILL_READ: 'bill:read',
  BILL_CREATE: 'bill:create',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // Audit
  AUDIT_READ: 'audit:read',

  // Billing (SaaS subscription)
  BILLING_READ: 'billing:read',
  BILLING_MANAGE: 'billing:manage',

  // Tax Rates
  TAX_READ: 'tax:read',
  TAX_MANAGE: 'tax:manage',

  // Exchange Rates
  EXCHANGE_RATE_READ: 'exchange_rate:read',
  EXCHANGE_RATE_MANAGE: 'exchange_rate:manage',
}

function getUserPermissions(user) {
  if (!user) return []

  const permissionSources = [
    user.permissions,
    user.role?.permissions,
    user.roleId?.permissions,
    user.user?.permissions,
    user.user?.role?.permissions,
    user.user?.roleId?.permissions,
  ]

  return permissionSources.find(Array.isArray) ?? []
}

export function hasPermission(user, permission) {
  if (!user) return false
  const userPermissions = getUserPermissions(user)
  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p))
  }
  return userPermissions.includes(permission)
}

export function hasAllPermissions(user, permissions) {
  if (!user) return false
  const userPermissions = getUserPermissions(user)
  return permissions.every((p) => userPermissions.includes(p))
}
