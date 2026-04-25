import apiClient from '@/shared/api/client'

export const paymentApi = {
  createMyFatoorahPayment: (payload) =>
    apiClient.post('/payments/myfatoorah/create', payload),
}
