import apiClient from '@/shared/api/client'

export const currencyApi = {
  list: (params) => apiClient.get('/currencies', { params }),
  getByCode: (code) => apiClient.get(`/currencies/${code}`),
}
