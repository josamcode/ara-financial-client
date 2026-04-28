import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Button } from '@/shared/components/Button'
import { resolveLatestExchangeRate } from '@/features/exchangeRate/hooks/useExchangeRate'

export function CurrencyPanel({
  documentCurrency,
  baseCurrency,
  exchangeRate,
  exchangeRateDate,
  exchangeRateSource,
  isManualOverride,
  issueDate,
  subtotal,
  total,
  currencies = [],
  isLoadingCurrencies = false,
  exchangeRateError,
  currencyLabel,
  onCurrencyChange,
  onRateChange,
  onRateDateChange,
  onSourceChange,
  onManualOverrideChange,
  onProviderChange,
}) {
  const { t } = useTranslation()
  const [fetchingRate, setFetchingRate] = useState(false)
  const [rateHelperText, setRateHelperText] = useState('')
  const lookupRequestIdRef = useRef(0)

  const isForeign = documentCurrency && baseCurrency && documentCurrency !== baseCurrency

  const currencyOptions = currencies.length > 0
    ? currencies.map((c) => ({
        value: c.code,
        label: c.name ? `${c.code} — ${c.name}` : c.code,
      }))
    : (documentCurrency ? [{ value: documentCurrency, label: documentCurrency }] : [])

  function applyResolvedRate(result) {
    if (!result || result.mode === 'same') return false

    const record = result.record
    const rateValue = result.exchangeRate
    const rateDate = record?.effectiveDate
      ? new Date(record.effectiveDate).toISOString().slice(0, 10)
      : null
    onRateChange(rateValue)
    if (rateDate) onRateDateChange(rateDate)
    onSourceChange(record?.source ?? 'manual')
    onProviderChange(record?.provider ?? null)
    onManualOverrideChange(false)
    setRateHelperText(
      result.mode === 'inverted'
        ? t('multiCurrency.inverseRateHelper', { from: result.from, to: result.to })
        : ''
    )
    return true
  }

  async function loadLatestRate({
    showSuccessToast = false,
    force = false,
    dateOverride = null,
  } = {}) {
    if (!documentCurrency || !baseCurrency) return
    if (!force && isManualOverride) return

    const requestId = lookupRequestIdRef.current + 1
    lookupRequestIdRef.current = requestId
    setRateHelperText('')
    setFetchingRate(true)
    const dateParam = dateOverride
      || issueDate
      || exchangeRateDate
      || new Date().toISOString().slice(0, 10)

    try {
      const result = await resolveLatestExchangeRate({
        documentCurrency,
        baseCurrency,
        date: dateParam,
      })

      if (lookupRequestIdRef.current !== requestId) return

      if (applyResolvedRate(result)) {
        if (showSuccessToast) toast.success(t('multiCurrency.rateLoaded'))
        return
      }
    } catch {
      if (lookupRequestIdRef.current === requestId) {
        toast.error(t('multiCurrency.latestRateNotFound'))
      }
    } finally {
      if (lookupRequestIdRef.current === requestId) setFetchingRate(false)
    }
  }

  useEffect(() => {
    if (!isForeign || isManualOverride) {
      lookupRequestIdRef.current += 1
      setFetchingRate(false)
      if (!isForeign) setRateHelperText('')
      return
    }

    loadLatestRate()
  }, [documentCurrency, baseCurrency, issueDate, isForeign, isManualOverride])

  function handleCurrencyChange(code) {
    lookupRequestIdRef.current += 1
    setRateHelperText('')
    onCurrencyChange(code)
    onManualOverrideChange(false)
  }

  function handleFetchLatestRate() {
    loadLatestRate({ showSuccessToast: true, force: true })
  }

  function handleRateDateChange(value) {
    onRateDateChange(value)
    if (isForeign && !isManualOverride) {
      loadLatestRate({ dateOverride: value })
    }
  }

  const rateNum = parseFloat(exchangeRate) || 0
  const subtotalNum = parseFloat(subtotal) || 0
  const totalNum = parseFloat(total) || 0

  return (
    <div className="rounded-lg border border-border bg-surface-subtle p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label={currencyLabel || t('multiCurrency.invoiceCurrency')}
          value={documentCurrency || ''}
          onChange={handleCurrencyChange}
          options={currencyOptions}
          isLoading={isLoadingCurrencies}
          searchable
        />
        <div>
          <p className="text-sm font-medium text-text-primary mb-1.5">
            {t('multiCurrency.companyBaseCurrency')}
          </p>
          <div className="flex items-center h-input px-3 rounded-md border border-border bg-surface text-sm gap-2">
            <span className="font-mono font-semibold text-text-primary">{baseCurrency || '—'}</span>
            <span className="text-xs text-text-muted">{t('multiCurrency.baseCurrencyHint')}</span>
          </div>
        </div>
      </div>

      {isForeign ? (
        <>
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">
                {t('multiCurrency.exchangeRate')}
              </p>
              {exchangeRateSource && exchangeRateSource !== 'manual' && (
                <span className="text-xs text-text-muted px-2 py-0.5 bg-surface rounded border border-border">
                  {exchangeRateSource}
                </span>
              )}
              {isManualOverride && (
                <span className="text-xs text-text-muted px-2 py-0.5 bg-surface rounded border border-border">
                  {t('multiCurrency.manualOverride')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={`1 ${documentCurrency} = ? ${baseCurrency}`}
                type="number"
                step="0.000001"
                min="0.000001"
                value={exchangeRate || ''}
                onChange={(e) => {
                  lookupRequestIdRef.current += 1
                  onRateChange(e.target.value)
                  onManualOverrideChange(true)
                  onSourceChange('manual')
                  setRateHelperText('')
                }}
                error={exchangeRateError}
                required
              />
              <Input
                label={t('multiCurrency.exchangeRateDate')}
                type="date"
                value={exchangeRateDate || ''}
                onChange={(e) => handleRateDateChange(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleFetchLatestRate}
              isLoading={fetchingRate}
            >
              <RefreshCw size={13} className="me-1.5" />
              {t('multiCurrency.useLatestRate')}
            </Button>
            {rateHelperText && (
              <p className="text-xs text-text-muted">{rateHelperText}</p>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-text-primary mb-3">
              {t('multiCurrency.baseTotals')}
            </p>
            {rateNum > 0 ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">
                    {t('invoices.subtotal')} ({documentCurrency})
                  </p>
                  <p className="font-medium tabular-nums">{subtotalNum.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">
                    {t('invoices.subtotal')} ({baseCurrency})
                  </p>
                  <p className="font-medium tabular-nums">
                    {(subtotalNum * rateNum).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">
                    {t('invoices.total')} ({documentCurrency})
                  </p>
                  <p className="font-semibold tabular-nums">{totalNum.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">
                    {t('invoices.total')} ({baseCurrency})
                  </p>
                  <p className="font-semibold tabular-nums">
                    {(totalNum * rateNum).toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">{t('multiCurrency.previewUnavailable')}</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-xs text-text-muted border-t border-border pt-3">
          {t('multiCurrency.sameCurrencyNoRateNeeded')}
        </p>
      )}
    </div>
  )
}
