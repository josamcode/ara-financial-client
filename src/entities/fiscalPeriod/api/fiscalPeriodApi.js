import apiClient from '@/shared/api/client'

export const fiscalPeriodApi = {
  list: (params) =>
    apiClient.get('/fiscal-periods', { params }),

  create: (data) =>
    apiClient.post('/fiscal-periods', data),
}
