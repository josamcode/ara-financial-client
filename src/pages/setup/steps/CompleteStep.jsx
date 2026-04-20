import { useTranslation } from 'react-i18next'
import { BookOpen, Building2, CalendarRange, Coins, Users } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { CURRENCIES } from '@/shared/constants/app'
import { buildInvitationAcceptUrl } from '@/pages/setup/utils/invitationUrl'

const INDUSTRY_LABELS = {
  general: { ar: 'عام', en: 'General' },
  retail: { ar: 'تجزئة', en: 'Retail' },
  manufacturing: { ar: 'تصنيع', en: 'Manufacturing' },
  services: { ar: 'خدمات', en: 'Services' },
  construction: { ar: 'مقاولات', en: 'Construction' },
  healthcare: { ar: 'رعاية صحية', en: 'Healthcare' },
  education: { ar: 'تعليم', en: 'Education' },
  hospitality: { ar: 'ضيافة', en: 'Hospitality' },
}

function SummaryRow({ label, value, hint }) {
  return (
    <div className="rounded-md border border-border bg-surface-subtle px-3 py-2.5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm text-text-primary mt-1">{value}</p>
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
}

function formatMonthLabel(month, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
  }).format(new Date(Date.UTC(2024, month - 1, 1)))
}

export default function CompleteStep({
  data,
  currencyCode = 'EGP',
  onBack,
  onComplete,
  isCompleting = false,
}) {
  const { t, i18n } = useTranslation()
  const companyInfo = data?.companyInfo || {}
  const chartOfAccounts = data?.chartOfAccounts || {}
  const fiscalYear = data?.fiscalYear || {}
  const inviteTeam = data?.inviteTeam || {}
  const invited = inviteTeam.invited || []
  const industryLabel =
    INDUSTRY_LABELS[companyInfo.industry]?.[i18n.language === 'ar' ? 'ar' : 'en'] ||
    companyInfo.industry
  const currency = CURRENCIES.find((item) => item.code === currencyCode)
  const currencyLabel =
    i18n.language === 'ar'
      ? currency?.label || currencyCode
      : currency?.labelEn || currency?.label || currencyCode

  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        {t('setup.stepComplete')}
      </h2>
      <p className="text-sm text-text-secondary mb-2">{t('setup.completeDescription')}</p>
      <p className="text-xs text-text-muted mb-6">{t('setup.reviewBeforeComplete')}</p>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {t('setup.stepCompanyInfo')}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SummaryRow
                  label={t('setup.companyName')}
                  value={companyInfo.name || '-'}
                />
                <SummaryRow
                  label={t('setup.fiscalYearStartMonth')}
                  value={formatMonthLabel(
                    companyInfo.fiscalYearStartMonth || 1,
                    i18n.language
                  )}
                />
                {companyInfo.legalName ? (
                  <SummaryRow
                    label={t('setup.legalName')}
                    value={companyInfo.legalName}
                  />
                ) : null}
                {companyInfo.taxId ? (
                  <SummaryRow label={t('setup.taxId')} value={companyInfo.taxId} />
                ) : null}
                {companyInfo.industry ? (
                  <SummaryRow label={t('setup.industry')} value={industryLabel} />
                ) : null}
                <SummaryRow
                  label={t('setup.currency')}
                  value={`${currencyCode} - ${currencyLabel}`}
                  hint={t('setup.currencyDisplayOnlyHint')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {t('setup.stepChartOfAccounts')}
              </p>
              <p className="text-sm text-text-primary mt-3">
                {chartOfAccounts.applied
                  ? t('setup.egyptianTemplate')
                  : t('setup.skipped')}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {chartOfAccounts.applied && chartOfAccounts.alreadyExisted
                  ? t('setup.alreadyApplied')
                  : t('setup.onlyAvailableTemplate')}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarRange size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {t('setup.stepFiscalYear')}
              </p>
              {fiscalYear.created ? (
                <>
                  <p className="text-sm text-text-primary mt-3">{fiscalYear.year}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {formatMonthLabel(fiscalYear.startMonth || 1, i18n.language)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-text-primary mt-3">{t('setup.skipped')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {t('setup.stepInviteTeam')}
              </p>
              {invited.length > 0 ? (
                <>
                  <p className="text-sm text-text-primary mt-3">
                    {t('setup.inviteCount', { count: invited.length })}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {t('setup.inviteManualShareHint')}
                  </p>
                  <div className="mt-3 space-y-2">
                    {invited.map((invite) => {
                      const acceptUrl = buildInvitationAcceptUrl(invite)

                      return (
                        <div
                          key={`${invite.email}-${invite.roleName}`}
                          className="rounded-md border border-border bg-surface-subtle px-3 py-2.5 text-sm"
                        >
                          <p className="font-medium text-text-primary">{invite.name}</p>
                          <p className="text-text-muted mt-0.5">{invite.email}</p>
                          {acceptUrl ? (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-text-primary">
                                {t('setup.invitationLink')}
                              </p>
                              <a
                                href={acceptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary break-all hover:underline"
                              >
                                {acceptUrl}
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted mt-2">
                              {t('setup.invitationLinkUnavailable')}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-text-primary mt-3">{t('setup.noInvitesSent')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Coins size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{t('setup.currency')}</p>
            <p className="text-xs text-text-muted mt-1">{t('setup.currencyDisplayOnlyHint')}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border mt-6 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          {t('common.back')}
        </button>
        <Button type="button" onClick={onComplete} isLoading={isCompleting}>
          {t('setup.completeSetup')}
        </Button>
      </div>
    </Card>
  )
}
