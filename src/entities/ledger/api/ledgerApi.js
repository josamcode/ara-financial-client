import apiClient from '@/shared/api/client'

export const ledgerApi = {
  getAccountLedger: (accountId, params) =>
    apiClient.get(`/ledger/${accountId}`, { params }),

  getAllLedger: (params) =>
    apiClient.get('/ledger', { params }),

  exportAccountLedger: (accountId, params) =>
    apiClient.get(`/ledger/${accountId}/export`, { params, responseType: 'blob' }),
}
