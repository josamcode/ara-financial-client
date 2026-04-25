import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { invoiceApi } from '@/entities/invoice/api/invoiceApi'

const KEYS = {
  all: ['invoices'],
  list: (params) => ['invoices', 'list', params],
  detail: (id) => ['invoices', 'detail', id],
}

function extractInvoice(response) {
  return response?.data?.invoice ?? response?.invoice ?? null
}

export function useInvoiceList(params = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => invoiceApi.list(params),
  })
}

export function useExportInvoices() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (params) => invoiceApi.exportList(params),
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useInvoice(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => invoiceApi.getById(id).then(extractInvoice),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data) => invoiceApi.create(data).then(extractInvoice),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.created'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }) => invoiceApi.update(id, data).then(extractInvoice),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.updated'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useSendInvoice() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }) => invoiceApi.send(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.sent'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function usePayInvoice() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }) => invoiceApi.pay(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.paid'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useEmailInvoice() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id) => invoiceApi.email(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success(t('invoices.emailSent'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useCancelInvoice() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id) => invoiceApi.cancel(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.cancelled'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useBulkCancelInvoices() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (ids) => invoiceApi.bulkCancel(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.bulkCancelled'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id) => invoiceApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.deleted'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}

export function useBulkDeleteInvoices() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (ids) => invoiceApi.bulkRemove(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('invoices.bulkDeleted'))
    },
    onError: (err) => toast.error(err?.message || t('common.somethingWentWrong')),
  })
}
