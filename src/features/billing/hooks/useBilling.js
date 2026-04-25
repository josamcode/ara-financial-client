import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { billingApi } from '@/entities/billing/api/billingApi'

const KEYS = {
  plans: ['billing', 'plans'],
  subscription: ['billing', 'subscription'],
  usage: ['billing', 'usage'],
}

function extractData(response) {
  return response?.data ?? response ?? null
}

export function useBillingPlans() {
  return useQuery({
    queryKey: KEYS.plans,
    queryFn: () => billingApi.getPlans().then(extractData),
  })
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: KEYS.subscription,
    queryFn: () =>
      billingApi.getSubscription().then((res) => {
        const data = res?.data ?? res ?? null
        return data?.subscription ?? null
      }),
  })
}

export function useBillingUsage() {
  return useQuery({
    queryKey: KEYS.usage,
    queryFn: () =>
      billingApi.getUsage().then((res) => {
        const data = res?.data ?? res ?? null
        return data?.data ?? data ?? null
      }),
  })
}

export function useCheckoutPlan() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload) => billingApi.checkout(payload).then(extractData),
    onSuccess: () => {
      toast.success(t('billing.checkoutStarted'))
    },
    onError: (error) => {
      if (error?.code === 'BILLING_CUSTOMER_EMAIL_REQUIRED') return
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}

export function useSyncBillingPayment() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (paymentAttemptId) => billingApi.syncPayment(paymentAttemptId).then(extractData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.subscription })
      toast.success(t('billing.syncPaymentSuccess'))
    },
    onError: (error) => {
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}
