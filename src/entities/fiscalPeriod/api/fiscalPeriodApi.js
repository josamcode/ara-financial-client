import apiClient from '@/shared/api/client'

export const fiscalPeriodApi = {
  list: (params) =>
    apiClient.get('/fiscal-periods', { params }),

  getById: (id) =>
    apiClient.get(`/fiscal-periods/${id}`),

  create: (data) =>
    apiClient.post('/fiscal-periods', data),

  close: (id) =>
    apiClient.post(`/fiscal-periods/${id}/close`),

  lock: (id) =>
    apiClient.post(`/fiscal-periods/${id}/lock`),

  reopen: (id) =>
    apiClient.post(`/fiscal-periods/${id}/reopen`),
}
