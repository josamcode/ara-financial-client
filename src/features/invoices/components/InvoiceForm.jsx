import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const DEFAULT_LINE = { description: '', quantity: '1', unitPrice: '0', lineTotal: '0' }

export function InvoiceForm({ defaultValues, onSubmit, isSubmitting }) {
  const { t } = useTranslation()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues ?? {
      customerName: '',
      customerEmail: '',
      issueDate: todayISO(),
      dueDate: addDays(30),
      currency: 'EGP',
      notes: '',
      lineItems: [{ ...DEFAULT_LINE }],
      subtotal: '0',
      total: '0',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })
  const lineItems = watch('lineItems')

  function recalculate(items) {
    const sub = items.reduce((sum, item) => {
      const lt = parseFloat(item.lineTotal) || 0
      return sum + lt
    }, 0)
    setValue('subtotal', sub.toFixed(2))
    setValue('total', sub.toFixed(2))
  }

  function handleLineChange(index, field, value) {
    const items = [...lineItems]
    items[index] = { ...items[index], [field]: value }
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = parseFloat(field === 'quantity' ? value : items[index].quantity) || 0
      const up = parseFloat(field === 'unitPrice' ? value : items[index].unitPrice) || 0
      items[index].lineTotal = (qty * up).toFixed(2)
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

  const subtotal = watch('subtotal')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('invoices.customerName')}
          required
          error={errors.customerName?.message}
          {...register('customerName', { required: t('errors.required') })}
        />
        <Input
          label={t('invoices.customerEmail')}
          type="email"
          error={errors.customerEmail?.message}
          {...register('customerEmail')}
        />
      </div>

      {/* Dates + currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label={t('invoices.issueDate')}
          type="date"
          required
          error={errors.issueDate?.message}
          {...register('issueDate', { required: t('errors.required') })}
        />
        <Input
          label={t('invoices.dueDate')}
          type="date"
          required
          error={errors.dueDate?.message}
          {...register('dueDate', { required: t('errors.required') })}
        />
        <Input
          label={t('invoices.currency')}
          {...register('currency')}
        />
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">{t('invoices.lineItems')}</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addLine}>
            <Plus size={14} className="me-1" />
            {t('invoices.addLine')}
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_5rem_6rem_6rem_2.5rem] gap-2 px-3 py-2 bg-surface-subtle text-xs font-semibold text-text-muted border-b border-border">
            <span>{t('common.description')}</span>
            <span className="text-end">{t('invoices.qty')}</span>
            <span className="text-end">{t('invoices.unitPrice')}</span>
            <span className="text-end">{t('invoices.lineTotal')}</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_5rem_6rem_6rem_2.5rem] gap-2 px-3 py-2.5 items-start"
              >
                <input
                  className="h-input w-full rounded border border-input bg-surface px-2 text-sm focus:outline-none focus:border-primary"
                  placeholder={t('common.description')}
                  {...register(`lineItems.${index}.description`, { required: true })}
                />
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  className="h-input w-full rounded border border-input bg-surface px-2 text-sm text-end focus:outline-none focus:border-primary"
                  {...register(`lineItems.${index}.quantity`, {
                    onChange: (e) => handleLineChange(index, 'quantity', e.target.value),
                  })}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-input w-full rounded border border-input bg-surface px-2 text-sm text-end focus:outline-none focus:border-primary"
                  {...register(`lineItems.${index}.unitPrice`, {
                    onChange: (e) => handleLineChange(index, 'unitPrice', e.target.value),
                  })}
                />
                <input
                  readOnly
                  className="h-input w-full rounded border border-input bg-surface-subtle px-2 text-sm text-end text-text-secondary"
                  {...register(`lineItems.${index}.lineTotal`)}
                />
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="flex items-center justify-center h-input w-full text-error hover:text-error/80 disabled:opacity-40"
                  disabled={fields.length === 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-48 space-y-1.5 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>{t('invoices.subtotal')}</span>
            <span className="font-medium tabular-nums">{subtotal}</span>
          </div>
          <div className="flex justify-between font-semibold text-text-primary border-t border-border pt-1.5">
            <span>{t('invoices.total')}</span>
            <span className="tabular-nums">{subtotal}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">{t('common.notes')}</label>
        <textarea
          rows={3}
          className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
          {...register('notes')}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
