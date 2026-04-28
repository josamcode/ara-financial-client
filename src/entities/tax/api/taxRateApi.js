import apiClient from '@/shared/api/client'

export const taxRateApi = {
  list: (params) =>
    apiClient.get('/tax-rates', { params }),

  getById: (id) =>
    apiClient.get(`/tax-rates/${id}`),

  create: (data) =>
    apiClient.post('/tax-rates', data),

  update: (id, data) =>
    apiClient.patch(`/tax-rates/${id}`, data),

  remove: (id) =>
    apiClient.delete(`/tax-rates/${id}`),
}
