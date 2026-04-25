export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCEPT_INVITE: '/accept-invite',

  // Setup
  SETUP: '/setup',

  // App
  DASHBOARD: '/dashboard',

  // Accounts
  ACCOUNTS: '/accounts',

  // Journal
  JOURNAL: '/journal',
  JOURNAL_NEW: '/journal/new',
  JOURNAL_DETAIL: (id = ':id') => `/journal/${id}`,

  // Ledger
  LEDGER: '/ledger',
  LEDGER_ACCOUNT: (accountId = ':accountId') => `/ledger/${accountId}`,

  // Reports
  REPORTS: '/reports',
  REPORTS_TRIAL_BALANCE: '/reports/trial-balance',
  REPORTS_INCOME_STATEMENT: '/reports/income-statement',
  REPORTS_BALANCE_SHEET: '/reports/balance-sheet',
  REPORTS_CASH_FLOW: '/reports/cash-flow',
  REPORTS_AR_AGING: '/reports/ar-aging',
  REPORTS_AP_AGING: '/reports/ap-aging',

  // Fiscal Periods
  FISCAL_PERIODS: '/fiscal-periods',

  // Payments
  PAYMENTS: '/payments',

  // Users
  USERS: '/users',

  // Audit Logs
  AUDIT_LOGS: '/audit-logs',

  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_DETAIL: (id = ':id') => `/customers/${id}`,
  CUSTOMER_STATEMENT: (id = ':id') => `/customers/${id}/statement`,
  CUSTOMER_STATEMENT_PRINT: (id = ':id') => `/customers/${id}/statement/print`,

  // Suppliers
  SUPPLIERS: '/suppliers',
  SUPPLIER_DETAIL: (id = ':id') => `/suppliers/${id}`,
  SUPPLIER_STATEMENT: (id = ':id') => `/suppliers/${id}/statement`,
  SUPPLIER_STATEMENT_PRINT: (id = ':id') => `/suppliers/${id}/statement/print`,

  // Invoices
  INVOICES: '/invoices',
  INVOICE_NEW: '/invoices/new',
  INVOICE_DETAIL: (id = ':id') => `/invoices/${id}`,
  INVOICE_PRINT: (id = ':id') => `/invoices/${id}/print`,

  // Bills
  BILLS: '/bills',
  BILL_NEW: '/bills/new',
  BILL_DETAIL: (id = ':id') => `/bills/${id}`,

  // Billing (SaaS subscription)
  BILLING: '/billing',
  BILLING_PAYMENT_RESULT: '/billing/payment-result',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_SECURITY: '/settings/security',
}
