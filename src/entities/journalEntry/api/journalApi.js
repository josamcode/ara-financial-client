import apiClient from '@/shared/api/client'

export const journalApi = {
  list: (params) =>
    apiClient.get('/journal-entries', { params }),

  getById: (id) =>
    apiClient.get(`/journal-entries/${id}`),

  create: (data) =>
    apiClient.post('/journal-entries', data),

  update: (id, data) =>
    apiClient.patch(`/journal-entries/${id}`, data),

  post: (id) =>
    apiClient.post(`/journal-entries/${id}/post`),

  reverse: (id) =>
    apiClient.post(`/journal-entries/${id}/reverse`),

  remove: (id) =>
    apiClient.delete(`/journal-entries/${id}`),
}
