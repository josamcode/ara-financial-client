import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { taxRateApi } from '@/entities/tax/api/taxRateApi'

const KEYS = {
  all: ['taxRates'],
  list: (params) => ['taxRates', 'list', params],
  detail: (id) => ['taxRates', 'detail', id],
}

function normalizeTaxRateList(response) {
  const payload = response ?? {}
  const data = payload.data ?? payload

  if (Array.isArray(data)) {
    return {
      taxRates: data,
      pagination: payload.meta?.pagination ?? null,
    }
  }

  return {
    taxRates: data.taxRates ?? data.rates ?? [],
    pagination: data.pagination ?? payload.meta?.pagination ?? null,
  }
}

function extractTaxRate(response) {
  return response?.data?.taxRate ?? response?.taxRate ?? response?.data ?? null
}

function getMutationErrorMessage(error, t) {
  return error?.message || t('common.somethingWentWrong')
}

export function useTaxRates(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => taxRateApi.list(params).then(normalizeTaxRateList),
    keepPreviousData: true,
  })
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data) => taxRateApi.create(data).then(extractTaxRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('taxRates.createSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }) => taxRateApi.update(id, data).then(extractTaxRate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) })
      }
      toast.success(t('taxRates.updateSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => taxRateApi.remove(id).then(extractTaxRate),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      if (id) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      }
      toast.success(t('taxRates.deleteSuccess'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}
