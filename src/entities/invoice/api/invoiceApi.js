import apiClient from '@/shared/api/client'

export const invoiceApi = {
  list: (params) =>
    apiClient.get('/invoices', { params }),

  exportList: (params) =>
    apiClient.get('/invoices/export', { params, responseType: 'blob' }),

  getById: (id) =>
    apiClient.get(`/invoices/${id}`),

  create: (data) =>
    apiClient.post('/invoices', data),

  update: (id, data) =>
    apiClient.patch(`/invoices/${id}`, data),

  send: (id, data) =>
    apiClient.post(`/invoices/${id}/send`, data),

  pay: (id, data) =>
    apiClient.post(`/invoices/${id}/pay`, data),

  email: (id) =>
    apiClient.post(`/invoices/${id}/email`),

  cancel: (id) =>
    apiClient.post(`/invoices/${id}/cancel`),

  bulkCancel: (ids) =>
    apiClient.post('/invoices/bulk/cancel', { ids }),

  remove: (id) =>
    apiClient.delete(`/invoices/${id}`),

  bulkRemove: (ids) =>
    apiClient.post('/invoices/bulk/delete', { ids }),
}
