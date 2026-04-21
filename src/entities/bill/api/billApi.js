import apiClient from '@/shared/api/client'

export const billApi = {
  list: (params) => apiClient.get('/bills', { params }),
  getById: (id) => apiClient.get(`/bills/${id}`),
  create: (data) => apiClient.post('/bills', data),
}
