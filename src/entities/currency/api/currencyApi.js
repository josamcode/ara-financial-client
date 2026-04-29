import apiClient from '@/shared/api/client'

export const currencyApi = {
  list: (params) => apiClient.get('/currencies', { params }),
  getByCode: (code) => apiClient.get(`/currencies/${code}`),
  create: (data) => apiClient.post('/currencies', data),
  update: (code, data) => apiClient.patch(`/currencies/${code}`, data),
}
