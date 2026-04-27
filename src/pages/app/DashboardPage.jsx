import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
  BookOpen,
  BarChart2,
  ChevronRight,
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
import { cn } from '@/shared/utils/cn'

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

// ─── KPI card ─────────────────────────────────────────────────────────────────

const ACCENT = {
  blue:    { wrap: 'bg-info-soft',    icon: 'text-info' },
  orange:  { wrap: 'bg-warning-soft', icon: 'text-warning' },
  green:   { wrap: 'bg-success-soft', icon: 'text-success' },
  red:     { wrap: 'bg-error-soft',   icon: 'text-error' },
  default: { wrap: 'bg-primary-50',   icon: 'text-primary' },
}

function SummaryCard({ label, value, icon: Icon, accent = 'default', subtext, onClick, isLoading }) {
  if (isLoading) return <LoadingCard />

  const a = ACCENT[accent] ?? ACCENT.default

  return (
    <Card
      padding="md"
      className={cn(
        'flex flex-col gap-4',
        onClick && 'cursor-pointer hover:shadow-elevated transition-shadow'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-text-secondary leading-snug">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg shrink-0 flex items-center justify-center', a.wrap)}>
          <Icon size={16} className={a.icon} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-text-primary tabular-nums leading-none">{value}</p>
          {subtext && <p className="text-xs text-text-muted mt-1.5">{subtext}</p>}
        </div>
        {onClick && (
          <ChevronRight size={14} className="text-text-muted shrink-0 rtl:rotate-180 mb-0.5" />
        )}
      </div>
    </Card>
  )
}

// ─── Insights ─────────────────────────────────────────────────────────────────

const INSIGHT_STYLES = {
  info: {
    panel: 'border-blue-200 bg-blue-50/80',
    iconWrap: 'bg-blue-100 text-blue-700',
    title: 'text-blue-900',
    description: 'text-blue-700',
  },
  success: {
    panel: 'border-green-200 bg-green-50/80',
    iconWrap: 'bg-green-100 text-green-700',
    title: 'text-green-900',
    description: 'text-green-700',
  },
  warning: {
    panel: 'border-amber-200 bg-amber-50/80',
    iconWrap: 'bg-amber-100 text-amber-700',
    title: 'text-amber-900',
    description: 'text-amber-700',
  },
  danger: {
    panel: 'border-red-200 bg-red-50/80',
    iconWrap: 'bg-red-100 text-red-700',
    title: 'text-red-900',
    description: 'text-red-700',
  },
}

const INSIGHT_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  danger: AlertCircle,
}

const DASHBOARD_TARGETS = {
  overdueInvoices: `${ROUTES.INVOICES}?status=overdue`,
  overdueBills: `${ROUTES.BILLS}?status=overdue`,
  incomeStatement: ROUTES.REPORTS_INCOME_STATEMENT,
}

function getInsightContent(insight, t, currency) {
  switch (insight.id) {
    case 'overdue_invoices':
      return { title: t('dashboard.insights.items.overdueInvoices.title'), description: t('dashboard.insights.items.overdueInvoices.description', { count: insight.count }) }
    case 'no_overdue_invoices':
      return { title: t('dashboard.insights.items.noOverdueInvoices.title'), description: t('dashboard.insights.items.noOverdueInvoices.description') }
    case 'overdue_bills':
      return { title: t('dashboard.insights.items.overdueBills.title'), description: t('dashboard.insights.items.overdueBills.description', { count: insight.count }) }
    case 'no_overdue_bills':
      return { title: t('dashboard.insights.items.noOverdueBills.title'), description: t('dashboard.insights.items.noOverdueBills.description') }
    case 'top_customer_outstanding':
      return { title: t('dashboard.insights.items.topCustomerOutstanding.title'), description: t('dashboard.insights.items.topCustomerOutstanding.description', { name: insight.customerName, amount: formatCurrency(insight.amount, currency) }) }
    case 'top_supplier_payable':
      return { title: t('dashboard.insights.items.topSupplierPayable.title'), description: t('dashboard.insights.items.topSupplierPayable.description', { name: insight.supplierName, amount: formatCurrency(insight.amount, currency) }) }
    case 'net_income_positive':
      return { title: t('dashboard.insights.items.netIncomePositive.title'), description: t('dashboard.insights.items.netIncomePositive.description', { amount: formatCurrency(insight.amount, currency) }) }
    case 'net_income_negative':
      return { title: t('dashboard.insights.items.netIncomeNegative.title'), description: t('dashboard.insights.items.netIncomeNegative.description', { amount: formatCurrency(insight.amount, currency) }) }
    case 'net_income_neutral':
      return { title: t('dashboard.insights.items.netIncomeNeutral.title'), description: t('dashboard.insights.items.netIncomeNeutral.description') }
    default:
      return null
  }
}

function buildStatementInsightHref(href, basePath, buildStatementRoute) {
  if (!href) return basePath
  const detailPrefix = `${basePath}/`
  if (!href.startsWith(detailPrefix)) return href
  const entityId = href.slice(detailPrefix.length).split('/')[0]
  return entityId ? buildStatementRoute(entityId) : href
}

function getInsightHref(insight) {
  switch (insight.id) {
    case 'overdue_invoices': return DASHBOARD_TARGETS.overdueInvoices
    case 'overdue_bills': return DASHBOARD_TARGETS.overdueBills
    case 'top_customer_outstanding': return buildStatementInsightHref(insight.href, ROUTES.CUSTOMERS, ROUTES.CUSTOMER_STATEMENT)
    case 'top_supplier_payable': return buildStatementInsightHref(insight.href, ROUTES.SUPPLIERS, ROUTES.SUPPLIER_STATEMENT)
    case 'net_income_positive':
    case 'net_income_negative':
    case 'net_income_neutral': return DASHBOARD_TARGETS.incomeStatement
    default: return insight.href
  }
}

function DashboardInsights({ insights, currency, isLoading }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const resolvedInsights = Array.isArray(insights)
    ? insights.map((insight) => ({ insight, content: getInsightContent(insight, t, currency) })).filter(({ content }) => content != null)
    : []

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.insights.title')}</h3>
      </div>

      {isLoading && <LoadingRows count={4} />}

      {!isLoading && resolvedInsights.length === 0 && (
        <p className="py-4 text-center text-sm text-text-secondary">{t('common.noData')}</p>
      )}

      {!isLoading && resolvedInsights.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {resolvedInsights.map(({ insight, content }) => {
            const href = getInsightHref(insight)
            const styles = INSIGHT_STYLES[insight.tone] ?? INSIGHT_STYLES.info
            const Icon = INSIGHT_ICONS[insight.tone] ?? INSIGHT_ICONS.info
            const panelClassName = cn(
              'w-full rounded-lg border px-4 py-3 text-start transition-shadow',
              styles.panel,
              href && 'cursor-pointer hover:shadow-sm'
            )

            const body = (
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5 flex h-8 w-8 items-center justify-center rounded-full shrink-0', styles.iconWrap)}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', styles.title)}>{content.title}</p>
                  <p className={cn('mt-0.5 text-xs leading-relaxed', styles.description)}>{content.description}</p>
                </div>
                {href && <ChevronRight size={14} className="mt-1 shrink-0 text-text-muted rtl:rotate-180" />}
              </div>
            )

            if (href) {
              return (
                <button key={insight.id} type="button" className={panelClassName} onClick={() => navigate(href)}>
                  {body}
                </button>
              )
            }
            return <div key={insight.id} className={panelClassName}>{body}</div>
          })}
        </div>
      )}
    </Card>
  )
}

// ─── Recent invoices ──────────────────────────────────────────────────────────

function RecentInvoices({ invoices, currency, isLoading }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card padding="none">
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.recentInvoices')}</h3>
        <button onClick={() => navigate(ROUTES.INVOICES)} className="text-xs font-medium text-primary hover:underline">
          {t('dashboard.viewAll')}
        </button>
      </div>

      {isLoading && <div className="p-4"><LoadingRows count={4} /></div>}

      {!isLoading && (!invoices || invoices.length === 0) && (
        <p className="py-8 text-center text-sm text-text-secondary">{t('common.noData')}</p>
      )}

      {!isLoading && invoices && invoices.length > 0 && (
        <>
          <div className="hidden sm:grid grid-cols-[1fr_5rem_6rem] items-center gap-3 px-5 py-2 bg-surface-muted border-b border-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('invoices.customer')}</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-end">{t('common.total')}</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-end">{t('common.status')}</span>
          </div>
          <ul className="divide-y divide-border">
            {invoices.map((inv) => (
              <li
                key={inv._id}
                className="px-5 py-3 hover:bg-surface-muted transition-colors cursor-pointer"
                onClick={() => navigate(ROUTES.INVOICE_DETAIL(inv._id))}
              >
                <div className="flex items-center justify-between gap-3 sm:grid sm:grid-cols-[1fr_5rem_6rem]">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{inv.customerName}</p>
                    <p className="text-xs text-text-muted mt-0.5">{inv.invoiceNumber}</p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary tabular-nums text-end shrink-0">
                    {formatCurrency(inv.total, currency)}
                  </p>
                  <div className="hidden sm:flex justify-end">
                    <StatusPill status={inv.status} ns="invoices" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
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
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.recentBills')}</h3>
        <button onClick={() => navigate(ROUTES.BILLS)} className="text-xs font-medium text-primary hover:underline">
          {t('dashboard.viewAll')}
        </button>
      </div>

      {isLoading && <div className="p-4"><LoadingRows count={4} /></div>}

      {!isLoading && (!bills || bills.length === 0) && (
        <p className="py-8 text-center text-sm text-text-secondary">{t('common.noData')}</p>
      )}

      {!isLoading && bills && bills.length > 0 && (
        <>
          <div className="hidden sm:grid grid-cols-[1fr_5rem_6rem] items-center gap-3 px-5 py-2 bg-surface-muted border-b border-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{t('bills.supplier')}</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-end">{t('common.total')}</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide text-end">{t('common.status')}</span>
          </div>
          <ul className="divide-y divide-border">
            {bills.map((bill) => (
              <li
                key={bill._id}
                className="px-5 py-3 hover:bg-surface-muted transition-colors cursor-pointer"
                onClick={() => navigate(ROUTES.BILL_DETAIL(bill._id))}
              >
                <div className="flex items-center justify-between gap-3 sm:grid sm:grid-cols-[1fr_5rem_6rem]">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{bill.supplierName}</p>
                    <p className="text-xs text-text-muted mt-0.5">{bill.billNumber}</p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary tabular-nums text-end shrink-0">
                    {formatCurrency(bill.total, currency)}
                  </p>
                  <div className="hidden sm:flex justify-end">
                    <StatusPill status={bill.status} ns="bills" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
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
    <Card padding="none">
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">{t('dashboard.quickActions')}</h3>
      </div>
      <div className="px-5 py-4 flex flex-wrap items-center gap-2">
        {primary.map(({ label, icon: Icon, to }) => (
          <Button key={to} size="sm" onClick={() => navigate(to)}>
            <Plus size={13} />
            {label}
          </Button>
        ))}
        <div className="h-5 w-px bg-border mx-1" />
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
  const insights = data?.data?.insights
  const currency = user?.tenant?.baseCurrency || 'SAR'

  const netIncomeNum = financials ? Number(financials.netIncome) : null
  const netIncomeAccent = netIncomeNum === null ? 'default' : netIncomeNum >= 0 ? 'green' : 'red'

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <PageHeader
        title={`${t('dashboard.welcome')}, ${user?.name?.split(' ')[0] || ''}`}
        subtitle={t('dashboard.subtitle')}
      />

      {isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={refetch}
          compact
        />
      )}

      {!isError && (
        <>
          {/* Row 1 — KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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
              subtext={financials ? t('dashboard.ytd') : undefined}
              isLoading={isLoading}
              onClick={() => navigate(DASHBOARD_TARGETS.incomeStatement)}
            />
            <SummaryCard
              label={t('dashboard.overdueInvoices')}
              value={arap != null ? String(arap.overdueInvoices) : '—'}
              icon={AlertCircle}
              accent={arap?.overdueInvoices > 0 ? 'red' : 'default'}
              subtext={arap != null ? (arap.overdueInvoices > 0 ? t('dashboard.needsAttention') : t('dashboard.allCurrent')) : undefined}
              isLoading={isLoading}
              onClick={() => navigate(DASHBOARD_TARGETS.overdueInvoices)}
            />
          </div>

          {/* Row 2 — insights */}
          <DashboardInsights insights={insights} currency={currency} isLoading={isLoading} />

          {/* Row 3 — recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentInvoices invoices={activity?.recentInvoices} currency={currency} isLoading={isLoading} />
            <RecentBills bills={activity?.recentBills} currency={currency} isLoading={isLoading} />
          </div>

          {/* Row 4 — quick actions */}
          <QuickActions />
        </>
      )}
    </div>
  )
}
