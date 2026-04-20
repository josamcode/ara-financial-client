import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import { tenantApi } from '@/entities/tenant/api/tenantApi'
import { ROUTES } from '@/shared/constants/routes'
import { Card } from '@/shared/components/Card'
import { cn } from '@/shared/utils/cn'
import CompanyInfoStep from '@/pages/setup/steps/CompanyInfoStep'
import ChartOfAccountsStep from '@/pages/setup/steps/ChartOfAccountsStep'
import FiscalYearStep from '@/pages/setup/steps/FiscalYearStep'
import InviteTeamStep from '@/pages/setup/steps/InviteTeamStep'
import CompleteStep from '@/pages/setup/steps/CompleteStep'

export default function SetupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, refreshUser, updateUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [setupData, setSetupData] = useState(() => {
    const fiscalYearStartMonth = user?.tenant?.fiscalYearStartMonth || 1

    return {
      companyInfo: {
        name: user?.tenant?.name || '',
        legalName: user?.tenant?.legalName || '',
        taxId: user?.tenant?.taxId || '',
        industry: user?.tenant?.industry || 'general',
        fiscalYearStartMonth,
      },
      chartOfAccounts: {
        applied: false,
        alreadyExisted: false,
        skipped: false,
        count: null,
      },
      fiscalYear: {
        year: new Date().getFullYear(),
        startMonth: fiscalYearStartMonth,
        created: false,
        skipped: false,
      },
      inviteTeam: {
        invited: [],
      },
    }
  })

  const currencyCode = user?.tenant?.baseCurrency || 'EGP'

  const steps = useMemo(
    () => [
      { key: 'companyInfo', label: t('setup.stepCompanyInfo') },
      { key: 'chartOfAccounts', label: t('setup.stepChartOfAccounts') },
      { key: 'fiscalYear', label: t('setup.stepFiscalYear') },
      { key: 'inviteTeam', label: t('setup.stepInviteTeam') },
      { key: 'complete', label: t('setup.stepComplete') },
    ],
    [t]
  )

  function updateStep(stepKey, values, nextStep = currentStep + 1) {
    setSetupData((prev) => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        ...values,
      },
    }))
    setCurrentStep(nextStep)
  }

  async function handleComplete() {
    setIsCompleting(true)

    try {
      await tenantApi.completeSetup()
      const refreshedUser = await refreshUser()

      if (!refreshedUser?.tenant?.isSetupComplete) {
        updateUser({
          tenant: {
            ...(user?.tenant || {}),
            isSetupComplete: true,
            setupCompleted: true,
          },
        })
      }

      toast.success(t('setup.setupComplete'))
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(err?.message || t('common.somethingWentWrong'))
    } finally {
      setIsCompleting(false)
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <CompanyInfoStep
            initialValues={setupData.companyInfo}
            currencyCode={currencyCode}
            onNext={(values) => {
              updateStep('companyInfo', values)
              setSetupData((prev) => ({
                ...prev,
                fiscalYear: {
                  ...prev.fiscalYear,
                  startMonth: values.fiscalYearStartMonth,
                },
              }))
            }}
          />
        )
      case 1:
        return (
          <ChartOfAccountsStep
            initialValues={setupData.chartOfAccounts}
            onBack={() => setCurrentStep(0)}
            onNext={(values) => updateStep('chartOfAccounts', values)}
          />
        )
      case 2:
        return (
          <FiscalYearStep
            initialValues={setupData.fiscalYear}
            defaultStartMonth={setupData.companyInfo.fiscalYearStartMonth}
            onBack={() => setCurrentStep(1)}
            onNext={(values) => updateStep('fiscalYear', values)}
          />
        )
      case 3:
        return (
          <InviteTeamStep
            initialValues={setupData.inviteTeam}
            onBack={() => setCurrentStep(2)}
            onNext={(values) => updateStep('inviteTeam', values)}
          />
        )
      case 4:
        return (
          <CompleteStep
            data={setupData}
            currencyCode={currencyCode}
            onBack={() => setCurrentStep(3)}
            onComplete={handleComplete}
            isCompleting={isCompleting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">{t('setup.title')}</h1>
        <p className="text-sm text-text-secondary mt-2">{t('setup.subtitle')}</p>
      </div>

      <Card padding="sm" className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-2 pb-4">
          <p className="text-xs font-medium text-text-muted">
            {t('setup.progress', { current: currentStep + 1, total: steps.length })}
          </p>
          <p className="text-xs text-text-muted">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </p>
        </div>

        <div className="h-2 rounded-full bg-surface-subtle overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <div
                key={step.key}
                className={cn(
                  'rounded-lg border px-3 py-3 transition-colors',
                  isCurrent
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-surface-subtle'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                      isCompleted || isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-text-muted'
                    )}
                  >
                    {isCompleted ? <CheckCircle2 size={14} /> : index + 1}
                  </div>
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isCurrent ? 'text-text-primary' : 'text-text-secondary'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {renderStep()}
    </div>
  )
}
