import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Scale, TrendingUp, Building2, Waves, Clock3, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { ROUTES } from '@/shared/constants/routes'

const REPORT_CARDS = [
  {
    key: 'trialBalance',
    route: ROUTES.REPORTS_TRIAL_BALANCE,
    icon: Scale,
    subtitleKey: 'reports.trialBalanceSubtitle',
  },
  {
    key: 'incomeStatement',
    route: ROUTES.REPORTS_INCOME_STATEMENT,
    icon: TrendingUp,
    subtitleKey: 'reports.incomeStatementSubtitle',
  },
  {
    key: 'balanceSheet',
    route: ROUTES.REPORTS_BALANCE_SHEET,
    icon: Building2,
    subtitleKey: 'reports.balanceSheetSubtitle',
  },
  {
    key: 'cashFlow',
    route: ROUTES.REPORTS_CASH_FLOW,
    icon: Waves,
    subtitleKey: 'reports.cashFlowSubtitle',
  },
  {
    key: 'arAging',
    route: ROUTES.REPORTS_AR_AGING,
    icon: Clock3,
    subtitleKey: 'reports.arAgingSubtitle',
  },
  {
    key: 'apAging',
    route: ROUTES.REPORTS_AP_AGING,
    icon: Clock3,
    subtitleKey: 'reports.apAgingSubtitle',
  },
]

export default function ReportsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('reports.title')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORT_CARDS.map(({ key, route, icon: Icon, subtitleKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(route)}
            className="text-start bg-surface rounded-lg border border-border p-5 hover:border-primary hover:shadow-elevated transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary mb-1">
                  {t(`reports.${key}`)}
                </h3>
                <p className="text-sm text-text-secondary leading-snug">{t(subtitleKey)}</p>
              </div>
              <ChevronRight
                size={15}
                className="text-text-muted shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
