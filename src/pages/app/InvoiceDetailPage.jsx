import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Send, CreditCard, XCircle, Pencil, Printer, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'
import { useInvoice, useSendInvoice, usePayInvoice, useCancelInvoice, useUpdateInvoice, useEmailInvoice } from '@/features/invoices/hooks/useInvoices'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'
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
  return account.code ? `${account.code} - ${account.nameAr || account.nameEn}` : account.nameAr || account.nameEn || '-'
}

// Compact currency snapshot — only renders for foreign-currency invoices
function CurrencySnapshot({ invoice, t, locale }) {
  const docCurrency = invoice.documentCurrency || invoice.currency
  const baseCurr = invoice.baseCurrency
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
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.invoiceCurrency')}</p>
            <p className="font-mono font-semibold text-text-primary">{docCurrency}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.companyBaseCurrency')}</p>
            <p className="font-mono font-semibold text-text-primary">{baseCurr}</p>
          </div>
          {invoice.exchangeRate != null && (
            <div className="col-span-2">
              <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.exchangeRate')}</p>
              <p className="font-medium tabular-nums text-text-primary">
                1 {docCurrency} = {String(invoice.exchangeRate)} {baseCurr}
              </p>
            </div>
          )}
          {invoice.baseTotal != null && (
            <div className="col-span-2 pt-2 border-t border-border">
              <p className="text-xs text-text-muted mb-0.5">{t('invoices.total')} ({baseCurr})</p>
              <p className="font-semibold tabular-nums text-text-primary">
                {formatCurrency(invoice.baseTotal, baseCurr, locale)}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-start gap-2 bg-warning/5 border border-warning/20 rounded px-3 py-2 text-xs text-warning">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span>{t('multiCurrency.foreignInvoicePaymentHelp')}</span>
        </div>
      </div>
    </div>
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = 'en'

  const { data: invoice, isLoading, isError, refetch } = useInvoice(id)
  const { data: accounts, isLoading: accountsLoading } = useAccountList({ limit: 200, isActive: true })
  const sendMutation = useSendInvoice()
  const payMutation = usePayInvoice()
  const cancelMutation = useCancelInvoice()
  const updateMutation = useUpdateInvoice()
  const emailMutation = useEmailInvoice()

  const [editing, setEditing] = useState(false)
  const [sendDialog, setSendDialog] = useState(false)
  const [payDialog, setPayDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [arAccountId, setArAccountId] = useState('')
  const [revenueAccountId, setRevenueAccountId] = useState('')
  const [cashAccountId, setCashAccountId] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(getTodayDateValue())
  const [paymentExchangeRate, setPaymentExchangeRate] = useState('')
  const [paymentExchangeRateDate, setPaymentExchangeRateDate] = useState(getTodayDateValue())
  const [paymentExchangeRateSource, setPaymentExchangeRateSource] = useState('manual')

  const accountList = accounts ?? []

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!invoice) return null

  const totalAmount = Number(invoice.total ?? 0)
  const paidAmount = typeof invoice.paidAmount === 'number'
    ? invoice.paidAmount
    : invoice.status === 'paid' ? totalAmount : 0
  const remainingAmount = typeof invoice.remainingAmount === 'number'
    ? invoice.remainingAmount
    : invoice.status === 'paid' ? 0 : Math.max(totalAmount - paidAmount, 0)
  const payments = Array.isArray(invoice.payments) ? invoice.payments : []

  const docCurrency = invoice.documentCurrency || invoice.currency
  const isForeignCurrency = docCurrency && invoice.baseCurrency && docCurrency !== invoice.baseCurrency

  const isDraft = invoice.status === 'draft'
  const canSend = isDraft
  const canPay = ['sent', 'partially_paid', 'overdue'].includes(invoice.status)
  const canCancel = !['paid', 'cancelled'].includes(invoice.status)
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
        baseCurrency: invoice.baseCurrency,
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

  async function handleSend() {
    if (!arAccountId || !revenueAccountId) return
    await sendMutation.mutateAsync({ id, data: { arAccountId, revenueAccountId } })
    setSendDialog(false)
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

  async function handleUpdate(formData) {
    await updateMutation.mutateAsync({ id, data: formData })
    setEditing(false)
  }

  return (
    <div className="p-4 sm:p-6">
      {/* ── Page header ───────────────────────────────────────────── */}
      <PageHeader
        title={invoice.invoiceNumber}
        breadcrumbs={[
          { label: t('nav.invoices'), href: ROUTES.INVOICES },
          { label: invoice.invoiceNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            <div className="h-4 w-px bg-border" />
            <Link
              to={ROUTES.INVOICE_PRINT(id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-button-sm px-3 text-sm font-medium rounded-sm bg-surface text-text-secondary border border-border hover:bg-surface-muted transition-colors"
            >
              <Printer size={13} />
              {t('invoices.print')}
            </Link>
            {invoice.customerEmail && invoice.status !== 'cancelled' && (
              <PermissionGate permission={PERMISSIONS.INVOICE_SEND}>
                <Button variant="secondary" size="sm" onClick={() => emailMutation.mutate(id)} isLoading={emailMutation.isPending}>
                  <Mail size={13} />
                  {t('invoices.sendEmail')}
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      {/* ── Editing mode (full-width form) ────────────────────────── */}
      {editing && (
        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">{t('common.edit')}: {invoice.invoiceNumber}</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
          </div>
          <InvoiceForm
            defaultValues={{
              customerName: invoice.customerName,
              customerEmail: invoice.customerEmail,
              issueDate: invoice.issueDate?.slice(0, 10),
              dueDate: invoice.dueDate?.slice(0, 10),
              documentCurrency: invoice.documentCurrency || invoice.currency,
              exchangeRate: invoice.exchangeRate ? String(invoice.exchangeRate) : '',
              exchangeRateDate: invoice.exchangeRateDate?.slice(0, 10) || getTodayDateValue(),
              exchangeRateSource: invoice.exchangeRateSource || 'manual',
              exchangeRateProvider: invoice.exchangeRateProvider || '',
              isExchangeRateManualOverride: invoice.isExchangeRateManualOverride || false,
              notes: invoice.notes,
              lineItems: invoice.lineItems.map((l) => ({
                description: l.description,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                lineTotal: l.lineTotal,
              })),
              subtotal: invoice.subtotal,
              total: invoice.total,
            }}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
          />
        </div>
      )}

      {/* ── Two-column view ───────────────────────────────────────── */}
      {!editing && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-5 items-start">

          {/* ── LEFT: Invoice document + history ────────────────── */}
          <div className="space-y-4 min-w-0">

            {/* Invoice document card */}
            <div className="bg-surface rounded-lg border border-border overflow-hidden">

              {/* Customer + metadata header */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Customer block */}
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                      {t('invoices.customer')}
                    </p>
                    <p className="text-lg font-bold text-text-primary leading-tight">
                      {invoice.customerName}
                    </p>
                    {invoice.customerEmail && (
                      <p className="text-sm text-text-secondary mt-0.5">{invoice.customerEmail}</p>
                    )}
                  </div>

                  {/* Invoice metadata block */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-end shrink-0">
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">{t('invoices.number')}</p>
                      <p className="font-mono font-semibold text-text-primary">{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">{t('invoices.currency')}</p>
                      <p className="font-mono font-semibold text-text-primary">{docCurrency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">{t('invoices.issueDate')}</p>
                      <p className="font-medium tabular-nums">{formatDate(invoice.issueDate, i18n.language)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-0.5">{t('invoices.dueDate')}</p>
                      <p className="font-medium tabular-nums">{formatDate(invoice.dueDate, i18n.language)}</p>
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
                        {t('invoices.qty')}
                      </th>
                      <th className="px-4 py-3 text-end text-xs font-semibold text-text-muted uppercase tracking-wide w-32">
                        {t('invoices.unitPrice')}
                      </th>
                      <th className="px-6 py-3 text-end text-xs font-semibold text-text-muted uppercase tracking-wide w-32">
                        {t('invoices.lineTotal')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.lineItems.map((item, idx) => (
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
                      <span>{t('invoices.subtotal')}</span>
                      <span className="tabular-nums font-medium">
                        {formatCurrency(invoice.subtotal, docCurrency, locale)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline font-bold text-text-primary border-t border-border pt-2.5">
                      <span className="text-base">{t('invoices.total')}</span>
                      <span className="tabular-nums text-lg">
                        {formatCurrency(invoice.total, docCurrency, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="px-6 py-4 border-t border-border">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">
                    {t('common.notes')}
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Payment history */}
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-surface-muted">
                <h3 className="text-sm font-semibold text-text-primary">{t('invoices.paymentHistory')}</h3>
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
            {(invoice.sentJournalEntryId || invoice.paymentJournalEntryId) && (
              <div className="bg-surface rounded-lg border border-border p-4 text-sm space-y-1.5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                  {t('invoices.journalEntries')}
                </h3>
                {invoice.sentJournalEntryId && (
                  <p className="text-text-secondary">
                    {t('invoices.sentEntry')}: <span className="font-mono">#{invoice.sentJournalEntryId.entryNumber}</span>
                  </p>
                )}
                {invoice.paymentJournalEntryId && (
                  <p className="text-text-secondary">
                    {t('invoices.paymentEntry')}: <span className="font-mono">#{invoice.paymentJournalEntryId.entryNumber}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ───────────────────────────────────── */}
          <div className="space-y-4">

            {/* Financial summary */}
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-surface-muted">
                <h3 className="text-sm font-semibold text-text-primary">{t('common.balance')}</h3>
              </div>
              <div className="p-5 space-y-4">
                {/* Total */}
                <div>
                  <p className="text-xs text-text-muted mb-1">{t('invoices.total')}</p>
                  <p className="text-2xl font-bold text-text-primary tabular-nums leading-none">
                    {formatCurrency(totalAmount, docCurrency, locale)}
                  </p>
                </div>

                <div className="space-y-3 pt-1 border-t border-border">
                  {/* Paid */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{t('invoices.paidAmount')}</span>
                    <span className={`font-semibold tabular-nums ${paidAmount > 0 ? 'text-success' : 'text-text-muted'}`}>
                      {formatCurrency(paidAmount, docCurrency, locale)}
                    </span>
                  </div>
                  {/* Remaining */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">{t('invoices.remainingAmount')}</span>
                    <span className={`font-bold tabular-nums ${remainingAmount > 0 ? 'text-error' : 'text-success'}`}>
                      {formatCurrency(remainingAmount, docCurrency, locale)}
                    </span>
                  </div>
                </div>

                {/* Paid-in-full indicator */}
                {isFullyPaid && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-success-soft rounded text-xs font-medium text-success">
                    <CheckCircle2 size={13} />
                    {t('invoices.paid')}
                  </div>
                )}

                {/* Due date */}
                <div className="pt-1 border-t border-border text-sm">
                  <span className="text-text-muted text-xs">{t('invoices.dueDate')}</span>
                  <p className="font-medium tabular-nums mt-0.5">
                    {formatDate(invoice.dueDate, i18n.language)}
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow actions */}
            {(isDraft || canSend || canPay || canCancel) && (
              <div className="bg-surface rounded-lg border border-border overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border bg-surface-muted">
                  <h3 className="text-sm font-semibold text-text-primary">{t('common.actions')}</h3>
                </div>
                <div className="p-4 space-y-2">
                  {isDraft && (
                    <PermissionGate permission={PERMISSIONS.INVOICE_UPDATE}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setEditing(true)}
                      >
                        <Pencil size={13} />
                        {t('common.edit')}
                      </Button>
                    </PermissionGate>
                  )}
                  {canSend && (
                    <PermissionGate permission={PERMISSIONS.INVOICE_SEND}>
                      <Button
                        size="sm"
                        className="w-full justify-center"
                        onClick={() => setSendDialog(true)}
                        isLoading={sendMutation.isPending}
                      >
                        <Send size={13} />
                        {t('invoices.markAsSent')}
                      </Button>
                    </PermissionGate>
                  )}
                  {canPay && (
                    <PermissionGate permission={PERMISSIONS.INVOICE_SEND}>
                      <Button
                        size="sm"
                        className="w-full justify-center"
                        onClick={openPayDialog}
                        isLoading={payMutation.isPending}
                      >
                        <CreditCard size={13} />
                        {t('invoices.recordPayment')}
                      </Button>
                    </PermissionGate>
                  )}
                  {canCancel && (
                    <PermissionGate permission={PERMISSIONS.INVOICE_UPDATE}>
                      <div className="pt-1 border-t border-border">
                        <Button
                          variant="danger"
                          size="sm"
                          className="w-full justify-center"
                          onClick={() => setCancelDialog(true)}
                          isLoading={cancelMutation.isPending}
                        >
                          <XCircle size={13} />
                          {t('invoices.cancel')}
                        </Button>
                      </div>
                    </PermissionGate>
                  )}
                </div>
              </div>
            )}

            {/* Currency snapshot (foreign only) */}
            <CurrencySnapshot invoice={invoice} t={t} locale={locale} />
          </div>
        </div>
      )}

      {/* ── Send dialog ───────────────────────────────────────────── */}
      {sendDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-text-primary">{t('invoices.markAsSent')}</h2>
            <p className="text-sm text-text-secondary">{t('invoices.sendDescription')}</p>
            <AccountSelect label={t('invoices.arAccount')} value={arAccountId} onChange={setArAccountId} accounts={accountList} isLoading={accountsLoading} />
            <AccountSelect label={t('invoices.revenueAccount')} value={revenueAccountId} onChange={setRevenueAccountId} accounts={accountList} isLoading={accountsLoading} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSendDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSend} isLoading={sendMutation.isPending} disabled={!arAccountId || !revenueAccountId}>
                {t('invoices.markAsSent')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay dialog ────────────────────────────────────────────── */}
      {payDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-text-primary">{t('invoices.recordPayment')}</h2>
            <p className="text-sm text-text-secondary">{t('invoices.payDescription')}</p>
            <Input
              label={t('common.amount')}
              type="number"
              min="0"
              step="0.000001"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              hint={`${t('invoices.remainingAmount')}: ${formatCurrency(remainingAmount, docCurrency, locale)}`}
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
                  hint={t('multiCurrency.paymentCurrencyHint')}
                />
                <Input
                  label={t('multiCurrency.paymentExchangeRate')}
                  type="number"
                  min="0"
                  step="0.000000000001"
                  required
                  value={paymentExchangeRate}
                  onChange={(e) => setPaymentExchangeRate(e.target.value)}
                  hint={`1 ${docCurrency} = ${paymentExchangeRate || '-'} ${invoice.baseCurrency}`}
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
            <AccountSelect label={t('invoices.cashAccount')} value={cashAccountId} onChange={setCashAccountId} accounts={accountList} isLoading={accountsLoading} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPayDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handlePay} isLoading={payMutation.isPending} disabled={payDisabled}>
                {t('invoices.recordPayment')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelDialog}
        title={t('invoices.cancel')}
        message={t('invoices.confirmCancel')}
        confirmLabel={t('invoices.cancel')}
        confirmVariant="danger"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog(false)}
      />
    </div>
  )
}
