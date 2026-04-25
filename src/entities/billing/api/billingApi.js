import apiClient from '@/shared/api/client'

export const billingApi = {
  getPlans: () => apiClient.get('/billing/plans'),
  getSubscription: () => apiClient.get('/billing/subscription'),
  checkout: (payload) => apiClient.post('/billing/checkout', payload),
  syncPayment: (paymentAttemptId) => apiClient.post(`/billing/sync-payment/${paymentAttemptId}`),
}
