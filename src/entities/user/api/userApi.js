import apiClient from '@/shared/api/client'

export const userApi = {
  list: (params) =>
    apiClient.get('/users', { params }),

  getById: (id) =>
    apiClient.get(`/users/${id}`),

  getProfile: () =>
    apiClient.get('/users/profile'),

  updateProfile: (data) =>
    apiClient.patch('/users/profile', data),

  invite: (data) =>
    apiClient.post('/users/invite', data),

  changeRole: (id, roleId) =>
    apiClient.patch(`/users/${id}/role`, { roleId }),

  deactivate: (id) =>
    apiClient.patch(`/users/${id}/deactivate`),
}
