import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Send, CreditCard, XCircle, Pencil } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/Button'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { Select } from '@/shared/components/Select'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { ROUTES } from '@/shared/constants/routes'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'
import { useInvoice, useSendInvoice, usePayInvoice, useCancelInvoice, useUpdateInvoice } from '@/features/invoices/hooks/useInvoices'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'
import { useAccountList } from '@/features/accounts/hooks/useAccounts'

function AccountSelect({ label, value, onChange, accounts, isLoading }) {
  const options = (accounts ?? []).filter((a) => !a.isParentOnly && a.isActive).map((a) => ({
    value: a._id,
    label: `${a.code} — ${a.nameAr || a.nameEn}`,
  }))
  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      isLoading={isLoading}
      placeholder="—"
    />
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

  const { data: invoice, isLoading, isError, refetch } = useInvoice(id)
  const { data: accounts, isLoading: accountsLoading } = useAccountList({ limit: 200, isActive: true })
  const sendMutation = useSendInvoice()
  const payMutation = usePayInvoice()
  const cancelMutation = useCancelInvoice()
  const updateMutation = useUpdateInvoice()

  const [editing, setEditing] = useState(false)
  const [sendDialog, setSendDialog] = useState(false)
  const [payDialog, setPayDialog] = useState(false)
  const [arAccountId, setArAccountId] = useState('')
  const [revenueAccountId, setRevenueAccountId] = useState('')
  const [cashAccountId, setCashAccountId] = useState('')

  const accountList = accounts ?? []

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!invoice) return null

  const isDraft = invoice.status === 'draft'
  const isSent = invoice.status === 'sent'
  const isOverdue = invoice.status === 'overdue'
  const canSend = isDraft
  const canPay = isSent || isOverdue
  const canCancel = !['paid', 'cancelled'].includes(invoice.status)

  async function handleSend() {
    if (!arAccountId || !revenueAccountId) return
    await sendMutation.mutateAsync({ id, data: { arAccountId, revenueAccountId } })
    setSendDialog(false)
  }

  async function handlePay() {
    if (!cashAccountId) return
    await payMutation.mutateAsync({ id, data: { cashAccountId } })
    setPayDialog(false)
  }

  async function handleCancel() {
    if (!window.confirm(t('invoices.confirmCancel'))) return
    await cancelMutation.mutateAsync(id)
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
                <Button size="sm" onClick={() => setPayDialog(true)}>
                  <CreditCard size={14} className="me-1" />
                  {t('invoices.recordPayment')}
                </Button>
              </PermissionGate>
            )}

            {canCancel && (
              <PermissionGate permission={PERMISSIONS.INVOICE_UPDATE}>
                <Button variant="danger" size="sm" onClick={handleCancel} isLoading={cancelMutation.isPending}>
                  <XCircle size={14} className="me-1" />
                  {t('invoices.cancel')}
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      {/* Edit mode */}
      {editing ? (
        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
          <InvoiceForm
            defaultValues={{
              customerName: invoice.customerName,
              customerEmail: invoice.customerEmail,
              issueDate: invoice.issueDate?.slice(0, 10),
              dueDate: invoice.dueDate?.slice(0, 10),
              currency: invoice.currency,
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
          {/* Info card */}
          <div className="bg-surface rounded-lg border border-border p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
                  {formatCurrency(invoice.total, invoice.currency, locale)}
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

          {/* Line items */}
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
                  <span className="tabular-nums">{formatCurrency(invoice.subtotal, invoice.currency, locale)}</span>
                </div>
                <div className="flex justify-between font-semibold text-text-primary border-t border-border pt-1">
                  <span>{t('invoices.total')}</span>
                  <span className="tabular-nums">{formatCurrency(invoice.total, invoice.currency, locale)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Journal entries */}
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

      {/* Send dialog */}
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

      {/* Pay dialog */}
      {payDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold text-text-primary">{t('invoices.recordPayment')}</h2>
            <p className="text-sm text-text-secondary">{t('invoices.payDescription')}</p>
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
                disabled={!cashAccountId}
              >
                {t('invoices.recordPayment')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
