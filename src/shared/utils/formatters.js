import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import 'dayjs/locale/en'

export function formatDate(value, locale = 'ar', format = 'DD/MM/YYYY') {
  if (!value) return '—'
  return dayjs(value).locale(locale).format(format)
}

export function formatDateTime(value, locale = 'ar') {
  if (!value) return '—'
  return dayjs(value).locale(locale).format('DD/MM/YYYY HH:mm')
}

export function formatRelativeTime(value, locale = 'ar') {
  if (!value) return '—'
  return dayjs(value).locale(locale).fromNow()
}

export function formatCurrency(amount, currency = 'EGP', locale = 'ar-EG') {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

export function formatNumber(value, locale = 'ar-EG', decimals = 2) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value))
}

export function formatAccountingAmount(value, locale = 'ar-EG') {
  if (value === null || value === undefined) return '—'
  const num = Number(value)
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num))
}
