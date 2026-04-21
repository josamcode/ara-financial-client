import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '@/entities/customer/api/customerApi'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const CUSTOMERS_KEY = 'customers'

export function useCustomerDetail(id) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, 'detail', id],
    queryFn: () => customerApi.getInvoices(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCustomerList(params = {}) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, params],
    queryFn: () => customerApi.list(params).then((r) => r.data),
  })
}

export function useAllCustomers() {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, 'all'],
    queryFn: () => customerApi.list({ limit: 200 }).then((r) => r.data),
    staleTime: 30_000,
  })
}

export function useCreateCustomer() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => customerApi.create(data).then((r) => r.data.customer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] })
      toast.success(t('customers.createSuccess'))
    },
    onError: (err) => toast.error(err.message || t('common.somethingWentWrong')),
  })
}

export function useUpdateCustomer() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => customerApi.update(id, data).then((r) => r.data.customer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] })
      toast.success(t('customers.updateSuccess'))
    },
    onError: (err) => toast.error(err.message || t('common.somethingWentWrong')),
  })
}

export function useDeleteCustomer() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => customerApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] })
      toast.success(t('customers.deleteSuccess'))
    },
    onError: (err) => toast.error(err.message || t('common.somethingWentWrong')),
  })
}
