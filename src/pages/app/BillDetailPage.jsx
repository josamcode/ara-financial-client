import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, CreditCard, XCircle } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
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

function AccountSelect({ label, value, onChange, accounts, isLoading }) {
  const options = (accounts ?? []).filter((account) => !account.isParentOnly && account.isActive).map((account) => ({
    value: account._id,
    label: `${account.code} - ${account.nameAr || account.nameEn}`,
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
  if (typeof account === 'string') return account
  return account.code ? `${account.code} - ${account.nameAr || account.nameEn}` : account.nameAr || account.nameEn || '-'
}

export default function BillDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'

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

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!bill) return null

  const totalAmount = Number(bill.total ?? 0)
  const paidAmount = typeof bill.paidAmount === 'number'
    ? bill.paidAmount
    : bill.status === 'paid'
      ? totalAmount
      : 0
  const remainingAmount = typeof bill.remainingAmount === 'number'
    ? bill.remainingAmount
    : bill.status === 'paid'
      ? 0
      : Math.max(totalAmount - paidAmount, 0)
  const payments = Array.isArray(bill.payments) ? bill.payments : []
  const accountList = accounts ?? []

  const canPost = bill.status === 'draft'
  const canPay = ['posted', 'partially_paid', 'overdue'].includes(bill.status)
  const canCancel = !['paid', 'cancelled'].includes(bill.status)
  const postDisabled = !apAccountId || !debitAccountId
  const payDisabled = !cashAccountId || !paymentDate || !paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > remainingAmount

  function openPostDialog() {
    setApAccountId('')
    setDebitAccountId('')
    setPostDialog(true)
  }

  function openPayDialog() {
    setCashAccountId('')
    setPaymentAmount(remainingAmount > 0 ? String(remainingAmount) : '')
    setPaymentDate(getTodayDateValue())
    setPayDialog(true)
  }

  async function handlePost() {
    if (postDisabled) return
    await postMutation.mutateAsync({
      id,
      data: {
        apAccountId,
        debitAccountId,
      },
    })
    setPostDialog(false)
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

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <PageHeader
        title={bill.billNumber}
        breadcrumbs={[
          { label: t('nav.bills'), href: ROUTES.BILLS },
          { label: bill.billNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <BillStatusBadge status={bill.status} />

            {canPost && (
              <PermissionGate permission={PERMISSIONS.BILL_CREATE}>
                <Button size="sm" onClick={openPostDialog}>
                  <CheckCircle2 size={14} className="me-1" />
                  {t('bills.postBill')}
                </Button>
              </PermissionGate>
            )}

            {canPay && (
              <PermissionGate permission={PERMISSIONS.BILL_CREATE}>
                <Button size="sm" onClick={openPayDialog}>
                  <CreditCard size={14} className="me-1" />
                  {t('bills.recordPayment')}
                </Button>
              </PermissionGate>
            )}

            {canCancel && (
              <PermissionGate permission={PERMISSIONS.BILL_CREATE}>
                <Button variant="danger" size="sm" onClick={() => setCancelDialog(true)}>
                  <XCircle size={14} className="me-1" />
                  {t('bills.cancel')}
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <p className="mb-1 text-text-muted">{t('bills.supplier')}</p>
              <p className="font-medium text-text-primary">{bill.supplierName}</p>
              {bill.supplierEmail && (
                <p className="text-xs text-text-secondary">{bill.supplierEmail}</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.issueDate')}</p>
              <p className="font-medium tabular-nums">{formatDate(bill.issueDate, i18n.language)}</p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.dueDate')}</p>
              <p className="font-medium tabular-nums">{formatDate(bill.dueDate, i18n.language)}</p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.currency')}</p>
              <p className="font-medium text-text-primary">{bill.currency}</p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.total')}</p>
              <p className="text-lg font-semibold tabular-nums text-text-primary">
                {formatCurrency(bill.total, bill.currency, locale)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.paidAmount')}</p>
              <p className="text-lg font-semibold tabular-nums text-text-primary">
                {formatCurrency(paidAmount, bill.currency, locale)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-text-muted">{t('bills.remainingAmount')}</p>
              <p className="text-lg font-semibold tabular-nums text-text-primary">
                {formatCurrency(remainingAmount, bill.currency, locale)}
              </p>
            </div>
          </div>

          {bill.notes && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-1 text-xs text-text-muted">{t('common.notes')}</p>
              <p className="text-sm text-text-secondary">{bill.notes}</p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-subtle px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">{t('bills.lineItems')}</h3>
          </div>
          <div className="divide-y divide-border">
            {(bill.lineItems ?? []).map((item) => (
              <div key={item._id} className="grid grid-cols-[1fr_5rem_6rem_6rem] gap-3 px-4 py-3 text-sm">
                <span className="text-text-primary">{item.description}</span>
                <span className="text-end tabular-nums text-text-secondary">{item.quantity}</span>
                <span className="text-end tabular-nums text-text-secondary">{item.unitPrice}</span>
                <span className="text-end font-medium tabular-nums">{item.lineTotal}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-border px-4 py-3">
            <div className="w-48 space-y-1 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>{t('bills.subtotal')}</span>
                <span className="tabular-nums">{formatCurrency(bill.subtotal, bill.currency, locale)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 font-semibold text-text-primary">
                <span>{t('bills.total')}</span>
                <span className="tabular-nums">{formatCurrency(bill.total, bill.currency, locale)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-surface-subtle px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">{t('bills.paymentHistory')}</h3>
          </div>
          {payments.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">{t('common.noData')}</div>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((payment) => (
                <div key={payment._id || `${payment.date}-${payment.amount}`} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium tabular-nums text-text-primary">
                      {formatCurrency(payment.amount, bill.currency, locale)}
                    </p>
                    <p className="text-text-secondary">{formatDate(payment.date, i18n.language)}</p>
                    <p className="break-words text-text-secondary">{getPaymentAccountLabel(payment.accountId)}</p>
                  </div>
                  {payment.journalEntryId?.entryNumber && (
                    <p className="whitespace-nowrap text-text-muted">
                      {t('bills.paymentEntry')}: #{payment.journalEntryId.entryNumber}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {(bill.postedJournalEntryId || bill.paymentJournalEntryId) && (
          <div className="space-y-2 rounded-lg border border-border bg-surface p-4 text-sm">
            <h3 className="mb-2 font-semibold text-text-primary">{t('bills.journalEntries')}</h3>
            {bill.postedJournalEntryId && (
              <p className="text-text-secondary">
                {t('bills.postedEntry')}: #{bill.postedJournalEntryId.entryNumber}
              </p>
            )}
            {bill.paymentJournalEntryId && (
              <p className="text-text-secondary">
                {t('bills.paymentEntry')}: #{bill.paymentJournalEntryId.entryNumber}
              </p>
            )}
          </div>
        )}
      </div>

      {postDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6">
            <h2 className="font-semibold text-text-primary">{t('bills.postBill')}</h2>
            <p className="text-sm text-text-secondary">{t('bills.postDescription')}</p>
            <AccountSelect
              label={t('bills.apAccount')}
              value={apAccountId}
              onChange={setApAccountId}
              accounts={accountList}
              isLoading={accountsLoading}
            />
            <AccountSelect
              label={t('bills.debitAccount')}
              value={debitAccountId}
              onChange={setDebitAccountId}
              accounts={accountList}
              isLoading={accountsLoading}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPostDialog(false)}>{t('common.cancel')}</Button>
              <Button
                onClick={handlePost}
                isLoading={postMutation.isPending}
                disabled={postDisabled}
              >
                {t('bills.postBill')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {payDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6">
            <h2 className="font-semibold text-text-primary">{t('bills.recordPayment')}</h2>
            <p className="text-sm text-text-secondary">{t('bills.payDescription')}</p>
            <Input
              label={t('common.amount')}
              type="number"
              min="0"
              step="0.000001"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              hint={`${t('bills.remainingAmount')}: ${formatCurrency(remainingAmount, bill.currency, locale)}`}
            />
            <Input
              label={t('common.date')}
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
            <AccountSelect
              label={t('bills.cashAccount')}
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
