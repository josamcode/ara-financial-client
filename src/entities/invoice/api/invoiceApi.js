import apiClient from '@/shared/api/client'

export const invoiceApi = {
  list: (params) =>
    apiClient.get('/invoices', { params }),

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

  cancel: (id) =>
    apiClient.post(`/invoices/${id}/cancel`),

  remove: (id) =>
    apiClient.delete(`/invoices/${id}`),
}
