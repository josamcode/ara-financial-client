import { useQuery } from '@tanstack/react-query'
import { ledgerApi } from '@/entities/ledger/api/ledgerApi'

const KEYS = {
  all: ['ledger'],
  account: (accountId, params) => ['ledger', 'account', accountId, params],
  allLedger: (params) => ['ledger', 'all', params],
}

export function useAccountLedger(accountId, params) {
  return useQuery({
    queryKey: KEYS.account(accountId, params),
    queryFn: () => ledgerApi.getAccountLedger(accountId, params),
    enabled: !!accountId,
    keepPreviousData: true,
  })
}

export function useAllLedger(params) {
  return useQuery({
    queryKey: KEYS.allLedger(params),
    queryFn: () => ledgerApi.getAllLedger(params),
  })
}
