import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components/PageHeader'
import { ROUTES } from '@/shared/constants/routes'
import { BillForm } from '@/features/bills/components/BillForm'
import { useCreateBill } from '@/features/bills/hooks/useBills'

export default function BillNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateBill()

  async function handleSubmit(formData) {
    const bill = await createMutation.mutateAsync(formData)
    if (bill?._id) {
      navigate(ROUTES.BILL_DETAIL(bill._id))
      return
    }

    navigate(ROUTES.BILLS)
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <PageHeader
        title={t('bills.new')}
        breadcrumbs={[
          { label: t('nav.bills'), href: ROUTES.BILLS },
          { label: t('bills.new') },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface p-6">
        <BillForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
      </div>
    </div>
  )
}
