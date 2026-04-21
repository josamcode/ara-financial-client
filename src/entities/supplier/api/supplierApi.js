import client from '@/shared/api/client'

export const supplierApi = {
  list: (params) => client.get('/suppliers', { params }),
  getById: (id) => client.get(`/suppliers/${id}`),
  getBills: (id) => client.get(`/suppliers/${id}/bills`),
  getStatement: (id, params) => client.get(`/suppliers/${id}/statement`, { params }),
  create: (data) => client.post('/suppliers', data),
  update: (id, data) => client.patch(`/suppliers/${id}`, data),
  delete: (id) => client.delete(`/suppliers/${id}`),
}
