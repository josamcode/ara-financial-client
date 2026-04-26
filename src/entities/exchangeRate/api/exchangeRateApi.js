import apiClient from '@/shared/api/client'

export const exchangeRateApi = {
  list: (params) => apiClient.get('/exchange-rates', { params }),
  create: (data) => apiClient.post('/exchange-rates', data),
  getLatest: ({ from, to, date }) =>
    apiClient.get('/exchange-rates/latest', { params: { from, to, ...(date ? { date } : {}) } }),
  update: (id, data) => apiClient.patch(`/exchange-rates/${id}`, data),
  remove: (id) => apiClient.delete(`/exchange-rates/${id}`),
}
