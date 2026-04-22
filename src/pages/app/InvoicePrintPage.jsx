import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer, ArrowLeft, ArrowRight } from 'lucide-react'
import { useInvoice } from '@/features/invoices/hooks/useInvoices'
import { useAuth } from '@/entities/auth/model/useAuth'
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge'
import { formatDate, formatCurrency } from '@/shared/utils/formatters'
import { ROUTES } from '@/shared/constants/routes'

export default function InvoicePrintPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? 'ar-EG' : 'en-US'
  const dir = isRtl ? 'rtl' : 'ltr'

  const { data: invoice, isLoading, isError, refetch } = useInvoice(id)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'invoice-print-styles'
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

  if (isError || !invoice) {
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

  const totalAmount = Number(invoice.total ?? 0)
  const paidAmount =
    typeof invoice.paidAmount === 'number'
      ? invoice.paidAmount
      : invoice.status === 'paid'
        ? totalAmount
        : 0
  const remainingAmount =
    typeof invoice.remainingAmount === 'number'
      ? invoice.remainingAmount
      : Math.max(totalAmount - paidAmount, 0)

  return (
    <div dir={dir} lang={i18n.language} className="min-h-screen bg-gray-100 print:bg-white font-sans">
      {/* ─── Toolbar (screen only) ─── */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link
          to={ROUTES.INVOICE_DETAIL(id)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isRtl ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
          {t('invoices.printBack')}
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Printer size={15} />
          {t('invoices.print')}
        </button>
      </div>

      {/* ─── Paper ─── */}
      <div className="mx-auto my-8 print:my-0 max-w-[794px] print:max-w-full bg-white shadow-xl print:shadow-none">
        <div className="px-16 py-14 print:p-0">

          {/* Header */}
          <div className="print-keep-together flex justify-between items-start gap-8 mb-12">
            <p className="max-w-[55%] text-xl font-bold text-gray-900 leading-tight">{tenantName}</p>
            <div className="text-end">
              <p className="text-4xl font-extrabold uppercase tracking-widest text-primary-700 leading-none">
                {t('invoices.documentTitle')}
              </p>
              <p className="text-sm font-semibold text-gray-500 mt-3 tracking-wider">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Customer + Meta */}
          <div className="print-keep-together flex justify-between items-start gap-8 mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-2">
                {t('invoices.customer')}
              </p>
              <p className="text-base font-semibold text-gray-900 leading-tight">
                {invoice.customerName}
              </p>
              {invoice.customerEmail && (
                <p className="text-sm text-gray-500 mt-0.5">{invoice.customerEmail}</p>
              )}
            </div>
            <div className="space-y-2 text-end">
              <div className="flex items-center justify-end gap-5">
                <span className="text-[11px] text-gray-400">{t('invoices.issueDate')}</span>
                <span className="text-sm font-medium text-gray-800 tabular-nums">
                  {formatDate(invoice.issueDate, i18n.language)}
                </span>
              </div>
              <div className="flex items-center justify-end gap-5">
                <span className="text-[11px] text-gray-400">{t('invoices.dueDate')}</span>
                <span className="text-sm font-medium text-gray-800 tabular-nums">
                  {formatDate(invoice.dueDate, i18n.language)}
                </span>
              </div>
              <div className="flex justify-end mt-1">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-8" />

          {/* Line items */}
          <table className="print-table w-full text-sm mb-8">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-start text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  {t('common.description')}
                </th>
                <th className="pb-3 text-end text-[10px] uppercase tracking-widest text-gray-400 font-semibold w-14">
                  {t('invoices.qty')}
                </th>
                <th className="pb-3 text-end text-[10px] uppercase tracking-widest text-gray-400 font-semibold w-32">
                  {t('invoices.unitPrice')}
                </th>
                <th className="pb-3 text-end text-[10px] uppercase tracking-widest text-gray-400 font-semibold w-32">
                  {t('invoices.lineTotal')}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr
                  key={item._id ?? index}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-3 text-gray-800 leading-6">{item.description}</td>
                  <td className="py-3 text-end text-gray-500 tabular-nums whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-end text-gray-500 tabular-nums whitespace-nowrap">
                    {formatCurrency(item.unitPrice, invoice.currency, locale)}
                  </td>
                  <td className="py-3 text-end font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                    {formatCurrency(item.lineTotal, invoice.currency, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="print-keep-together flex justify-end mb-8">
            <div className="w-72 space-y-2.5">
              <div className="flex items-baseline justify-between gap-6 text-sm text-gray-600">
                <span>{t('invoices.subtotal')}</span>
                <span className="tabular-nums font-medium whitespace-nowrap">
                  {formatCurrency(invoice.subtotal, invoice.currency, locale)}
                </span>
              </div>
              {paidAmount > 0 && (
                <div className="flex items-baseline justify-between gap-6 text-sm text-gray-600">
                  <span>{t('invoices.paidAmount')}</span>
                  <span className="tabular-nums font-medium whitespace-nowrap">
                    {formatCurrency(paidAmount, invoice.currency, locale)}
                  </span>
                </div>
              )}
              {remainingAmount > 0 && remainingAmount !== totalAmount && (
                <div className="flex items-baseline justify-between gap-6 text-sm text-gray-600">
                  <span>{t('invoices.remainingAmount')}</span>
                  <span className="tabular-nums font-medium whitespace-nowrap">
                    {formatCurrency(remainingAmount, invoice.currency, locale)}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-6 border-t-2 border-gray-900 pt-3 mt-1">
                <span className="text-base font-bold text-gray-900">{t('invoices.total')}</span>
                <span className="text-lg font-bold text-gray-900 tabular-nums whitespace-nowrap">
                  {formatCurrency(invoice.total, invoice.currency, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="print-keep-together border-t border-gray-200 pt-6">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mb-2">
                {t('common.notes')}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{invoice.notes}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
