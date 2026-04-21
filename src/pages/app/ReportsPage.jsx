import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Scale, TrendingUp, Building2, Waves, Clock3 } from 'lucide-react'
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
]

export default function ReportsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('reports.title')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_CARDS.map(({ key, route, icon: Icon, subtitleKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(route)}
            className="text-start bg-surface rounded-lg border border-border p-5 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">
                  {t(`reports.${key}`)}
                </h3>
                <p className="text-sm text-text-secondary">{t(subtitleKey)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
