import apiClient from '@/shared/api/client'

export const auditApi = {
  list: (params) =>
    apiClient.get('/audit-logs', { params }),
}
