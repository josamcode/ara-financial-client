import apiClient from '@/shared/api/client'

export const tenantApi = {
  get: () =>
    apiClient.get('/tenants'),

  updateSettings: (data) =>
    apiClient.patch('/tenants/settings', data),

  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append('logo', file)

    return apiClient.post('/tenants/logo', formData)
  },

  completeSetup: () =>
    apiClient.post('/tenants/complete-setup'),
}
