import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Send, CreditCard, XCircle, Pencil, Printer, Mail, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
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

function AccountSelect({ label, value, onChange, accounts, isLoading }) {
  const options = (accounts ?? []).filter((a) => !a.isParentOnly && a.isActive).map((a) => ({
    value: a._id,
    label: `${a.code} - ${a.nameAr || a.nameEn}`,
  }))
  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      isLoading={isLoading}
      placeholder="-"
    />
  )
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10)
}

function getPaymentAccountLabel(account) {
  if (!account) return '-'
  return account.code ? `${account.code} - ${account.nameAr || account.nameEn}` : account.nameAr || account.nameEn || '-'
}

function CurrencySnapshotCard({ invoice, t, locale }) {
  const docCurrency = invoice.documentCurrency || invoice.currency
  const baseCurr = invoice.baseCurrency
  const isForeign = docCurrency && baseCurr && docCurrency !== baseCurr

  if (!docCurrency) return null

  const hasBaseAmounts = invoice.baseSubtotal != null || invoice.baseTotal != null

  return (
    <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">{t('multiCurrency.currencySnapshot')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.invoiceCurrency')}</p>
          <p className="font-semibold text-text-primary font-mono">{docCurrency}</p>
        </div>
        {baseCurr && (
          <div>
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.companyBaseCurrency')}</p>
            <p className="font-semibold text-text-primary font-mono">{baseCurr}</p>
          </div>
        )}
        {isForeign && invoice.exchangeRate != null && (
          <div>
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.exchangeRate')}</p>
            <p className="font-medium tabular-nums">
              1 {docCurrency} = {String(invoice.exchangeRate)} {baseCurr}
            </p>
          </div>
        )}
        {isForeign && invoice.exchangeRateDate && (
          <div>
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.exchangeRateDate')}</p>
            <p className="font-medium tabular-nums">{formatDate(invoice.exchangeRateDate, 'ar')}</p>
          </div>
        )}
        {isForeign && invoice.exchangeRateSource && (
          <div>
            <p className="text-xs text-text-muted mb-0.5">{t('multiCurrency.exchangeRateSource')}</p>
            <p className="font-medium">{invoice.exchangeRateSource}</p>
          </div>
        )}
      </div>

      {isForeign && hasBaseAmounts && (
        <div className="border-t border-border pt-3">
          <p className="text-xs font-medium text-text-muted mb-2">{t('multiCurrency.amountsInBaseCurrency')} ({baseCurr})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {invoice.baseSubtotal != null && (
              <div>
                <p className="text-xs text-text-muted mb-0.5">{t('invoices.subtotal')}</p>
                <p className="font-medium tabular-nums">
                  {formatCurrency(invoice.baseSubtotal, baseCurr, locale)}
                </p>
              </div>
            )}
            {invoice.baseTaxTotal != null && Number(invoice.baseTaxTotal) > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-0.5">{t('invoices.taxTotal', 'ضريبة')}</p>
                <p className="font-medium tabular-nums">
                  {formatCurrency(invoice.baseTaxTotal, baseCurr, locale)}
                </p>
              </div>
            )}
            {invoice.baseTotal != null && (
              <div>
                <p className="text-xs text-text-muted mb-0.5">{t('invoices.total')}</p>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(invoice.baseTotal, baseCurr, locale)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isForeign && (
        <div className="flex items-start gap-2 pt-2 border-t border-border text-sm text-warning bg-warning/5 rounded px-3 py-2">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{t('multiCurrency.foreignPaymentUnsupported')}</span>
        </div>
      )}
    </div>
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

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

  const accountList = accounts ?? []

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!invoice) return null

  const totalAmount = Number(invoice.total ?? 0)
  const paidAmount = typeof invoice.paidAmount === 'number'
    ? invoice.paidAmount
    : invoice.status === 'paid'
      ? totalAmount
      : 0
  const remainingAmount = typeof invoice.remainingAmount === 'number'
    ? invoice.remainingAmount
    : invoice.status === 'paid'
      ? 0
      : Math.max(totalAmount - paidAmount, 0)
  const payments = Array.isArray(invoice.payments) ? invoice.payments : []

  const docCurrency = invoice.documentCurrency || invoice.currency
  const isForeignCurrency = docCurrency && invoice.baseCurrency && docCurrency !== invoice.baseCurrency

  const isDraft = invoice.status === 'draft'
  const canSend = isDraft
  const canPay = ['sent', 'partially_paid', 'overdue'].includes(invoice.status)
  const canCancel = !['paid', 'cancelled'].includes(invoice.status)
  const payDisabled = !cashAccountId || !paymentDate || !paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > remainingAmount

  function openPayDialog() {
    setCashAccountId('')
    setPaymentAmount(remainingAmount > 0 ? String(remainingAmount) : '')
    setPaymentDate(getTodayDateValue())
    setPayDialog(true)
  }

  async function handleSend() {
    if (!arAccountId || !revenueAccountId) return
    await sendMutation.mutateAsync({ id, data: { arAccountId, revenueAccountId } })
    setSendDialog(false)
  }

  async function handlePay() {
    if (payDisabled) return
    await payMutation.mutateAsync({
      id,
      data: {
        cashAccountId,
        amount: paymentAmount,
        paymentDate,
      },
    })
    setPayDialog(false)
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <PageHeader
        title={invoice.invoiceNumber}
        breadcrumbs={[
          { label: t('nav.invoices'), href: ROUTES.INVOICES },
          { label: invoice.invoiceNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />

            <Link
              to={ROUTES.INVOICE_PRINT(id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 h-button-sm px-3 text-sm rounded-sm bg-surface text-text-primary border border-border hover:bg-surface-muted"
            >
              <Printer size={14} />
              {t('invoices.print')}
            </Link>

            {invoice.customerEmail && invoice.status !== 'cancelled' && (
              <PermissionGate permission={PERMISSIONS.INVOICE_SEND}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => emailMutation.mutate(id)}
                  isLoading={emailMutation.isPending}
                >
                  <Mail size={14} className="me-1" />
                  {t('invoices.sendEmail')}
                </Button>
              </PermissionGate>
            )}

            {isDraft && (
              <PermissionGate permission={PERMISSIONS.INVOICE_UPDATE}>
                <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
                  <Pencil size={14} className="me-1" />
                  {t('common.edit')}
                </Button>
              </PermissionGate>
            )}

            {canSend && (
              <PermissionGate permission={PERMISSIONS.INVOICE_SEND}>
                <Button size="sm" onClick={() => setSendDialog(true)}>
                  <Send size={14} className="me-1" />
                  {t('invoices.markAsSent')}
                </Button>
              </PermissionGate>
            )}

            {canPay && (
              <PermissionGate permission={PERMISSIONS.INVOICE_SEND}>
                <Button
                  size="sm"
                  onClick={isForeignCurrency ? undefined : openPayDialog}
                  disabled={!!isForeignCurrency}
                  title={isForeignCurrency ? t('multiCurrency.foreignPaymentUnsupported') : undefined}
                >
                  <CreditCard size={14} className="me-1" />
                  {t('invoices.recordPayment')}
                </Button>
              </PermissionGate>
            )}

            {canCancel && (
              <PermissionGate permission={PERMISSIONS.INVOICE_UPDATE}>
                <Button variant="danger" size="sm" onClick={() => setCancelDialog(true)}>
                  <XCircle size={14} className="me-1" />
                  {t('invoices.cancel')}
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      {editing ? (
        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
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
      ) : (
        <div className="space-y-6">
          <div className="bg-surface rounded-lg border border-border p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              <div>
                <p className="text-text-muted mb-1">{t('invoices.customer')}</p>
                <p className="font-medium text-text-primary">{invoice.customerName}</p>
                {invoice.customerEmail && (
                  <p className="text-text-secondary text-xs">{invoice.customerEmail}</p>
                )}
              </div>
              <div>
                <p className="text-text-muted mb-1">{t('invoices.issueDate')}</p>
                <p className="font-medium tabular-nums">{formatDate(invoice.issueDate, i18n.language)}</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">{t('invoices.dueDate')}</p>
                <p className="font-medium tabular-nums">{formatDate(invoice.dueDate, i18n.language)}</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">{t('invoices.total')}</p>
                <p className="font-semibold text-lg tabular-nums">
                  {formatCurrency(invoice.total, docCurrency, locale)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-1">{t('invoices.paidAmount')}</p>
                <p className="font-semibold text-lg tabular-nums">
                  {formatCurrency(paidAmount, docCurrency, locale)}
                </p>
              </div>
              <div>
                <p className="text-text-muted mb-1">{t('invoices.remainingAmount')}</p>
                <p className="font-semibold text-lg tabular-nums">
                  {formatCurrency(remainingAmount, docCurrency, locale)}
                </p>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-muted mb-1">{t('common.notes')}</p>
                <p className="text-sm text-text-secondary">{invoice.notes}</p>
              </div>
            )}
          </div>

          <CurrencySnapshotCard invoice={invoice} t={t} locale={locale} />

          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface-subtle">
              <h3 className="text-sm font-semibold text-text-primary">{t('invoices.lineItems')}</h3>
            </div>
            <div className="divide-y divide-border">
              {invoice.lineItems.map((item) => (
                <div key={item._id} className="grid grid-cols-[1fr_5rem_6rem_6rem] gap-3 px-4 py-3 text-sm">
                  <span className="text-text-primary">{item.description}</span>
                  <span className="text-end text-text-secondary tabular-nums">{item.quantity}</span>
                  <span className="text-end text-text-secondary tabular-nums">{item.unitPrice}</span>
                  <span className="text-end font-medium tabular-nums">{item.lineTotal}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border flex justify-end">
              <div className="w-48 space-y-1 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>{t('invoices.subtotal')}</span>
                  <span className="tabular-nums">{formatCurrency(invoice.subtotal, docCurrency, locale)}</span>
                </div>
                <div className="flex justify-between font-semibold text-text-primary border-t border-border pt-1">
                  <span>{t('invoices.total')}</span>
                  <span className="tabular-nums">{formatCurrency(invoice.total, docCurrency, locale)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface-subtle">
              <h3 className="text-sm font-semibold text-text-primary">{t('invoices.paymentHistory')}</h3>
            </div>
            {payments.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted">{t('common.noData')}</div>
            ) : (
              <div className="divide-y divide-border">
                {payments.map((payment) => (
                  <div key={payment._id || `${payment.date}-${payment.amount}`} className="px-4 py-3 flex items-start justify-between gap-4 text-sm">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-text-primary tabular-nums">
                        {formatCurrency(payment.amount, docCurrency, locale)}
                      </p>
                      <p className="text-text-secondary">{formatDate(payment.date, i18n.language)}</p>
                      <p className="text-text-secondary break-words">{getPaymentAccountLabel(payment.accountId)}</p>
                    </div>
                    {payment.journalEntryId?.entryNumber && (
                      <p className="text-text-muted whitespace-nowrap">
                        {t('invoices.paymentEntry')}: #{payment.journalEntryId.entryNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(invoice.sentJournalEntryId || invoice.paymentJournalEntryId) && (
            <div className="bg-surface rounded-lg border border-border p-4 text-sm space-y-2">
              <h3 className="font-semibold text-text-primary mb-2">{t('invoices.journalEntries')}</h3>
              {invoice.sentJournalEntryId && (
                <p className="text-text-secondary">
                  {t('invoices.sentEntry')}: #{invoice.sentJournalEntryId.entryNumber}
                </p>
              )}
              {invoice.paymentJournalEntryId && (
                <p className="text-text-secondary">
                  {t('invoices.paymentEntry')}: #{invoice.paymentJournalEntryId.entryNumber}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {sendDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-text-primary">{t('invoices.markAsSent')}</h2>
            <p className="text-sm text-text-secondary">{t('invoices.sendDescription')}</p>
            <AccountSelect
              label={t('invoices.arAccount')}
              value={arAccountId}
              onChange={setArAccountId}
              accounts={accountList}
              isLoading={accountsLoading}
            />
            <AccountSelect
              label={t('invoices.revenueAccount')}
              value={revenueAccountId}
              onChange={setRevenueAccountId}
              accounts={accountList}
              isLoading={accountsLoading}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSendDialog(false)}>{t('common.cancel')}</Button>
              <Button
                onClick={handleSend}
                isLoading={sendMutation.isPending}
                disabled={!arAccountId || !revenueAccountId}
              >
                {t('invoices.markAsSent')}
              </Button>
            </div>
          </div>
        </div>
      )}

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
              onChange={(event) => setPaymentAmount(event.target.value)}
              hint={`${t('invoices.remainingAmount')}: ${formatCurrency(remainingAmount, docCurrency, locale)}`}
            />
            <Input
              label={t('common.date')}
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
            <AccountSelect
              label={t('invoices.cashAccount')}
              value={cashAccountId}
              onChange={setCashAccountId}
              accounts={accountList}
              isLoading={accountsLoading}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPayDialog(false)}>{t('common.cancel')}</Button>
              <Button
                onClick={handlePay}
                isLoading={payMutation.isPending}
                disabled={payDisabled}
              >
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
