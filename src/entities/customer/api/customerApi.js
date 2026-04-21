import client from '@/shared/api/client'

export const customerApi = {
  list: (params) => client.get('/customers', { params }),
  getById: (id) => client.get(`/customers/${id}`),
  getInvoices: (id) => client.get(`/customers/${id}/invoices`),
  create: (data) => client.post('/customers', data),
  update: (id, data) => client.patch(`/customers/${id}`, data),
  delete: (id) => client.delete(`/customers/${id}`),
}
