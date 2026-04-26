import { useQuery } from '@tanstack/react-query'
import { currencyApi } from '@/entities/currency/api/currencyApi'

const KEYS = {
  all: ['currencies'],
  list: (params) => ['currencies', 'list', params],
}

export function useCurrencies(params = {}) {
  // Currency endpoint only accepts: isActive (no limit/pagination)
  const { isActive } = params
  const queryParams = isActive !== undefined ? { isActive } : {}

  return useQuery({
    queryKey: KEYS.list(queryParams),
    queryFn: () => currencyApi.list(queryParams),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
