import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/PageHeader'
import { ROUTES } from '@/shared/constants/routes'
import { useCreateInvoice } from '@/features/invoices/hooks/useInvoices'
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm'

export default function InvoiceNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateInvoice()

  async function handleSubmit(formData) {
    const invoice = await createMutation.mutateAsync(formData)
    if (invoice?._id) {
      navigate(ROUTES.INVOICE_DETAIL(invoice._id))
    } else {
      navigate(ROUTES.INVOICES)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <PageHeader
        title={t('invoices.new')}
        breadcrumbs={[
          { label: t('nav.invoices'), href: ROUTES.INVOICES },
          { label: t('invoices.new') },
        ]}
      />
      <div className="bg-surface rounded-lg border border-border p-6">
        <InvoiceForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  )
}
