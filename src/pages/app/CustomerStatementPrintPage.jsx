import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Printer, ArrowLeft, ArrowRight } from 'lucide-react'
import { customerApi } from '@/entities/customer/api/customerApi'
import { useAuth } from '@/entities/auth/model/useAuth'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { ROUTES } from '@/shared/constants/routes'

const PRINT_PAGE_LIMIT = 100

async function getPrintableCustomerStatement(id) {
  const firstPage = await customerApi
    .getStatement(id, { page: 1, limit: PRINT_PAGE_LIMIT })
    .then((response) => response.data)

  const totalPages = firstPage?.pagination?.totalPages ?? 1

  if (totalPages <= 1) {
    return firstPage
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      customerApi
        .getStatement(id, { page: index + 2, limit: PRINT_PAGE_LIMIT })
        .then((response) => response.data)
    )
  )

  return {
    ...firstPage,
    transactions: [
      ...(firstPage?.transactions ?? []),
      ...remainingPages.flatMap((page) => page?.transactions ?? []),
    ],
    pagination: {
      ...firstPage?.pagination,
      page: 1,
      limit: Math.max(firstPage?.pagination?.total ?? 0, PRINT_PAGE_LIMIT),
      totalPages: 1,
    },
  }
}

function SummaryCard({ label, value }) {
  return (
    <div className="h-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-2">{label}</p>
      <p className="text-lg font-bold text-gray-900 tabular-nums whitespace-nowrap">{value}</p>
    </div>
  )
}

function TransactionTypeLabel({ type, label }) {
  return (
    <span
      className={[
        'print-badge inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
        type === 'invoice' ? 'bg-primary/10 text-primary-700' : 'bg-emerald-500/10 text-emerald-700',
      ].join(' ')}
    >
      {label}
    </span>
  )
}

function AmountCell({ value, currency, locale }) {
  return (
    <span dir="ltr" className="inline-block min-w-[110px] whitespace-nowrap text-right tabular-nums">
      {formatCurrency(value, currency, locale)}
    </span>
  )
}

export default function CustomerStatementPrintPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? 'ar-EG' : 'en-US'
  const dir = isRtl ? 'rtl' : 'ltr'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', 'statement-print', id],
    queryFn: () => getPrintableCustomerStatement(id),
    enabled: !!id,
  })

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'customer-statement-print-styles'
    style.textContent = `
      @page { size: A4; margin: 15mm 20mm; }
      @media print {
        html, body {
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        *, *::before, *::after {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          page-break-inside: auto;
        }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr,
        .print-keep-together {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .print-table th {
          padding-top: 0;
          padding-bottom: 0.95rem;
        }
        .print-table td {
          padding-top: 0.9rem;
          padding-bottom: 0.9rem;
          vertical-align: top;
        }
        .print-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
        }
        .print-badge { white-space: nowrap; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  const tenantName = user?.tenant?.name ?? t('invoices.companyFallback')

  if (isLoading) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-gray-600">{t('common.somethingWentWrong')}</p>
          <button onClick={() => refetch()} className="text-primary text-sm underline">
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  const { customer, summary, transactions } = data
  const currency = transactions[0]?.currency ?? 'EGP'
  const startDate = searchParams.get('startDate') ?? searchParams.get('dateFrom')
  const endDate = searchParams.get('endDate') ?? searchParams.get('dateTo')
  const hasDateRange = !!startDate && !!endDate

  return (
    <div dir={dir} lang={i18n.language} className="min-h-screen bg-gray-100 print:bg-white font-sans">
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link
          to={ROUTES.CUSTOMER_STATEMENT(id)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
          {t('customers.printBack')}
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Printer size={15} />
          {t('invoices.print')}
        </button>
      </div>

      <div className="mx-auto my-8 print:my-0 max-w-[794px] print:max-w-full bg-white shadow-xl print:shadow-none">
        <div className="px-16 py-14 print:p-0">
          <div className="print-keep-together flex justify-between items-start mb-12 gap-8">
            <p className="max-w-[55%] text-xl font-bold text-gray-900 leading-tight">{tenantName}</p>
            <div className="text-end">
              <p className="text-4xl font-extrabold tracking-widest text-primary-700 leading-none">
                {t('customers.statement')}
              </p>
              <p className="text-sm font-semibold text-gray-500 mt-3 tracking-wide">{customer.name}</p>
            </div>
          </div>

          <div className="print-keep-together flex justify-between items-start gap-8 mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-2">
                {t('invoices.customer')}
              </p>
              <p className="text-base font-semibold text-gray-900 leading-tight">{customer.name}</p>
              {customer.email && <p className="text-sm text-gray-500 mt-0.5">{customer.email}</p>}
              {customer.phone && <p className="text-sm text-gray-500 mt-0.5">{customer.phone}</p>}
              {customer.address && <p className="text-sm text-gray-500 mt-0.5">{customer.address}</p>}
            </div>
            <div className="space-y-2 text-end">
              <div className="flex items-center justify-end gap-5">
                <span className="text-[11px] text-gray-400">{t('customers.printDate')}</span>
                <span dir="ltr" className="text-sm font-medium text-gray-800 tabular-nums">
                  {formatDate(new Date(), i18n.language)}
                </span>
              </div>
              {hasDateRange && (
                <div className="flex items-center justify-end gap-5">
                  <span className="text-[11px] text-gray-400">{t('common.period')}</span>
                  <span dir="ltr" className="text-sm font-medium text-gray-800 tabular-nums">
                    {formatDate(startDate, i18n.language)} - {formatDate(endDate, i18n.language)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-end gap-5">
                <span className="text-[11px] text-gray-400">{t('customers.outstandingBalance')}</span>
                <span className="text-sm font-semibold text-gray-900">
                  <AmountCell value={summary.outstandingBalance} currency={currency} locale={locale} />
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 mb-8" />

          <div className="print-keep-together print-summary-grid grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3 print:grid-cols-3">
            <SummaryCard
              label={t('customers.totalInvoiced')}
              value={formatCurrency(summary.totalInvoiced, currency, locale)}
            />
            <SummaryCard
              label={t('customers.totalPaid')}
              value={formatCurrency(summary.totalPaid, currency, locale)}
            />
            <SummaryCard
              label={t('customers.outstandingBalance')}
              value={formatCurrency(summary.outstandingBalance, currency, locale)}
            />
          </div>

          {transactions.length === 0 ? (
            <div className="print-keep-together border border-dashed border-gray-300 rounded-2xl px-6 py-10 text-center text-sm text-gray-500">
              {t('customers.statementEmptyDesc')}
            </div>
          ) : (
            <table className="print-table w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-start text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    {t('common.date')}
                  </th>
                  <th className="pb-3 text-start text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    {t('customers.transactionType')}
                  </th>
                  <th className="pb-3 text-start text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    {t('customers.reference')}
                  </th>
                  <th className="pb-3 text-end text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    {t('common.debit')}
                  </th>
                  <th className="pb-3 text-end text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    {t('common.credit')}
                  </th>
                  <th className="pb-3 text-end text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    {t('common.balance')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={transaction.journalEntryId || `${transaction.type}-${transaction.invoiceId}-${transaction.date}-${index}`}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 text-gray-600">
                      <span dir="ltr" className="tabular-nums">
                        {formatDate(transaction.date, i18n.language)}
                      </span>
                    </td>
                    <td className="py-3">
                      <TransactionTypeLabel
                        type={transaction.type}
                        label={transaction.type === 'invoice' ? t('customers.statementInvoice') : t('customers.statementPayment')}
                      />
                    </td>
                    <td className="py-3 font-medium text-gray-900">{transaction.reference}</td>
                    <td className="py-3 text-end text-gray-600">
                      <AmountCell value={transaction.debit} currency={transaction.currency ?? currency} locale={locale} />
                    </td>
                    <td className="py-3 text-end text-gray-600">
                      <AmountCell value={transaction.credit} currency={transaction.currency ?? currency} locale={locale} />
                    </td>
                    <td className="py-3 text-end font-semibold text-gray-900">
                      <AmountCell value={transaction.runningBalance} currency={transaction.currency ?? currency} locale={locale} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
