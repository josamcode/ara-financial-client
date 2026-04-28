import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { exchangeRateApi } from '@/entities/exchangeRate/api/exchangeRateApi'

const KEYS = {
  all: ['exchange-rates'],
  list: (params) => ['exchange-rates', 'list', params],
  latest: (from, to, date) => ['exchange-rates', 'latest', from, to, date],
}

function normalizeExchangeRateList(response) {
  const payload = response ?? {}
  const data = payload.data ?? payload

  if (Array.isArray(data)) {
    return {
      exchangeRates: data,
      pagination: payload.meta?.pagination ?? null,
    }
  }

  return {
    exchangeRates: data.exchangeRates ?? data.rates ?? data.items ?? [],
    pagination: data.pagination ?? payload.meta?.pagination ?? null,
  }
}

function extractExchangeRate(response) {
  return response?.data?.exchangeRate ?? response?.exchangeRate ?? response?.data ?? null
}

function getMutationErrorMessage(error, t) {
  return error?.message || t('common.somethingWentWrong')
}

export function useExchangeRateList(params = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => exchangeRateApi.list(params).then(normalizeExchangeRateList),
    keepPreviousData: true,
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
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data) => exchangeRateApi.create(data).then(extractExchangeRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('exchangeRates.createSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useUpdateExchangeRate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }) => exchangeRateApi.update(id, data).then(extractExchangeRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('exchangeRates.updateSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useDeleteExchangeRate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => exchangeRateApi.remove(id).then(extractExchangeRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('exchangeRates.deactivateSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}
