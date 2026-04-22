import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { billApi } from '@/entities/bill/api/billApi'

const KEYS = {
  all: ['bills'],
  list: (params) => ['bills', 'list', params],
  detail: (id) => ['bills', 'detail', id],
}

function extractBill(response) {
  return response?.data?.bill ?? response?.bill ?? null
}

export function useBillList(params = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => billApi.list(params),
  })
}

export function useExportBills() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (params) => billApi.exportList(params),
    onError: (error) => toast.error(error?.message || t('common.somethingWentWrong')),
  })
}

export function useBill(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => billApi.getById(id).then(extractBill),
    enabled: !!id,
  })
}

export function useCreateBill() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data) => billApi.create(data).then(extractBill),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('bills.created'))
    },
    onError: (error) => toast.error(error?.message || t('common.somethingWentWrong')),
  })
}

export function usePostBill() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }) => billApi.post(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('bills.posted'))
    },
    onError: (error) => toast.error(error?.message || t('common.somethingWentWrong')),
  })
}

export function usePayBill() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }) => billApi.pay(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('bills.paid'))
    },
    onError: (error) => toast.error(error?.message || t('common.somethingWentWrong')),
  })
}

export function useCancelBill() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => billApi.cancel(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('bills.cancelled'))
    },
    onError: (error) => toast.error(error?.message || t('common.somethingWentWrong')),
  })
}

export function useBulkCancelBills() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids) => billApi.bulkCancel(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('bills.bulkCancelled'))
    },
    onError: (error) => toast.error(error?.message || t('common.somethingWentWrong')),
  })
}
