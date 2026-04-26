import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { exchangeRateApi } from '@/entities/exchangeRate/api/exchangeRateApi'

const KEYS = {
  all: ['exchange-rates'],
  list: (params) => ['exchange-rates', 'list', params],
  latest: (from, to, date) => ['exchange-rates', 'latest', from, to, date],
}

export function useExchangeRateList(params = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => exchangeRateApi.list(params),
  })
}

export function useLatestExchangeRate({ from, to, date, enabled = false }) {
  return useQuery({
    queryKey: KEYS.latest(from, to, date),
    queryFn: () => exchangeRateApi.getLatest({ from, to, date }),
    enabled: enabled && !!from && !!to,
    retry: false,
    staleTime: 60_000,
  })
}

export function useCreateExchangeRate() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data) => exchangeRateApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('multiCurrency.rateLoaded'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}
