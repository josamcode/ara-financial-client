import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { paymentApi } from '@/entities/payment/api/paymentApi'

const KEYS = {
  all: ['payments'],
  list: (params) => ['payments', 'list', params],
  detail: (id) => ['payments', 'detail', id],
}

function extractPaymentResult(response) {
  const data = response?.data ?? response ?? {}
  const paymentAttempt = data.paymentAttempt ?? null

  return {
    paymentAttempt,
    paymentUrl: data.paymentUrl ?? paymentAttempt?.paymentUrl ?? '',
  }
}

function extractPaymentAttempt(response) {
  return response?.data?.paymentAttempt ?? response?.paymentAttempt ?? null
}

function extractVerifyResult(response) {
  const data = response?.data ?? response ?? {}

  return {
    paymentAttempt: data.paymentAttempt ?? null,
    verification: data.verification ?? null,
  }
}

export function usePaymentAttempts(params = {}, options = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => paymentApi.list(params),
    enabled: options.enabled ?? true,
  })
}

export function usePaymentAttempt(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => paymentApi.get(id).then(extractPaymentAttempt),
    enabled: !!id,
  })
}

export function useCreateMyFatoorahPayment() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload) =>
      paymentApi.createMyFatoorahPayment(payload).then(extractPaymentResult),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('payments.paymentCreated'))
    },
    onError: (error) => {
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}

export function useResolvePaymentByPaymentId(paymentId) {
  return useQuery({
    queryKey: ['payments', 'myfatoorah', 'resolve', paymentId],
    queryFn: () =>
      paymentApi.resolveByPaymentId(paymentId).then((res) => {
        const data = res?.data ?? res ?? {}
        return {
          status: data.status ?? 'failed',
          verified: data.verified ?? false,
          paymentAttempt: data.paymentAttempt ?? null,
          message: data.message ?? null,
        }
      }),
    enabled: !!paymentId,
    retry: 1,
    staleTime: 30_000,
  })
}

export function useVerifyPaymentAttempt() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => paymentApi.verify(id).then(extractVerifyResult),
    onSuccess: (data) => {
      const id = data?.paymentAttempt?._id
      if (id) {
        qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      }
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('payments.paymentVerified'))
    },
    onError: (error) => {
      toast.error(error?.message || t('common.somethingWentWrong'))
    },
  })
}
