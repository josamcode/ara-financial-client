import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, CreditCard, XCircle, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { useBill, useCancelBill, usePayBill, usePostBill } from '@/features/bills/hooks/useBills'
import { BillStatusBadge } from '@/features/bills/components/BillStatusBadge'
import { useAccountList } from '@/features/accounts/hooks/useAccounts'
import { resolveLatestExchangeRate } from '@/features/exchangeRate/hooks/useExchangeRate'

function AccountSelect({ label, value, onChange, accounts, isLoading }) {
  const options = (accounts ?? []).filter((a) => !a.isParentOnly && a.isActive).map((a) => ({
    value: a._id,
    label: `${a.code} - ${a.nameAr || a.nameEn}`,
  }))
  return (
    <Select label={label} value={value} onChange={onChange} options={options} isLoading={isLoading} placeholder="-" />
  )
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function getPaymentAccountLabel(account) {
  if (!account) return '-'
  if (typeof account === 'string') return account
  return account.code ? `${account.code} - ${account.nameAr || account.nameEn}` : account.nameAr || account.nameEn || '-'
}

// Compact currency snapshot — only renders for foreign-currency bills
function CurrencySnapshot({ bill, t, locale }) {
  const docCurrency = bill.documentCurrency || bill.currency
  const baseCurr = bill.baseCurrency
  const isForeign = docCurrency && baseCurr && docCurrency !== baseCurr

  if (!isForeign) return null

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface-muted">
        <h3 className="text-sm font-semibold text-text-primary">{t('multiCurrency.currencySnapshot')}</h3>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.billCurrency')}</p>
            <p className="font-mono font-semibold text-text-primary">{docCurrency}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.companyBaseCurrency')}</p>
            <p className="font-mono font-semibold text-text-primary">{baseCurr}</p>
          </div>
          {bill.exchangeRate != null && (
            <div className="col-span-2">
              <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.exchangeRate')}</p>
              <p className="font-medium tabular-nums text-text-primary">
                1 {docCurrency} = {String(bill.exchangeRate)} {baseCurr}
              </p>
            </div>
          )}
          {bill.baseTotal != null && (
            <div className="col-span-2 pt-2 border-t border-border">
              <p className="text-xs text-text-muted mb-0.5">{t('bills.total')} ({baseCurr})</p>
              <p className="font-semibold tabular-nums text-text-primary">
                {formatCurrency(bill.baseTotal, baseCurr, locale)}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded px-3 py-2 text-xs text-warning">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>{t('multiCurrency.foreignBillPaymentHelp')}</span>
        </div>
      </div>
    </div>
  )
}

export default function BillDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = 'en'

  const { data: bill, isLoading, isError, refetch } = useBill(id)
  const { data: accounts, isLoading: accountsLoading } = useAccountList({ limit: 200, isActive: true })
  const postMutation = usePostBill()
  const payMutation = usePayBill()
  const cancelMutation = useCancelBill()

  const [postDialog, setPostDialog] = useState(false)
  const [payDialog, setPayDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [apAccountId, setApAccountId] = useState('')
  const [debitAccountId, setDebitAccountId] = useState('')
  const [cashAccountId, setCashAccountId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(getTodayDateValue())
  const [paymentExchangeRate, setPaymentExchangeRate] = useState('')
  const [paymentExchangeRateDate, setPaymentExchangeRateDate] = useState(getTodayDateValue())
  const [paymentExchangeRateSource, setPaymentExchangeRateSource] = useState('manual')

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!bill) return null

  const totalAmount = Number(bill.total ?? 0)
  const paidAmount = typeof bill.paidAmount === 'number'
    ? bill.paidAmount
    : bill.status === 'paid' ? totalAmount : 0
  const remainingAmount = typeof bill.remainingAmount === 'number'
    ? bill.remainingAmount
    : bill.status === 'paid' ? 0 : Math.max(totalAmount - paidAmount, 0)
  const payments = Array.isArray(bill.payments) ? bill.payments : []
  const accountList = accounts ?? []

  const docCurrency = bill.documentCurrency || bill.currency
  const isForeignCurrency = docCurrency && bill.baseCurrency && docCurrency !== bill.baseCurrency

  const canPost = bill.status === 'draft'
  const canPay = ['posted', 'partially_paid', 'overdue'].includes(bill.status)
  const canCancel = !['paid', 'cancelled'].includes(bill.status)
  const postDisabled = !apAccountId || !debitAccountId
  const foreignPaymentRateMissing = isForeignCurrency && (
    !paymentExchangeRate ||
    !Number.isFinite(Number(paymentExchangeRate)) ||
    Number(paymentExchangeRate) <= 0 ||
    !paymentExchangeRateDate ||
    !paymentExchangeRateSource
  )
  const payDisabled = !cashAccountId ||
    !paymentDate ||
    !paymentAmount ||
    Number(paymentAmount) <= 0 ||
    Number(paymentAmount) > remainingAmount ||
    foreignPaymentRateMissing
  const isFullyPaid = remainingAmount <= 0 && paidAmount > 0

  function openPostDialog() {
    setApAccountId('')
    setDebitAccountId('')
    setPostDialog(true)
  }

  async function openPayDialog() {
    const today = getTodayDateValue()
    setCashAccountId('')
    setPaymentAmount(remainingAmount > 0 ? String(remainingAmount) : '')
    setPaymentDate(today)
    setPaymentExchangeRate('')
    setPaymentExchangeRateDate(today)
    setPaymentExchangeRateSource('manual')
    setPayDialog(true)

    if (!isForeignCurrency) return

    try {
      const result = await resolveLatestExchangeRate({
        documentCurrency: docCurrency,
        baseCurrency: bill.baseCurrency,
        date: today,
      })
      if (result?.exchangeRate) {
        setPaymentExchangeRate(result.exchangeRate)
        setPaymentExchangeRateSource(result.record?.source || 'manual')
      }
    } catch {
      // Manual entry remains available when no saved rate exists.
    }
  }

  async function handlePost() {
    if (postDisabled) return
    await postMutation.mutateAsync({ id, data: { apAccountId, debitAccountId } })
    setPostDialog(false)
  }

  async function handlePay() {
    if (payDisabled) return
    const data = {
      cashAccountId,
      amount: paymentAmount,
      paymentDate,
    }

    if (isForeignCurrency) {
      data.paymentCurrency = docCurrency
      data.paymentExchangeRate = paymentExchangeRate
      data.paymentExchangeRateDate = paymentExchangeRateDate || paymentDate
      data.paymentExchangeRateSource = paymentExchangeRateSource || 'manual'
    }

    await payMutation.mutateAsync({ id, data })
    setPayDialog(false)
  }

  function handlePaymentDateChange(value) {
    const shouldSyncRateDate = !paymentExchangeRateDate || paymentExchangeRateDate === paymentDate
    setPaymentDate(value)
    if (isForeignCurrency && shouldSyncRateDate) {
      setPaymentExchangeRateDate(value || getTodayDateValue())
    }
  }

  async function handleCancel() {
    await cancelMutation.mutateAsync(id)
    setCancelDialog(false)
  }

  return (
    <div className="p-4 sm:p-6">
      {/* ── Page header ───────────────────────────────────────────── */}
      <PageHeader
        title={bill.billNumber}
        breadcrumbs={[
          { label: t('nav.bills'), href: ROUTES.BILLS },
          { label: bill.billNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <BillStatusBadge status={bill.status} />
          </div>
        }
      />

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-5 items-start">

        {/* ── LEFT: Bill document + history ───────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* Bill document card */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">

            {/* Supplier + metadata header */}
            <div className="px-6 py-5 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Supplier block */}
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                    {t('bills.supplier')}
                  </p>
                  <p className="text-lg font-bold text-text-primary leading-tight">
                    {bill.supplierName}
                  </p>
                  {bill.supplierEmail && (
                    <p className="text-sm text-text-secondary mt-0.5">{bill.supplierEmail}</p>
                  )}
                </div>

                {/* Bill metadata block */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-end shrink-0">
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">{t('bills.number')}</p>
                    <p className="font-mono font-semibold text-text-primary">{bill.billNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">{t('bills.currency')}</p>
                    <p className="font-mono font-semibold text-text-primary">{docCurrency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">{t('bills.issueDate')}</p>
                    <p className="font-medium tabular-nums">{formatDate(bill.issueDate, i18n.language)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">{t('bills.dueDate')}</p>
                    <p className="font-medium tabular-nums">{formatDate(bill.dueDate, i18n.language)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    <th className="px-6 py-3 text-start text-xs font-semibold text-text-muted uppercase tracking-wide">
                      {t('common.description')}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted uppercase tracking-wide w-16">
                      {t('bills.qty')}
                    </th>
                    <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted uppercase tracking-wide w-32">
                      {t('bills.unitPrice')}
                    </th>
                    <th className="px-6 py-3 text-end text-xs font-semibold text-text-muted uppercase tracking-wide w-32">
                      {t('bills.lineTotal')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(bill.lineItems ?? []).map((item, idx) => (
                    <tr key={item._id ?? idx} className="hover:bg-surface-subtle transition-colors">
                      <td className="px-6 py-3.5 text-text-primary">{item.description}</td>
                      <td className="px-4 py-3.5 text-end text-text-secondary tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-3.5 text-end text-text-secondary tabular-nums">
                        {formatCurrency(item.unitPrice, docCurrency, locale)}
                      </td>
                      <td className="px-6 py-3.5 text-end font-semibold tabular-nums text-text-primary">
                        {formatCurrency(item.lineTotal, docCurrency, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals block */}
            <div className="px-6 py-5 border-t border-border bg-surface-subtle">
              <div className="flex justify-end">
                <div className="w-64 space-y-2.5 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>{t('bills.subtotal')}</span>
                    <span className="tabular-nums font-medium">
                      {formatCurrency(bill.subtotal, docCurrency, locale)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-bold text-text-primary border-t border-border pt-2.5">
                    <span className="text-base">{t('bills.total')}</span>
                    <span className="tabular-nums text-lg">
                      {formatCurrency(bill.total, docCurrency, locale)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {bill.notes && (
              <div className="px-6 py-4 border-t border-border">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">
                  {t('common.notes')}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">{bill.notes}</p>
              </div>
            )}
          </div>

          {/* Payment history */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-surface-muted">
              <h3 className="text-sm font-semibold text-text-primary">{t('bills.paymentHistory')}</h3>
            </div>
            {payments.length === 0 ? (
              <EmptyState compact title={t('common.noData')} />
            ) : (
              <div className="divide-y divide-border">
                {payments.map((payment) => (
                  <div
                    key={payment._id || `${payment.date}-${payment.amount}`}
                    className="px-5 py-3.5 flex items-start justify-between gap-4 text-sm hover:bg-surface-subtle transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-success-soft flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} className="text-success" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary tabular-nums">
                          {formatCurrency(payment.amount, docCurrency, locale)}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatDate(payment.date, i18n.language)} · {getPaymentAccountLabel(payment.accountId)}
                        </p>
                      </div>
                    </div>
                    {payment.journalEntryId?.entryNumber && (
                      <span className="text-xs text-text-muted whitespace-nowrap shrink-0">
                        #{payment.journalEntryId.entryNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Journal entries */}
          {(bill.postedJournalEntryId || bill.paymentJournalEntryId) && (
            <div className="bg-surface rounded-lg border border-border p-4 text-sm space-y-1.5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                {t('bills.journalEntries')}
              </h3>
              {bill.postedJournalEntryId && (
                <p className="text-text-secondary">
                  {t('bills.postedEntry')}: <span className="font-mono">#{bill.postedJournalEntryId.entryNumber}</span>
                </p>
              )}
              {bill.paymentJournalEntryId && (
                <p className="text-text-secondary">
                  {t('bills.paymentEntry')}: <span className="font-mono">#{bill.paymentJournalEntryId.entryNumber}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ───────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Financial summary */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-surface-muted">
              <h3 className="text-sm font-semibold text-text-primary">{t('common.balance')}</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* Total */}
              <div>
                <p className="text-xs text-text-muted mb-1">{t('bills.total')}</p>
                <p className="text-2xl font-bold text-text-primary tabular-nums leading-none">
                  {formatCurrency(totalAmount, docCurrency, locale)}
                </p>
              </div>

              <div className="space-y-3 pt-1 border-t border-border">
                {/* Paid */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t('bills.paidAmount')}</span>
                  <span className={`font-semibold tabular-nums ${paidAmount > 0 ? 'text-success' : 'text-text-muted'}`}>
                    {formatCurrency(paidAmount, docCurrency, locale)}
                  </span>
                </div>
                {/* Remaining */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text-primary">{t('bills.remainingAmount')}</span>
                  <span className={`font-bold tabular-nums ${remainingAmount > 0 ? 'text-error' : 'text-success'}`}>
                    {formatCurrency(remainingAmount, docCurrency, locale)}
                  </span>
                </div>
              </div>

              {/* Paid-in-full indicator */}
              {isFullyPaid && (
                <div className="flex items-center gap-2 px-3 py-2 bg-success-soft rounded text-xs font-medium text-success">
                  <CheckCircle2 size={13} />
                  {t('bills.status.paid')}
                </div>
              )}

              {/* Due date */}
              <div className="pt-1 border-t border-border text-sm">
                <span className="text-text-muted text-xs">{t('bills.dueDate')}</span>
                <p className="font-medium tabular-nums mt-0.5">
                  {formatDate(bill.dueDate, i18n.language)}
                </p>
              </div>
            </div>
          </div>

          {/* Workflow actions */}
          {(canPost || canPay || canCancel) && (
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-surface-muted">
                <h3 className="text-sm font-semibold text-text-primary">{t('common.actions')}</h3>
              </div>
              <div className="p-4 space-y-2">
                {canPost && (
                  <PermissionGate permission={PERMISSIONS.BILL_CREATE}>
                    <Button
                      size="sm"
                      className="w-full justify-center"
                      onClick={openPostDialog}
                      isLoading={postMutation.isPending}
                    >
                      <CheckCircle2 size={13} />
                      {t('bills.postBill')}
                    </Button>
                  </PermissionGate>
                )}
                {canPay && (
                  <PermissionGate permission={PERMISSIONS.BILL_CREATE}>
                    <Button
                      size="sm"
                      className="w-full justify-center"
                      onClick={openPayDialog}
                      isLoading={payMutation.isPending}
                    >
                      <CreditCard size={13} />
                      {t('bills.recordPayment')}
                    </Button>
                  </PermissionGate>
                )}
                {canCancel && (
                  <PermissionGate permission={PERMISSIONS.BILL_CREATE}>
                    <div className="pt-1 border-t border-border">
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setCancelDialog(true)}
                        isLoading={cancelMutation.isPending}
                      >
                        <XCircle size={13} />
                        {t('bills.cancel')}
                      </Button>
                    </div>
                  </PermissionGate>
                )}
              </div>
            </div>
          )}

          {/* Currency snapshot (foreign only) */}
          <CurrencySnapshot bill={bill} t={t} locale={locale} />
        </div>
      </div>

      {/* ── Post dialog ───────────────────────────────────────────── */}
      {postDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-text-primary">{t('bills.postBill')}</h2>
            <p className="text-sm text-text-secondary">{t('bills.postDescription')}</p>
            <AccountSelect label={t('bills.apAccount')} value={apAccountId} onChange={setApAccountId} accounts={accountList} isLoading={accountsLoading} />
            <AccountSelect label={t('bills.debitAccount')} value={debitAccountId} onChange={setDebitAccountId} accounts={accountList} isLoading={accountsLoading} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPostDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handlePost} isLoading={postMutation.isPending} disabled={postDisabled}>
                {t('bills.postBill')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay dialog ────────────────────────────────────────────── */}
      {payDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-text-primary">{t('bills.recordPayment')}</h2>
            <p className="text-sm text-text-secondary">{t('bills.payDescription')}</p>
            <Input
              label={t('common.amount')}
              type="number"
              min="0"
              step="0.000001"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              hint={`${t('bills.remainingAmount')}: ${formatCurrency(remainingAmount, docCurrency, locale)}`}
            />
            <Input
              label={t('common.date')}
              type="date"
              value={paymentDate}
              onChange={(e) => handlePaymentDateChange(e.target.value)}
            />
            {isForeignCurrency && (
              <div className="rounded-md border border-border bg-surface-subtle p-3 space-y-3">
                <Input
                  label={t('multiCurrency.paymentCurrency')}
                  value={docCurrency}
                  disabled
                  hint={t('multiCurrency.billPaymentCurrencyHint')}
                />
                <Input
                  label={t('multiCurrency.paymentExchangeRate')}
                  type="number"
                  min="0"
                  step="0.000000000001"
                  required
                  value={paymentExchangeRate}
                  onChange={(e) => setPaymentExchangeRate(e.target.value)}
                  hint={`1 ${docCurrency} = ${paymentExchangeRate || '-'} ${bill.baseCurrency}`}
                />
                <Input
                  label={t('multiCurrency.paymentExchangeRateDate')}
                  type="date"
                  required
                  value={paymentExchangeRateDate}
                  onChange={(e) => setPaymentExchangeRateDate(e.target.value)}
                />
                <Select
                  label={t('multiCurrency.paymentExchangeRateSource')}
                  value={paymentExchangeRateSource}
                  onChange={setPaymentExchangeRateSource}
                  required
                  options={[
                    { value: 'manual', label: t('exchangeRates.sources.manual') },
                    { value: 'company_rate', label: t('exchangeRates.sources.company_rate') },
                    { value: 'central_bank', label: t('exchangeRates.sources.central_bank') },
                    { value: 'api', label: t('exchangeRates.sources.api') },
                  ]}
                />
              </div>
            )}
            <AccountSelect label={t('bills.cashAccount')} value={cashAccountId} onChange={setCashAccountId} accounts={accountList} isLoading={accountsLoading} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPayDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handlePay} isLoading={payMutation.isPending} disabled={payDisabled}>
                {t('bills.recordPayment')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelDialog}
        title={t('bills.cancel')}
        message={t('bills.confirmCancel')}
        confirmLabel={t('bills.cancel')}
        confirmVariant="danger"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog(false)}
      />
    </div>
  )
}
