import apiClient from '@/shared/api/client'

export const reportApi = {
  getTrialBalance: (params) =>
    apiClient.get('/reports/trial-balance', { params }),
  exportTrialBalance: (params) =>
    apiClient.get('/reports/trial-balance/export', { params, responseType: 'blob' }),

  getIncomeStatement: (params) =>
    apiClient.get('/reports/income-statement', { params }),
  exportIncomeStatement: (params) =>
    apiClient.get('/reports/income-statement/export', { params, responseType: 'blob' }),

  getBalanceSheet: (params) =>
    apiClient.get('/reports/balance-sheet', { params }),
  exportBalanceSheet: (params) =>
    apiClient.get('/reports/balance-sheet/export', { params, responseType: 'blob' }),

  getCashFlow: (params) =>
    apiClient.get('/reports/cash-flow', { params }),
  exportCashFlow: (params) =>
    apiClient.get('/reports/cash-flow/export', { params, responseType: 'blob' }),
}
