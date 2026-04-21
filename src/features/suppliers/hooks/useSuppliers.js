import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { supplierApi } from '@/entities/supplier/api/supplierApi'

const SUPPLIERS_KEY = 'suppliers'

export function useSupplierList(params = {}) {
  return useQuery({
    queryKey: [SUPPLIERS_KEY, params],
    queryFn: () => supplierApi.list(params).then((response) => response.data),
  })
}

export function useAllSuppliers() {
  return useQuery({
    queryKey: [SUPPLIERS_KEY, 'all'],
    queryFn: () => supplierApi.list({ limit: 200 }).then((response) => response.data),
    staleTime: 30_000,
  })
}

export function useCreateSupplier() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data) => supplierApi.create(data).then((response) => response.data.supplier),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] })
      toast.success(t('suppliers.createSuccess'))
    },
    onError: (error) => toast.error(error.message || t('common.somethingWentWrong')),
  })
}

export function useUpdateSupplier() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => supplierApi.update(id, data).then((response) => response.data.supplier),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] })
      toast.success(t('suppliers.updateSuccess'))
    },
    onError: (error) => toast.error(error.message || t('common.somethingWentWrong')),
  })
}

export function useDeleteSupplier() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id) => supplierApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] })
      toast.success(t('suppliers.deleteSuccess'))
    },
    onError: (error) => toast.error(error.message || t('common.somethingWentWrong')),
  })
}
