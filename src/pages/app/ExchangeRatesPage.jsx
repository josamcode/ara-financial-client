import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Coins, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { Select } from '@/shared/components/Select'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { useAuth } from '@/entities/auth/model/useAuth'
import { ExchangeRateForm } from '@/features/exchangeRate/components/ExchangeRateForm'
import {
  useCreateExchangeRate,
  useDeleteExchangeRate,
  useExchangeRateList,
  useUpdateExchangeRate,
} from '@/features/exchangeRate/hooks/useExchangeRate'
import { useCurrencies } from '@/features/currency/hooks/useCurrencies'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'
import { formatDate } from '@/shared/utils/formatters'

const PAGE_SIZE = 20

function normalizeCurrencyList(response) {
  const payload = response ?? {}
  const data = payload.data ?? payload

  if (Array.isArray(data)) return data

  return data.currencies ?? data.items ?? data.data?.currencies ?? []
}

function formatRate(value) {
  if (value == null || value === '') return '-'
  return String(value)
}

function getSourceLabel(source, t) {
  return t(`exchangeRates.sources.${source}`, { defaultValue: source || '-' })
}

export default function ExchangeRatesPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [fromCurrency, setFromCurrency] = useState('')
  const [toCurrency, setToCurrency] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  const canManage = hasPermission(user, PERMISSIONS.EXCHANGE_RATE_MANAGE)

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      from: fromCurrency || undefined,
      to: toCurrency || undefined,
      source: source || undefined,
      isActive: status || undefined,
    }),
    [fromCurrency, page, source, status, toCurrency]
  )

  const ratesQuery = useExchangeRateList(queryParams)
  const currenciesQuery = useCurrencies({ isActive: true })
  const createMutation = useCreateExchangeRate()
  const updateMutation = useUpdateExchangeRate()
  const deactivateMutation = useDeleteExchangeRate()

  const exchangeRates = ratesQuery.data?.exchangeRates ?? []
  const pagination = ratesQuery.data?.pagination ?? null
  const currencies = normalizeCurrencyList(currenciesQuery.data)
  const hasSar = currencies.some((currency) => currency.code === 'SAR')
  const currencyOptions = [
    { value: '', label: t('exchangeRates.allCurrencies') },
    ...(hasSar ? [] : [{ value: 'SAR', label: 'SAR' }]),
    ...currencies.map((currency) => ({
      value: currency.code,
      label: `${currency.code} - ${currency.name}`,
    })),
  ]

  function openCreate() {
    setEditTarget(null)
    setPanelOpen(true)
  }

  function openEdit(rate) {
    setEditTarget(rate)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditTarget(null)
  }

  function handleFilterChange(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  function clearFilters() {
    setFromCurrency('')
    setToCurrency('')
    setSource('')
    setStatus('')
    setPage(1)
  }

  async function handleFormSubmit(formData) {
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget._id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }

    closePanel()
  }

  async function handleActivate(rate) {
    await updateMutation.mutateAsync({ id: rate._id, data: { isActive: true } })
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget) return
    await deactivateMutation.mutateAsync(deactivateTarget._id)
    setDeactivateTarget(null)
  }

  const createAction = canManage ? (
    <Button onClick={openCreate}>
      <Plus size={16} />
      {t('exchangeRates.new')}
    </Button>
  ) : null
  const hasFilters = Boolean(fromCurrency || toCurrency || source || status)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('exchangeRates.title')}
        subtitle={t('exchangeRates.subtitle')}
        actions={createAction}
      />

      <div className="filter-bar">
        <div className="w-full sm:w-44">
          <Select
            value={fromCurrency}
            onChange={handleFilterChange(setFromCurrency)}
            options={currencyOptions}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={toCurrency}
            onChange={handleFilterChange(setToCurrency)}
            options={currencyOptions}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={source}
            onChange={handleFilterChange(setSource)}
            options={[
              { value: '', label: t('exchangeRates.allSources') },
              { value: 'manual', label: t('exchangeRates.sources.manual') },
              { value: 'api', label: t('exchangeRates.sources.api') },
              { value: 'central_bank', label: t('exchangeRates.sources.central_bank') },
              { value: 'company_rate', label: t('exchangeRates.sources.company_rate') },
            ]}
          />
        </div>

        <div className="w-full sm:w-40">
          <Select
            value={status}
            onChange={handleFilterChange(setStatus)}
            options={[
              { value: '', label: t('exchangeRates.allStatuses') },
              { value: 'true', label: t('common.active') },
              { value: 'false', label: t('common.inactive') },
            ]}
          />
        </div>

        {hasFilters && (
          <Button type="button" variant="secondary" onClick={clearFilters}>
            {t('common.clear')}
          </Button>
        )}
      </div>

      {ratesQuery.isLoading ? (
        <LoadingState message={t('common.loading')} />
      ) : ratesQuery.isError ? (
        <ErrorState title={t('common.somethingWentWrong')} onRetry={() => ratesQuery.refetch()} />
      ) : exchangeRates.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border">
          <EmptyState
            icon={Coins}
            title={hasFilters ? t('common.noResults') : t('exchangeRates.emptyTitle')}
            message={hasFilters ? t('exchangeRates.emptySearchDesc') : t('exchangeRates.emptyDesc')}
            actions={canManage && !hasFilters ? createAction : null}
          />
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 text-start">{t('exchangeRates.fromCurrency')}</th>
                  <th className="px-4 py-3 text-start">{t('exchangeRates.toCurrency')}</th>
                  <th className="px-4 py-3 text-start w-40">{t('exchangeRates.rate')}</th>
                  <th className="px-4 py-3 text-start w-40">{t('exchangeRates.effectiveDate')}</th>
                  <th className="px-4 py-3 text-start w-40">{t('exchangeRates.source')}</th>
                  <th className="px-4 py-3 text-start w-32">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end w-28">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exchangeRates.map((rate) => (
                  <tr key={rate._id} className="transition-colors hover:bg-surface-subtle">
                    <td className="px-4 py-3 align-top font-semibold text-text-primary">
                      {rate.fromCurrency || '-'}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      {rate.toCurrency || '-'}
                    </td>
                    <td className="px-4 py-3 align-top font-medium tabular-nums text-text-primary">
                      {formatRate(rate.rate)}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      {rate.effectiveDate ? formatDate(rate.effectiveDate, i18n.language) : '-'}
                    </td>
                    <td className="px-4 py-3 align-top text-text-secondary">
                      <div>
                        <p>{getSourceLabel(rate.source, t)}</p>
                        {rate.provider && (
                          <p className="mt-1 text-xs text-text-muted">{rate.provider}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={rate.isActive ? 'success' : 'default'} size="sm">
                        {rate.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-1">
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(rate)}
                              className="rounded p-1.5 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                              title={t('common.edit')}
                            >
                              <Pencil size={13} />
                            </button>
                            {rate.isActive ? (
                              <button
                                type="button"
                                onClick={() => setDeactivateTarget(rate)}
                                className="rounded p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                                title={t('exchangeRates.deactivate')}
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActivate(rate)}
                                className="rounded p-1.5 text-text-muted transition-colors hover:bg-success/10 hover:text-success"
                                title={t('exchangeRates.activate')}
                                disabled={updateMutation.isPending}
                              >
                                <CheckCircle2 size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={(nextPage) => setPage(nextPage)}
            className="px-4 border-t border-border"
          />
        </Card>
      )}

      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title={editTarget ? t('exchangeRates.edit') : t('exchangeRates.new')}
        width="md"
      >
        <ExchangeRateForm
          defaultValues={editTarget ?? undefined}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={closePanel}
        />
      </SlidePanel>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={t('exchangeRates.deleteTitle')}
        message={t('exchangeRates.deleteMessage', {
          pair: deactivateTarget
            ? `${deactivateTarget.fromCurrency}/${deactivateTarget.toCurrency}`
            : '',
        })}
        confirmLabel={t('exchangeRates.deactivate')}
        confirmVariant="danger"
        isLoading={deactivateMutation.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
