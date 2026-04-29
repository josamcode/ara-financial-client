import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { currencyApi } from '@/entities/currency/api/currencyApi'

const KEYS = {
  all: ['currencies'],
  list: (params) => ['currencies', 'list', params],
}

function normalizeCurrencyList(response) {
  const payload = response ?? {}
  const data = payload.data ?? payload

  if (Array.isArray(data)) return data

  return data.currencies ?? data.items ?? data.data?.currencies ?? []
}

function extractCurrency(response) {
  return response?.data?.currency ?? response?.currency ?? response?.data ?? response ?? null
}

function getMutationErrorMessage(error, t) {
  return error?.message || t('common.somethingWentWrong')
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

export function useCurrencyList(params = {}) {
  const { isActive } = params
  const queryParams = isActive !== undefined && isActive !== '' ? { isActive } : {}

  return useQuery({
    queryKey: KEYS.list(queryParams),
    queryFn: () => currencyApi.list(queryParams).then(normalizeCurrencyList),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useCreateCurrency() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data) => currencyApi.create(data).then(extractCurrency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('currencies.createSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useUpdateCurrency() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ code, data }) => currencyApi.update(code, data).then(extractCurrency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('currencies.updateSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useSetCurrencyActiveStatus() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ code, isActive }) =>
      currencyApi.update(code, { isActive }).then(extractCurrency),
    onSuccess: (_currency, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      toast.success(
        t(variables.isActive ? 'currencies.activateSuccess' : 'currencies.deactivateSuccess')
      )
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}
