import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { Spinner } from '@/shared/components/Spinner'

// --- Layouts ---
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { SetupLayout } from '@/layouts/SetupLayout'

// --- Public pages (eager: small) ---
import { LandingPage } from '@/pages/LandingPage'

// --- Auth pages (lazy) ---
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const AcceptInvitePage = lazy(() => import('@/pages/auth/AcceptInvitePage'))

// --- App pages (lazy) ---
const SetupPage = lazy(() => import('@/pages/setup/SetupPage'))
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'))

// --- Feature pages (lazy, placeholder) ---
const AccountsPage = lazy(() => import('@/pages/app/AccountsPage'))
const JournalPage = lazy(() => import('@/pages/app/JournalPage'))
const JournalNewPage = lazy(() => import('@/pages/app/JournalNewPage'))
const JournalDetailPage = lazy(() => import('@/pages/app/JournalDetailPage'))
const LedgerPage = lazy(() => import('@/pages/app/LedgerPage'))
const LedgerAccountPage = lazy(() => import('@/pages/app/LedgerAccountPage'))
const ReportsPage = lazy(() => import('@/pages/app/ReportsPage'))
const TrialBalancePage = lazy(() => import('@/pages/app/reports/TrialBalancePage'))
const IncomeStatementPage = lazy(() => import('@/pages/app/reports/IncomeStatementPage'))
const BalanceSheetPage = lazy(() => import('@/pages/app/reports/BalanceSheetPage'))
const CashFlowPage = lazy(() => import('@/pages/app/reports/CashFlowPage'))
const FiscalPeriodsPage = lazy(() => import('@/pages/app/FiscalPeriodsPage'))
const UsersPage = lazy(() => import('@/pages/app/UsersPage'))
const AuditLogsPage = lazy(() => import('@/pages/app/AuditLogsPage'))
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'))
const CustomersPage = lazy(() => import('@/pages/app/CustomersPage'))
const CustomerDetailPage = lazy(() => import('@/pages/app/CustomerDetailPage'))
const InvoicesPage = lazy(() => import('@/pages/app/InvoicesPage'))
const InvoiceNewPage = lazy(() => import('@/pages/app/InvoiceNewPage'))
const InvoiceDetailPage = lazy(() => import('@/pages/app/InvoiceDetailPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing */}
          <Route path={ROUTES.HOME} element={<LandingPage />} />

          {/* Auth routes — public */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.ACCEPT_INVITE} element={<AcceptInvitePage />} />
          </Route>

          {/* Setup route — requires auth */}
          <Route
            path={ROUTES.SETUP}
            element={
              <ProtectedRoute>
                <SetupLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SetupPage />} />
          </Route>

          {/* App routes — requires auth + setup complete */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

            <Route
              path={ROUTES.ACCOUNTS}
              element={
                <ProtectedRoute permission={PERMISSIONS.ACCOUNT_READ}>
                  <AccountsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.JOURNAL}
              element={
                <ProtectedRoute permission={PERMISSIONS.JOURNAL_READ}>
                  <JournalPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.JOURNAL_NEW}
              element={
                <ProtectedRoute permission={PERMISSIONS.JOURNAL_CREATE}>
                  <JournalNewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.JOURNAL_DETAIL()}
              element={
                <ProtectedRoute permission={PERMISSIONS.JOURNAL_READ}>
                  <JournalDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.LEDGER}
              element={
                <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                  <LedgerPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.LEDGER_ACCOUNT()}
              element={
                <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                  <LedgerAccountPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.REPORTS}
              element={
                <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.REPORTS_TRIAL_BALANCE}
              element={
                <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                  <TrialBalancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.REPORTS_INCOME_STATEMENT}
              element={
                <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                  <IncomeStatementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.REPORTS_BALANCE_SHEET}
              element={
                <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                  <BalanceSheetPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.REPORTS_CASH_FLOW}
              element={
                <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
                  <CashFlowPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.FISCAL_PERIODS}
              element={
                <ProtectedRoute permission={PERMISSIONS.FISCAL_READ}>
                  <FiscalPeriodsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USERS}
              element={
                <ProtectedRoute permission={PERMISSIONS.USER_READ}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.AUDIT_LOGS}
              element={
                <ProtectedRoute permission={PERMISSIONS.AUDIT_READ}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.CUSTOMERS}
              element={
                <ProtectedRoute permission={PERMISSIONS.CUSTOMER_READ}>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.CUSTOMER_DETAIL()}
              element={
                <ProtectedRoute permission={PERMISSIONS.CUSTOMER_READ}>
                  <CustomerDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.INVOICES}
              element={
                <ProtectedRoute permission={PERMISSIONS.INVOICE_READ}>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.INVOICE_NEW}
              element={
                <ProtectedRoute permission={PERMISSIONS.INVOICE_CREATE}>
                  <InvoiceNewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.INVOICE_DETAIL()}
              element={
                <ProtectedRoute permission={PERMISSIONS.INVOICE_READ}>
                  <InvoiceDetailPage />
                </ProtectedRoute>
              }
            />

            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
