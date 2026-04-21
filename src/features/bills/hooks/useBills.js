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
