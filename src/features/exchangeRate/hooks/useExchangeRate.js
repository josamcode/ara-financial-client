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
  return response?.data?.exchangeRate ?? response?.exchangeRate ?? response?.data ?? response ?? null
}

function getMutationErrorMessage(error, t) {
  return error?.message || t('common.somethingWentWrong')
}

function createLookupMissError(message = 'Exchange rate not found') {
  const error = new Error(message)
  error.code = 'EXCHANGE_RATE_NOT_FOUND'
  return error
}

function isLookupMiss(error) {
  const status = error?.status ?? error?.response?.status
  return error?.code === 'EXCHANGE_RATE_NOT_FOUND' || status === 404 || status === 304
}

function getRateNumber(record) {
  const numericRate = Number(record?.rate)
  return Number.isFinite(numericRate) && numericRate > 0 ? numericRate : null
}

function formatInverseRate(rate) {
  return (1 / rate).toFixed(10)
}

async function getLatestExchangeRateRecord({ from, to, date }) {
  const response = await exchangeRateApi.getLatest({ from, to, date })
  const record = extractExchangeRate(response)

  if (!getRateNumber(record)) {
    throw createLookupMissError()
  }

  return record
}

export async function resolveLatestExchangeRate({ documentCurrency, baseCurrency, date }) {
  if (!documentCurrency || !baseCurrency) return null

  if (documentCurrency === baseCurrency) {
    return {
      mode: 'same',
      exchangeRate: '1',
      record: {
        fromCurrency: documentCurrency,
        toCurrency: baseCurrency,
        rate: '1',
        effectiveDate: date,
        source: 'company_rate',
        provider: null,
      },
    }
  }

  try {
    const record = await getLatestExchangeRateRecord({
      from: documentCurrency,
      to: baseCurrency,
      date,
    })

    return {
      mode: 'exact',
      exchangeRate: String(record.rate),
      record,
      from: documentCurrency,
      to: baseCurrency,
    }
  } catch (exactError) {
    if (!isLookupMiss(exactError)) {
      throw exactError
    }
  }

  try {
    const record = await getLatestExchangeRateRecord({
      from: baseCurrency,
      to: documentCurrency,
      date,
    })
    const numericRate = getRateNumber(record)

    return {
      mode: 'inverted',
      exchangeRate: formatInverseRate(numericRate),
      record,
      from: baseCurrency,
      to: documentCurrency,
    }
  } catch (reverseError) {
    if (isLookupMiss(reverseError)) {
      throw createLookupMissError()
    }

    throw reverseError
  }
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
