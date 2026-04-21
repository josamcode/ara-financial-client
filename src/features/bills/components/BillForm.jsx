import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { useAllSuppliers } from '@/features/suppliers/hooks/useSuppliers'

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
  const { data: suppliersData } = useAllSuppliers()
  const suppliers = suppliersData?.suppliers ?? []

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues ?? {
      supplierId: '',
      supplierName: '',
      supplierEmail: '',
      issueDate: todayISO(),
      dueDate: addDays(30),
      currency: 'EGP',
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

  const subtotal = watch('subtotal')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        {suppliers.length > 0 && (
          <Select
            label={t('suppliers.selectSupplier')}
            value={selectedSupplierId || ''}
            onChange={handleSupplierSelect}
            options={supplierOptions}
            searchable
          />
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <Input label={t('bills.currency')} {...register('currency')} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">{t('bills.lineItems')}</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addLine}>
            <Plus size={14} className="me-1" />
            {t('bills.addLine')}
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-[1fr_5rem_6rem_6rem_2.5rem] gap-2 border-b border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-muted sm:grid">
            <span>{t('common.description')}</span>
            <span className="text-end">{t('bills.qty')}</span>
            <span className="text-end">{t('bills.unitPrice')}</span>
            <span className="text-end">{t('bills.lineTotal')}</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 items-start gap-2 px-3 py-2.5 sm:grid-cols-[1fr_5rem_6rem_6rem_2.5rem]"
              >
                <input
                  className="h-input w-full rounded border border-input bg-surface px-2 text-sm focus:border-primary focus:outline-none"
                  placeholder={t('common.description')}
                  {...register(`lineItems.${index}.description`, { required: true })}
                />
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  className="h-input w-full rounded border border-input bg-surface px-2 text-end text-sm focus:border-primary focus:outline-none"
                  {...register(`lineItems.${index}.quantity`, {
                    onChange: (event) => handleLineChange(index, 'quantity', event.target.value),
                  })}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-input w-full rounded border border-input bg-surface px-2 text-end text-sm focus:border-primary focus:outline-none"
                  {...register(`lineItems.${index}.unitPrice`, {
                    onChange: (event) => handleLineChange(index, 'unitPrice', event.target.value),
                  })}
                />
                <input
                  readOnly
                  className="h-input w-full rounded border border-input bg-surface-subtle px-2 text-end text-sm text-text-secondary"
                  {...register(`lineItems.${index}.lineTotal`)}
                />
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="flex h-input w-full items-center justify-center text-error hover:text-error/80 disabled:opacity-40"
                  disabled={fields.length === 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-48 space-y-1.5 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>{t('bills.subtotal')}</span>
            <span className="font-medium tabular-nums">{subtotal}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-text-primary">
            <span>{t('bills.total')}</span>
            <span className="tabular-nums">{subtotal}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('common.notes')}</label>
        <textarea
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-border pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
