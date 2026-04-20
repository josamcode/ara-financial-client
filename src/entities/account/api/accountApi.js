import apiClient from '@/shared/api/client'

export const accountApi = {
  list: (params) =>
    apiClient.get('/accounts', { params }),

  tree: () =>
    apiClient.get('/accounts/tree'),

  getById: (id) =>
    apiClient.get(`/accounts/${id}`),

  create: (data) =>
    apiClient.post('/accounts', data),

  applyTemplate: () =>
    apiClient.post('/accounts/template'),

  update: (id, data) =>
    apiClient.patch(`/accounts/${id}`, data),

  remove: (id) =>
    apiClient.delete(`/accounts/${id}`),
}
