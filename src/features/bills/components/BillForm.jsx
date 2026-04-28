import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { useAllSuppliers } from '@/features/suppliers/hooks/useSuppliers'
import { useAuth } from '@/entities/auth/model/useAuth'
import { useCurrencies } from '@/features/currency/hooks/useCurrencies'
import { CurrencyPanel } from '@/features/multiCurrency/components/CurrencyPanel'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const DEFAULT_LINE = { description: '', quantity: '1', unitPrice: '0', lineTotal: '0' }

export function BillForm({ defaultValues, onSubmit, isSubmitting }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const tenantBaseCurrency = user?.tenant?.baseCurrency ?? 'SAR'

  const { data: suppliersData } = useAllSuppliers()
  const suppliers = suppliersData?.suppliers ?? []

  const { data: currenciesData, isLoading: loadingCurrencies } = useCurrencies({ isActive: true })
  const currencies = currenciesData?.data?.currencies ?? currenciesData?.currencies ?? []

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues ?? {
      supplierId: '',
      supplierName: '',
      supplierEmail: '',
      issueDate: todayISO(),
      dueDate: addDays(30),
      documentCurrency: tenantBaseCurrency,
      exchangeRate: '',
      exchangeRateDate: todayISO(),
      exchangeRateSource: 'manual',
      exchangeRateProvider: '',
      isExchangeRateManualOverride: false,
      notes: '',
      lineItems: [{ ...DEFAULT_LINE }],
      subtotal: '0',
      total: '0',
    },
  })

  const selectedSupplierId = watch('supplierId')
  const supplierOptions = [
    { value: '', label: t('suppliers.selectSupplierPlaceholder') },
    ...suppliers.map((supplier) => ({
      value: supplier._id,
      label: `${supplier.name}${supplier.email ? ` - ${supplier.email}` : ''}`,
    })),
  ]

  function handleSupplierSelect(id) {
    setValue('supplierId', id)
    if (id) {
      const supplier = suppliers.find((item) => item._id === id)
      if (supplier) {
        setValue('supplierName', supplier.name)
        setValue('supplierEmail', supplier.email || '')
      }
      return
    }
    setValue('supplierName', '')
    setValue('supplierEmail', '')
  }

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })
  const lineItems = watch('lineItems')

  function recalculate(items) {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.lineTotal) || 0), 0)
    const value = subtotal.toFixed(2)
    setValue('subtotal', value)
    setValue('total', value)
  }

  function handleLineChange(index, field, value) {
    const items = [...lineItems]
    items[index] = { ...items[index], [field]: value }
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(field === 'quantity' ? value : items[index].quantity) || 0
      const unitPrice = parseFloat(field === 'unitPrice' ? value : items[index].unitPrice) || 0
      items[index].lineTotal = (quantity * unitPrice).toFixed(2)
      setValue(`lineItems.${index}.lineTotal`, items[index].lineTotal)
    }
    recalculate(items)
  }

  function addLine() {
    append({ ...DEFAULT_LINE })
  }

  function removeLine(index) {
    remove(index)
    const remaining = [...lineItems]
    remaining.splice(index, 1)
    recalculate(remaining)
  }

  const documentCurrency = watch('documentCurrency') || tenantBaseCurrency
  const exchangeRate = watch('exchangeRate')
  const exchangeRateDate = watch('exchangeRateDate')
  const exchangeRateSource = watch('exchangeRateSource')
  const isManualOverride = watch('isExchangeRateManualOverride')
  const issueDate = watch('issueDate')
  const subtotal = watch('subtotal')
  const total = watch('total')

  function handleFormSubmit(data) {
    const docCurrency = data.documentCurrency || tenantBaseCurrency
    const isForeign = docCurrency !== tenantBaseCurrency
    if (isForeign && (!data.exchangeRate || Number(data.exchangeRate) <= 0)) {
      setError('exchangeRate', {
        type: 'manual',
        message: t('multiCurrency.exchangeRateRequired'),
      })
      return
    }
    clearErrors('exchangeRate')
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Hidden currency fields managed by CurrencyPanel */}
      <input type="hidden" {...register('documentCurrency')} />
      <input type="hidden" {...register('exchangeRate')} />
      <input type="hidden" {...register('exchangeRateDate')} />
      <input type="hidden" {...register('exchangeRateSource')} />
      <input type="hidden" {...register('exchangeRateProvider')} />
      <input type="hidden" {...register('isExchangeRateManualOverride')} />

      {/* ── Section: Supplier ───────────────────────────────── */}
      <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {t('bills.supplier')}
        </p>
        {suppliers.length > 0 && (
          <Select
            label={t('suppliers.selectSupplier')}
            value={selectedSupplierId || ''}
            onChange={handleSupplierSelect}
            options={supplierOptions}
            searchable
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('bills.supplierName')}
            required
            error={errors.supplierName?.message}
            readOnly={!!selectedSupplierId}
            className={selectedSupplierId ? 'bg-surface-subtle text-text-secondary' : ''}
            {...register('supplierName', { required: t('errors.required') })}
          />
          <Input
            label={t('bills.supplierEmail')}
            type="email"
            error={errors.supplierEmail?.message}
            readOnly={!!selectedSupplierId}
            className={selectedSupplierId ? 'bg-surface-subtle text-text-secondary' : ''}
            {...register('supplierEmail')}
          />
        </div>
        <input type="hidden" {...register('supplierId')} />
      </div>

      {/* ── Section: Dates ──────────────────────────────────── */}
      <div className="bg-surface rounded-lg border border-border p-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          {t('bills.issueDate').replace(/\s.*/, '')} / {t('bills.dueDate')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('bills.issueDate')}
            type="date"
            required
            error={errors.issueDate?.message}
            {...register('issueDate', { required: t('errors.required') })}
          />
          <Input
            label={t('bills.dueDate')}
            type="date"
            required
            error={errors.dueDate?.message}
            {...register('dueDate', { required: t('errors.required') })}
          />
        </div>
      </div>

      {/* ── Section: Currency ───────────────────────────────── */}
      <CurrencyPanel
        documentCurrency={documentCurrency}
        baseCurrency={tenantBaseCurrency}
        exchangeRate={exchangeRate}
        exchangeRateDate={exchangeRateDate}
        exchangeRateSource={exchangeRateSource}
        isManualOverride={Boolean(isManualOverride)}
        issueDate={issueDate}
        subtotal={subtotal}
        total={total}
        currencies={currencies}
        isLoadingCurrencies={loadingCurrencies}
        exchangeRateError={errors.exchangeRate?.message}
        currencyLabel={t('multiCurrency.billCurrency')}
        onCurrencyChange={(code) => setValue('documentCurrency', code)}
        onRateChange={(v) => setValue('exchangeRate', v)}
        onRateDateChange={(v) => setValue('exchangeRateDate', v)}
        onSourceChange={(v) => setValue('exchangeRateSource', v)}
        onManualOverrideChange={(v) => setValue('isExchangeRateManualOverride', v)}
        onProviderChange={(v) => setValue('exchangeRateProvider', v || '')}
      />

      {/* ── Section: Line items ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            {t('bills.lineItems')}
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={addLine}>
            <Plus size={14} />
            {t('bills.addLine')}
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1fr_5rem_6rem_6rem_2.5rem] gap-2 px-3 py-2 bg-surface-muted text-xs font-semibold text-text-muted uppercase tracking-wide border-b border-border">
            <span>{t('common.description')}</span>
            <span className="text-end">{t('bills.qty')}</span>
            <span className="text-end">{t('bills.unitPrice')}</span>
            <span className="text-end">{t('bills.lineTotal')}</span>
            <span />
          </div>

          <div className="divide-y divide-border bg-surface">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_5rem_6rem_6rem_2.5rem] gap-2 px-3 py-2 items-center"
              >
                <input
                  className="h-10 w-full rounded border border-input bg-surface px-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder={t('common.description')}
                  {...register(`lineItems.${index}.description`, { required: true })}
                />
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  className="h-10 w-full rounded border border-input bg-surface px-2.5 text-sm text-end tabular-nums focus:outline-none focus:border-primary"
                  {...register(`lineItems.${index}.quantity`, {
                    onChange: (event) => handleLineChange(index, 'quantity', event.target.value),
                  })}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-10 w-full rounded border border-input bg-surface px-2.5 text-sm text-end tabular-nums focus:outline-none focus:border-primary"
                  {...register(`lineItems.${index}.unitPrice`, {
                    onChange: (event) => handleLineChange(index, 'unitPrice', event.target.value),
                  })}
                />
                <input
                  readOnly
                  className="h-10 w-full rounded border border-input bg-surface-muted px-2.5 text-sm text-end tabular-nums text-text-secondary"
                  {...register(`lineItems.${index}.lineTotal`)}
                />
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="flex items-center justify-center h-10 w-full text-text-muted hover:text-error transition-colors disabled:opacity-40"
                  disabled={fields.length === 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Totals ──────────────────────────────────────────── */}
      <div className="flex justify-end">
        <div className="bg-surface-muted rounded-lg px-4 py-3 w-60 space-y-2 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>{t('bills.subtotal')}</span>
            <span className="font-medium tabular-nums">{subtotal}</span>
          </div>
          <div className="flex justify-between font-bold text-text-primary border-t border-border pt-2">
            <span>{t('bills.total')}</span>
            <span className="tabular-nums">{total}</span>
          </div>
        </div>
      </div>

      {/* ── Notes ───────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">{t('common.notes')}</label>
        <textarea
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          {...register('notes')}
        />
      </div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-border pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
