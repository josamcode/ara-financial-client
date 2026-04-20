import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { fiscalPeriodApi } from '@/entities/fiscalPeriod/api/fiscalPeriodApi'

const KEYS = {
  all: ['fiscalPeriods'],
  list: (params) => ['fiscalPeriods', 'list', params],
  detail: (id) => ['fiscalPeriods', 'detail', id],
}

function extractPeriod(response) {
  return response?.data?.period ?? response?.period ?? null
}

export function useFiscalPeriods(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => fiscalPeriodApi.list(params).then((response) => response?.data || []),
  })
}

export function useCloseFiscalPeriod() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => fiscalPeriodApi.close(id).then(extractPeriod),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      if (id) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      }
      toast.success(t('fiscalPeriods.periodClosed'))
    },
    onError: (error) => {
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}

export function useLockFiscalPeriod() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => fiscalPeriodApi.lock(id).then(extractPeriod),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      if (id) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      }
      toast.success(t('fiscalPeriods.periodLocked'))
    },
    onError: (error) => {
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}

export function useReopenFiscalPeriod() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => fiscalPeriodApi.reopen(id).then(extractPeriod),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      if (id) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      }
      toast.success(t('fiscalPeriods.periodReopened'))
    },
    onError: (error) => {
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}
