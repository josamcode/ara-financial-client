import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { paymentApi } from '@/entities/payment/api/paymentApi'

function extractPaymentResult(response) {
  const data = response?.data ?? response ?? {}
  const paymentAttempt = data.paymentAttempt ?? null

  return {
    paymentAttempt,
    paymentUrl: data.paymentUrl ?? paymentAttempt?.paymentUrl ?? '',
  }
}

export function useCreateMyFatoorahPayment() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload) =>
      paymentApi.createMyFatoorahPayment(payload).then(extractPaymentResult),
    onSuccess: () => {
      toast.success(t('payments.paymentCreated'))
    },
    onError: (error) => {
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}
