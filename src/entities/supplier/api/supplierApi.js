import client from '@/shared/api/client'

export const supplierApi = {
  list: (params) => client.get('/suppliers', { params }),
  getById: (id) => client.get(`/suppliers/${id}`),
  create: (data) => client.post('/suppliers', data),
  update: (id, data) => client.patch(`/suppliers/${id}`, data),
  delete: (id) => client.delete(`/suppliers/${id}`),
}
