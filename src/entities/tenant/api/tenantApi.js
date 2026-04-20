import apiClient from '@/shared/api/client'

export const tenantApi = {
  get: () =>
    apiClient.get('/tenants'),

  updateSettings: (data) =>
    apiClient.patch('/tenants/settings', data),

  completeSetup: () =>
    apiClient.post('/tenants/complete-setup'),
}
