import apiClient from '@/shared/api/client'

export const paymentApi = {
  list: (params) =>
    apiClient.get('/payments', { params }),

  get: (id) =>
    apiClient.get(`/payments/${id}`),

  createMyFatoorahPayment: (payload) =>
    apiClient.post('/payments/myfatoorah/create', payload),

  verify: (id) =>
    apiClient.post(`/payments/${id}/verify`),
}
