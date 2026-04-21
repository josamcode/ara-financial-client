import { useQuery } from '@tanstack/react-query'
import { reportApi } from '@/entities/report/api/reportApi'

const KEYS = {
  trialBalance: (params) => ['reports', 'trial-balance', params],
  incomeStatement: (params) => ['reports', 'income-statement', params],
  balanceSheet: (params) => ['reports', 'balance-sheet', params],
  cashFlow: (params) => ['reports', 'cash-flow', params],
  arAging: (params) => ['reports', 'ar-aging', params],
  apAging: (params) => ['reports', 'ap-aging', params],
}

export function useTrialBalance(params) {
  return useQuery({
    queryKey: KEYS.trialBalance(params),
    queryFn: () => reportApi.getTrialBalance(params),
    enabled: !!params,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  })
}

export function useIncomeStatement(params) {
  return useQuery({
    queryKey: KEYS.incomeStatement(params),
    queryFn: () => reportApi.getIncomeStatement(params),
    enabled: !!params,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  })
}

export function useBalanceSheet(params) {
  return useQuery({
    queryKey: KEYS.balanceSheet(params),
    queryFn: () => reportApi.getBalanceSheet(params),
    enabled: !!params,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCashFlow(params) {
  return useQuery({
    queryKey: KEYS.cashFlow(params),
    queryFn: () => reportApi.getCashFlow(params),
    enabled: !!params,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  })
}

export function useARAging(params) {
  return useQuery({
    queryKey: KEYS.arAging(params),
    queryFn: () => reportApi.getARAging(params),
    enabled: !!params,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAPAging(params) {
  return useQuery({
    queryKey: KEYS.apAging(params),
    queryFn: () => reportApi.getAPAging(params),
    enabled: !!params,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  })
}
