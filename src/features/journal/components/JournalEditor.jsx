import { useEffect, useRef, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input, FormField } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'
import { useCreateJournal, useUpdateJournal, usePostJournal } from '@/features/journal/hooks/useJournal'
import { useAccountList } from '@/features/accounts/hooks/useAccounts'
import { formatNumber } from '@/shared/utils/formatters'

const lineSchema = z.object({
  accountId: z.string().min(1, 'errors.required'),
  description: z.string().optional().default(''),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
})

const entrySchema = z.object({
  date: z.string().min(1, 'errors.required'),
  description: z.string().min(1, 'errors.required'),
  reference: z.string().optional().default(''),
  lines: z.array(lineSchema).min(2, 'journal.minTwoLines'),
})

const emptyLine = () => ({ accountId: '', description: '', debit: 0, credit: 0 })
const amountToApiString = (value) => String(Number(value) || 0)

export function JournalEditor({ entry, onSuccess, onCancel }) {
  const { t, i18n } = useTranslation()
  const isEditing = !!entry
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const submitModeRef = useRef('draft')

  const createJournal = useCreateJournal()
  const updateJournal = useUpdateJournal()
  const postJournal = usePostJournal()

  const accountsQuery = useAccountList({ limit: 500 })
  const flatAccounts = useMemo(() => accountsQuery.data || [], [accountsQuery.data])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      description: '',
      reference: '',
      lines: [emptyLine(), emptyLine()],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const watchedLines = watch('lines') || []

  useEffect(() => {
    if (entry) {
      reset({
        date: entry.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        description: entry.description || '',
        reference: entry.reference || '',
        lines:
          entry.lines?.length >= 2
            ? entry.lines.map((l) => ({
                accountId:
                  l.account?._id ||
                  (l.accountId && typeof l.accountId === 'object' ? l.accountId._id : l.accountId) ||
                  '',
                description: l.description || '',
                debit: Number(l.debit) || 0,
                credit: Number(l.credit) || 0,
              }))
            : [emptyLine(), emptyLine()],
      })
    }
  }, [entry, reset])

  const totalDebit = watchedLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0)
  const totalCredit = watchedLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0)
  const difference = Math.abs(totalDebit - totalCredit)
  const hasAmounts = totalDebit > 0 || totalCredit > 0
  const isBalanced = difference < 0.001 && totalDebit > 0

  function handleDebitChange(index, value) {
    if ((parseFloat(value) || 0) > 0) {
      setValue(`lines.${index}.credit`, 0)
    }
  }

  function handleCreditChange(index, value) {
    if ((parseFloat(value) || 0) > 0) {
      setValue(`lines.${index}.debit`, 0)
    }
  }

  function buildPayload(values) {
    return {
      date: values.date,
      description: values.description,
      reference: values.reference || undefined,
      lines: values.lines.map((l) => ({
        accountId: l.accountId,
        description: l.description || undefined,
        debit: amountToApiString(l.debit),
        credit: amountToApiString(l.credit),
      })),
    }
  }

  const anyPending = createJournal.isPending || updateJournal.isPending || postJournal.isPending

  async function onSubmit(values) {
    const mode = submitModeRef.current
    const payload = buildPayload(values)
    try {
      let entryId = entry?._id
      if (isEditing) {
        await updateJournal.mutateAsync({ id: entry._id, data: payload })
      } else {
        const created = await createJournal.mutateAsync(payload)
        entryId = created._id
      }
      if (mode === 'post' && entryId) {
        await postJournal.mutateAsync(entryId)
      }
      onSuccess?.()
    } catch {
      // Error handled in mutation onError
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header fields ── */}
      <div className="bg-surface border border-border rounded-lg p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            type="date"
            label={t('common.date')}
            required
            error={errors.date && t(errors.date.message)}
            {...register('date')}
          />
          <div className="sm:col-span-2">
            <Input
              label={t('common.description')}
              placeholder={t('journal.descriptionPlaceholder')}
              required
              error={errors.description && t(errors.description.message)}
              {...register('description')}
            />
          </div>
          <Input
            label={t('journal.reference')}
            placeholder={t('journal.referencePlaceholder')}
            {...register('reference')}
          />
        </div>
      </div>

      {/* ── Lines table ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text-primary">
            {t('journal.lines')}
            <span className="ms-1.5 text-xs font-normal text-text-muted">
              ({fields.length})
            </span>
          </span>
          {errors.lines?.root && (
            <span className="text-xs text-error">{t(errors.lines.root.message)}</span>
          )}
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 px-3 py-2.5 bg-surface-subtle border-b border-border">
            <span className="text-xs font-semibold text-text-muted w-6 text-center">#</span>
            <span className="text-xs font-semibold text-text-muted">{t('journal.account')}</span>
            <span className="text-xs font-semibold text-text-muted w-28 text-end">{t('common.debit')}</span>
            <span className="text-xs font-semibold text-text-muted w-28 text-end">{t('common.credit')}</span>
            <span className="w-8" />
          </div>

          {/* Line rows */}
          <div className="divide-y divide-border">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-2.5 items-start"
              >
                {/* Row index */}
                <span className="w-6 text-center text-xs text-text-muted pt-2.5 select-none">
                  {index + 1}
                </span>

                {/* Account + optional line description */}
                <div className="space-y-1.5 min-w-0">
                  <select
                    className={cn(
                      'h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm text-text-primary',
                      'focus:outline-none focus:border-primary focus:shadow-focus transition-colors',
                      errors.lines?.[index]?.accountId && 'border-error'
                    )}
                    {...register(`lines.${index}.accountId`)}
                  >
                    <option value="">{t('journal.selectAccount')}</option>
                    {flatAccounts.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder={t('journal.lineDescription')}
                    className={cn(
                      'h-8 w-full rounded-md border border-input bg-surface px-2.5',
                      'text-xs text-text-primary placeholder:text-text-muted',
                      'focus:outline-none focus:border-primary transition-colors'
                    )}
                    {...register(`lines.${index}.description`)}
                  />

                  {errors.lines?.[index]?.accountId && (
                    <p className="text-xs text-error">{t('errors.required')}</p>
                  )}
                </div>

                {/* Debit */}
                <div className="w-28 pt-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={cn(
                      'h-9 w-full rounded-md border border-input bg-surface px-2.5',
                      'text-sm text-text-primary text-end tabular-nums',
                      'placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-focus transition-colors',
                      'focus:bg-primary-50'
                    )}
                    {...register(`lines.${index}.debit`, {
                      onChange: (e) => handleDebitChange(index, e.target.value),
                    })}
                  />
                </div>

                {/* Credit */}
                <div className="w-28 pt-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={cn(
                      'h-9 w-full rounded-md border border-input bg-surface px-2.5',
                      'text-sm text-text-primary text-end tabular-nums',
                      'placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-focus transition-colors',
                      'focus:bg-primary-50'
                    )}
                    {...register(`lines.${index}.credit`, {
                      onChange: (e) => handleCreditChange(index, e.target.value),
                    })}
                  />
                </div>

                {/* Remove line */}
                <button
                  type="button"
                  onClick={() => fields.length > 2 && remove(index)}
                  disabled={fields.length <= 2}
                  title={t('journal.removeLine')}
                  className={cn(
                    'h-9 w-8 flex items-center justify-center rounded',
                    'text-gray-300 hover:text-error hover:bg-error-soft transition-colors',
                    'disabled:pointer-events-none disabled:opacity-25'
                  )}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add line button */}
          <div className="px-3 py-3 border-t border-border bg-surface-subtle">
            <button
              type="button"
              onClick={() => append(emptyLine())}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-700 font-medium transition-colors"
            >
              <Plus size={14} />
              {t('journal.addLine')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Balance summary ── */}
      <div
        className={cn(
          'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-3.5 rounded-lg border',
          isBalanced
            ? 'bg-success-soft/40 border-success/30'
            : hasAmounts
            ? 'bg-error-soft/40 border-error/30'
            : 'bg-surface-muted border-border'
        )}
      >
        {/* Balance status indicator */}
        <div className="flex items-center gap-2">
          {isBalanced ? (
            <CheckCircle2 size={16} className="text-success shrink-0" />
          ) : (
            <AlertCircle
              size={16}
              className={cn('shrink-0', hasAmounts ? 'text-error' : 'text-text-muted')}
            />
          )}
          <div>
            <span
              className={cn(
                'text-sm font-semibold',
                isBalanced ? 'text-success' : hasAmounts ? 'text-error' : 'text-text-muted'
              )}
            >
              {isBalanced
                ? t('journal.balanced')
                : hasAmounts
                ? t('journal.unbalanced')
                : t('journal.enterAmounts')}
            </span>
            {!isBalanced && hasAmounts && (
              <span className="block text-xs text-error mt-0.5">
                {t('journal.difference')}: {formatNumber(difference, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="flex items-center gap-6 text-sm tabular-nums">
          <div className="text-end">
            <div className="text-xs text-text-muted mb-0.5">{t('common.debit')}</div>
            <div
              className={cn(
                'font-semibold',
                totalDebit > 0 ? 'text-text-primary' : 'text-text-muted'
              )}
            >
              {formatNumber(totalDebit, locale)}
            </div>
          </div>
          <div className="text-end">
            <div className="text-xs text-text-muted mb-0.5">{t('common.credit')}</div>
            <div
              className={cn(
                'font-semibold',
                totalCredit > 0 ? 'text-text-primary' : 'text-text-muted'
              )}
            >
              {formatNumber(totalCredit, locale)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={anyPending}>
          {t('common.cancel')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={anyPending && submitModeRef.current === 'draft'}
          disabled={anyPending}
          onClick={() => {
            submitModeRef.current = 'draft'
            handleSubmit(onSubmit)()
          }}
        >
          {t('journal.saveDraft')}
        </Button>
        <Button
          type="button"
          size="sm"
          isLoading={anyPending && submitModeRef.current === 'post'}
          disabled={anyPending || !isBalanced}
          title={!isBalanced ? t('journal.unbalancedHint') : undefined}
          onClick={() => {
            submitModeRef.current = 'post'
            handleSubmit(onSubmit)()
          }}
        >
          {t('journal.saveAndPost')}
        </Button>
      </div>
    </div>
  )
}
