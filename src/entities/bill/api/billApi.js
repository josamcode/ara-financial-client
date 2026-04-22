import apiClient from '@/shared/api/client'

export const billApi = {
  list: (params) => apiClient.get('/bills', { params }),
  exportList: (params) => apiClient.get('/bills/export', { params, responseType: 'blob' }),
  getById: (id) => apiClient.get(`/bills/${id}`),
  create: (data) => apiClient.post('/bills', data),
  post: (id, data) => apiClient.post(`/bills/${id}/post`, data),
  pay: (id, data) => apiClient.post(`/bills/${id}/pay`, data),
  cancel: (id) => apiClient.post(`/bills/${id}/cancel`),
  bulkCancel: (ids) => apiClient.post('/bills/bulk/cancel', { ids }),
}
