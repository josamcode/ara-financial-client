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
import { Select } from '@/shared/components/Select'
import { SlidePanel } from '@/shared/components/SlidePanel'
import { CurrencyForm } from '@/features/currency/components/CurrencyForm'
import {
  useCreateCurrency,
  useCurrencyList,
  useSetCurrencyActiveStatus,
  useUpdateCurrency,
} from '@/features/currency/hooks/useCurrencies'
import { useAuth } from '@/entities/auth/model/useAuth'
import { PERMISSIONS, hasPermission } from '@/shared/constants/permissions'

function formatNumber(value, language) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return number.toLocaleString(language, { maximumFractionDigits: 0 })
}

export default function CurrenciesPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [status, setStatus] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)

  const canManage = hasPermission(user, PERMISSIONS.CURRENCY_MANAGE)

  const queryParams = useMemo(
    () => ({
      isActive: status || undefined,
    }),
    [status]
  )

  const currenciesQuery = useCurrencyList(queryParams)
  const createMutation = useCreateCurrency()
  const updateMutation = useUpdateCurrency()
  const statusMutation = useSetCurrencyActiveStatus()

  const currencies = currenciesQuery.data ?? []
  const hasFilters = Boolean(status)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const createAction = canManage ? (
    <Button onClick={openCreate}>
      <Plus size={16} />
      {t('currencies.new')}
    </Button>
  ) : null

  function openCreate() {
    setEditTarget(null)
    setPanelOpen(true)
  }

  function openEdit(currency) {
    setEditTarget(currency)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setEditTarget(null)
  }

  function handleStatusChange(nextStatus) {
    setStatus(nextStatus)
  }

  function clearFilters() {
    setStatus('')
  }

  async function handleFormSubmit(formData) {
    if (editTarget) {
      await updateMutation.mutateAsync({
        code: editTarget.code,
        data: editTarget.isDefault ? { ...formData, isActive: true } : formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
    closePanel()
  }

  async function handleActivate(currency) {
    await statusMutation.mutateAsync({ code: currency.code, isActive: true })
  }

  async function handleDeactivateConfirm() {
    if (!deactivateTarget || deactivateTarget.isDefault) return
    await statusMutation.mutateAsync({ code: deactivateTarget.code, isActive: false })
    setDeactivateTarget(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('currencies.title')}
        subtitle={t('currencies.subtitle')}
        actions={createAction}
      />

      <div className="filter-bar">
        <div className="w-full sm:w-40">
          <Select
            value={status}
            onChange={handleStatusChange}
            options={[
              { value: '', label: t('currencies.allStatuses') },
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

      {currenciesQuery.isLoading ? (
        <LoadingState message={t('common.loading')} />
      ) : currenciesQuery.isError ? (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => currenciesQuery.refetch()}
        />
      ) : currencies.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border">
          <EmptyState
            icon={Coins}
            title={hasFilters ? t('common.noResults') : t('currencies.emptyTitle')}
            message={hasFilters ? t('currencies.emptySearchDesc') : t('currencies.emptyDesc')}
            actions={canManage && !hasFilters ? createAction : null}
          />
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 text-start w-28">{t('currencies.code')}</th>
                  <th className="px-4 py-3 text-start">{t('currencies.name')}</th>
                  <th className="px-4 py-3 text-start w-28">{t('currencies.symbol')}</th>
                  <th className="px-4 py-3 text-start w-36">{t('currencies.decimalPlaces')}</th>
                  <th className="px-4 py-3 text-start w-32">{t('currencies.baseStatus')}</th>
                  <th className="px-4 py-3 text-start w-32">{t('common.status')}</th>
                  <th className="px-4 py-3 text-end w-28">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currencies.map((currency) => {
                  const canDeactivate = canManage && currency.isActive && !currency.isDefault

                  return (
                    <tr key={currency._id ?? currency.code} className="transition-colors hover:bg-surface-subtle">
                      <td className="px-4 py-3 align-top font-semibold text-text-primary">
                        {currency.code || '-'}
                      </td>
                      <td className="px-4 py-3 align-top text-text-secondary">
                        <div>
                          <p className="font-medium text-text-primary">{currency.name || '-'}</p>
                          {currency.isDefault && (
                            <p className="mt-1 text-xs text-text-muted">
                              {t('currencies.defaultReadOnlyHint', { code: currency.code })}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-text-secondary">
                        {currency.symbol || '-'}
                      </td>
                      <td className="px-4 py-3 align-top tabular-nums text-text-secondary">
                        {formatNumber(currency.decimalPlaces, i18n.language)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {currency.isDefault ? (
                          <Badge variant="primary" size="sm">
                            {t('currencies.baseCurrency')}
                          </Badge>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge variant={currency.isActive ? 'success' : 'default'} size="sm">
                          {currency.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1">
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(currency)}
                                className="rounded p-1.5 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
                                title={t('common.edit')}
                              >
                                <Pencil size={13} />
                              </button>
                              {canDeactivate ? (
                                <button
                                  type="button"
                                  onClick={() => setDeactivateTarget(currency)}
                                  className="rounded p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                                  title={t('currencies.deactivate')}
                                >
                                  <Trash2 size={13} />
                                </button>
                              ) : null}
                              {!currency.isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleActivate(currency)}
                                  className="rounded p-1.5 text-text-muted transition-colors hover:bg-success/10 hover:text-success"
                                  title={t('currencies.activate')}
                                  disabled={statusMutation.isPending}
                                >
                                  <CheckCircle2 size={13} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <SlidePanel
        open={panelOpen}
        onClose={closePanel}
        title={editTarget ? t('currencies.edit') : t('currencies.new')}
        width="md"
      >
        <CurrencyForm
          defaultValues={editTarget ?? undefined}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={closePanel}
        />
      </SlidePanel>

      <ConfirmDialog
        open={!!deactivateTarget}
        title={t('currencies.deactivateTitle')}
        message={t('currencies.deactivateMessage', { code: deactivateTarget?.code })}
        confirmLabel={t('currencies.deactivate')}
        confirmVariant="danger"
        isLoading={statusMutation.isPending}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
