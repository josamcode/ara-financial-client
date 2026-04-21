import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Receipt,
  TrendingUp,
  AlertCircle,
  Plus,
  BookOpen,
  BarChart2,
} from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import apiClient from '@/shared/api/client'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import { LoadingCard, LoadingRows } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { ROUTES } from '@/shared/constants/routes'

// ─── Status pill ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  partially_paid: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  posted: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-200 text-gray-400',
}

function StatusPill({ status, ns }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {t(`${ns}.status.${status}`, { defaultValue: status })}
    </span>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────

const ACCENT = {
  blue: { wrap: 'bg-blue-50', icon: 'text-blue-600' },
  orange: { wrap: 'bg-orange-50', icon: 'text-orange-600' },
  green: { wrap: 'bg-green-50', icon: 'text-green-600' },
  red: { wrap: 'bg-red-50', icon: 'text-red-600' },
  default: { wrap: 'bg-primary-50', icon: 'text-primary' },
}

function SummaryCard({ label, value, icon: Icon, accent = 'default', onClick, isLoading }) {
  if (isLoading) return <LoadingCard />

  const a = ACCENT[accent] ?? ACCENT.default

  return (
    <Card
      padding="md"
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${a.wrap}`}>
          <Icon size={18} className={a.icon} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-text-secondary mb-1">{label}</p>
          <p className="text-xl font-bold text-text-primary leading-tight">{value}</p>
        </div>
      </div>
    </Card>
  )
}

// ─── Recent invoices ──────────────────────────────────────────────────────────

function RecentInvoices({ invoices, currency, isLoading }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card padding="none">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.recentInvoices')}</h3>
        <button
          onClick={() => navigate(ROUTES.INVOICES)}
          className="text-xs text-primary hover:underline"
        >
          {t('dashboard.viewAll')}
        </button>
      </div>

      {isLoading && (
        <div className="p-4">
          <LoadingRows count={4} />
        </div>
      )}

      {!isLoading && (!invoices || invoices.length === 0) && (
        <p className="py-8 text-center text-sm text-text-secondary">{t('common.noData')}</p>
      )}

      {!isLoading && invoices && invoices.length > 0 && (
        <ul className="divide-y divide-border">
          {invoices.map((inv) => (
            <li
              key={inv._id}
              className="px-5 py-3 hover:bg-surface-muted transition-colors cursor-pointer"
              onClick={() => navigate(ROUTES.INVOICE_DETAIL(inv._id))}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{inv.customerName}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {inv.invoiceNumber} · {formatDate(inv.dueDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-semibold text-text-primary tabular-nums">
                    {formatCurrency(inv.total, currency)}
                  </span>
                  <StatusPill status={inv.status} ns="invoices" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ─── Recent bills ─────────────────────────────────────────────────────────────

function RecentBills({ bills, currency, isLoading }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card padding="none">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.recentBills')}</h3>
        <button
          onClick={() => navigate(ROUTES.BILLS)}
          className="text-xs text-primary hover:underline"
        >
          {t('dashboard.viewAll')}
        </button>
      </div>

      {isLoading && (
        <div className="p-4">
          <LoadingRows count={4} />
        </div>
      )}

      {!isLoading && (!bills || bills.length === 0) && (
        <p className="py-8 text-center text-sm text-text-secondary">{t('common.noData')}</p>
      )}

      {!isLoading && bills && bills.length > 0 && (
        <ul className="divide-y divide-border">
          {bills.map((bill) => (
            <li
              key={bill._id}
              className="px-5 py-3 hover:bg-surface-muted transition-colors cursor-pointer"
              onClick={() => navigate(ROUTES.BILL_DETAIL(bill._id))}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{bill.supplierName}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {bill.billNumber} · {formatDate(bill.dueDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-semibold text-text-primary tabular-nums">
                    {formatCurrency(bill.total, currency)}
                  </span>
                  <StatusPill status={bill.status} ns="bills" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ─── Quick actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const primary = [
    { label: t('dashboard.newInvoice'), icon: FileText, to: ROUTES.INVOICE_NEW },
    { label: t('dashboard.newBill'), icon: Receipt, to: ROUTES.BILL_NEW },
    { label: t('dashboard.newJournalEntry'), icon: BookOpen, to: ROUTES.JOURNAL_NEW },
  ]

  const secondary = [
    { label: t('dashboard.arAging'), icon: BarChart2, to: ROUTES.REPORTS_AR_AGING },
    { label: t('dashboard.apAging'), icon: BarChart2, to: ROUTES.REPORTS_AP_AGING },
  ]

  return (
    <Card padding="md">
      <h3 className="text-sm font-semibold text-text-primary mb-3">{t('dashboard.quickActions')}</h3>
      <div className="flex flex-wrap gap-2">
        {primary.map(({ label, icon: Icon, to }) => (
          <Button key={to} variant="primary" size="sm" onClick={() => navigate(to)}>
            <Plus size={13} />
            {label}
          </Button>
        ))}
        <span className="w-px bg-border self-stretch mx-1 hidden sm:block" aria-hidden />
        {secondary.map(({ label, icon: Icon, to }) => (
          <Button key={to} variant="secondary" size="sm" onClick={() => navigate(to)}>
            <Icon size={13} />
            {label}
          </Button>
        ))}
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/dashboard'),
    retry: 1,
  })

  const financials = data?.data?.financials
  const arap = data?.data?.arap
  const activity = data?.data?.activity
  const currency = user?.tenant?.baseCurrency || 'EGP'

  const netIncomeNum = financials ? Number(financials.netIncome) : null
  const netIncomeAccent = netIncomeNum === null ? 'default' : netIncomeNum >= 0 ? 'green' : 'red'

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <PageHeader
        title={`${t('dashboard.welcome')}, ${user?.name?.split(' ')[0] || ''}`}
        subtitle={t('dashboard.subtitle')}
      />

      {isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={refetch}
          className="py-10"
        />
      )}

      {!isError && (
        <>
          {/* Row 1 — summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard
              label={t('dashboard.arOutstanding')}
              value={arap ? formatCurrency(arap.arOutstanding, currency) : '—'}
              icon={FileText}
              accent="blue"
              isLoading={isLoading}
              onClick={() => navigate(ROUTES.INVOICES)}
            />
            <SummaryCard
              label={t('dashboard.apOutstanding')}
              value={arap ? formatCurrency(arap.apOutstanding, currency) : '—'}
              icon={Receipt}
              accent="orange"
              isLoading={isLoading}
              onClick={() => navigate(ROUTES.BILLS)}
            />
            <SummaryCard
              label={t('dashboard.netIncome')}
              value={financials ? formatCurrency(financials.netIncome, currency) : '—'}
              icon={TrendingUp}
              accent={netIncomeAccent}
              isLoading={isLoading}
            />
            <SummaryCard
              label={t('dashboard.overdueInvoices')}
              value={arap != null ? String(arap.overdueInvoices) : '—'}
              icon={AlertCircle}
              accent={arap?.overdueInvoices > 0 ? 'red' : 'default'}
              isLoading={isLoading}
              onClick={() => navigate(ROUTES.INVOICES)}
            />
          </div>

          {/* Row 2 — recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentInvoices
              invoices={activity?.recentInvoices}
              currency={currency}
              isLoading={isLoading}
            />
            <RecentBills
              bills={activity?.recentBills}
              currency={currency}
              isLoading={isLoading}
            />
          </div>

          {/* Row 3 — quick actions */}
          <QuickActions />
        </>
      )}
    </div>
  )
}
