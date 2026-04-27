export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ARA Financial'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
]

export const DEFAULT_LANGUAGE = 'ar'

export const DEFAULT_CURRENCY = 'SAR'

export const CURRENCIES = [
  { code: 'EGP', label: 'جنيه مصري', labelEn: 'Egyptian Pound' },
  { code: 'USD', label: 'دولار أمريكي', labelEn: 'US Dollar' },
  { code: 'EUR', label: 'يورو', labelEn: 'Euro' },
  { code: 'SAR', label: 'ريال سعودي', labelEn: 'Saudi Riyal' },
  { code: 'AED', label: 'درهم إماراتي', labelEn: 'UAE Dirham' },
]

export const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense']

export const JOURNAL_STATUSES = {
  DRAFT: 'draft',
  POSTED: 'posted',
  REVERSED: 'reversed',
}

export const FISCAL_PERIOD_STATUSES = {
  OPEN: 'open',
  CLOSED: 'closed',
  LOCKED: 'locked',
}

export const PAGINATION_DEFAULT = {
  page: 1,
  limit: 20,
}
