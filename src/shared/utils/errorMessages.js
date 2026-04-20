import i18n from '../../app/i18n'

const fieldTranslationKeys = {
  code: 'validation.fields.code',
  name: 'validation.fields.name',
  nameAr: 'validation.fields.nameAr',
  nameEn: 'validation.fields.nameEn',
  type: 'validation.fields.type',
  parentId: 'validation.fields.parentId',
  date: 'validation.fields.date',
  description: 'validation.fields.description',
  reference: 'validation.fields.reference',
  lines: 'validation.fields.lines',
  accountId: 'validation.fields.accountId',
  debit: 'validation.fields.debit',
  credit: 'validation.fields.credit',
  email: 'validation.fields.email',
  password: 'validation.fields.password',
  confirmPassword: 'validation.fields.confirmPassword',
  companyName: 'validation.fields.companyName',
  currency: 'validation.fields.currency',
  token: 'validation.fields.token',
  refreshToken: 'validation.fields.refreshToken',
  roleId: 'validation.fields.roleId',
  id: 'validation.fields.id',
}

function prettifyField(field) {
  if (!field) return ''

  return field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function translateField(field) {
  if (!field) return ''

  const normalizedField = field.replace(/\[(\d+)\]/g, '.$1')
  const lineMatch = normalizedField.match(/^lines\.(\d+)\.(.+)$/)

  if (lineMatch) {
    const lineNumber = Number(lineMatch[1]) + 1
    const nestedField = translateField(lineMatch[2])
    return i18n.t('validation.lineField', { line: lineNumber, field: nestedField })
  }

  const fieldKey = normalizedField.split('.').pop()
  const translationKey = fieldTranslationKeys[normalizedField] ?? fieldTranslationKeys[fieldKey]

  if (translationKey && i18n.exists(translationKey)) {
    return i18n.t(translationKey)
  }

  return prettifyField(fieldKey)
}

function formatFieldMessage(field, key, values = {}) {
  const translatedField = translateField(field)
  return i18n.t(key, { field: translatedField, ...values })
}

function translateValidationError(field, message) {
  if (!message) {
    return field ? formatFieldMessage(field, 'validation.invalidValueField') : ''
  }

  let match = message.match(/^Invalid input: expected [^,]+, received undefined$/i)
  if (match) {
    return formatFieldMessage(field, 'validation.requiredField')
  }

  match = message.match(/^Invalid input: expected string, received .+$/i)
  if (match) {
    return formatFieldMessage(field, 'validation.invalidStringField')
  }

  match = message.match(/^Invalid input: expected number, received .+$/i)
  if (match) {
    return formatFieldMessage(field, 'validation.invalidNumberField')
  }

  match = message.match(/^Invalid input: expected boolean, received .+$/i)
  if (match) {
    return formatFieldMessage(field, 'validation.invalidBooleanField')
  }

  match = message.match(/^Invalid input: expected array, received .+$/i)
  if (match) {
    return formatFieldMessage(field, 'validation.invalidArrayField')
  }

  match = message.match(/^Too small: expected string to have >=(\d+) characters$/i)
  if (match) {
    const min = Number(match[1])
    return min <= 1
      ? formatFieldMessage(field, 'validation.requiredField')
      : formatFieldMessage(field, 'validation.minLengthField', { min })
  }

  match = message.match(/^Too big: expected string to have <=(\d+) characters$/i)
  if (match) {
    return formatFieldMessage(field, 'validation.maxLengthField', { max: Number(match[1]) })
  }

  if (/^(Valid email is required|Invalid email address)$/i.test(message)) {
    return formatFieldMessage(field || 'email', 'validation.invalidEmailField')
  }

  match = message.match(/^(.+?) must be at least (\d+) characters$/i)
  if (match) {
    const min = Number(match[2])
    return formatFieldMessage(field || match[1], 'validation.minLengthField', { min })
  }

  if (/^Refresh token must be a non-empty string$/i.test(message)) {
    return formatFieldMessage(field || 'refreshToken', 'validation.requiredField')
  }

  match = message.match(/^(.+?) is required$/i)
  if (match) {
    return formatFieldMessage(field || match[1], 'validation.requiredField')
  }

  if (/^Valid date is required$/i.test(message)) {
    return formatFieldMessage(field || 'date', 'validation.validDateField')
  }

  if (/^Amount must be a valid decimal number \(up to 6 decimal places\)$/i.test(message)) {
    return formatFieldMessage(field, 'validation.decimalField')
  }

  match = message.match(/^A journal entry must have at least (\d+) lines$/i)
  if (match) {
    return formatFieldMessage(field || 'lines', 'validation.minItemsField', {
      count: Number(match[1]),
    })
  }

  if (/must be a valid ObjectId$/i.test(message)) {
    return formatFieldMessage(field || 'id', 'validation.invalidIdField')
  }

  const translatedField = translateField(field)
  return translatedField ? `${translatedField}: ${message}` : message
}

export function formatApiErrorMessage(message, errors, code) {
  if (Array.isArray(errors) && errors.length > 0) {
    const detailedMessages = errors
      .map((item) => translateValidationError(item?.field, item?.message))
      .filter(Boolean)

    if (detailedMessages.length > 0) {
      return detailedMessages.join('\n')
    }
  }

  if (message === 'Network error') {
    return i18n.t('errors.networkError')
  }

  if (code === 'VALIDATION_ERROR') {
    return i18n.t('errors.validationError')
  }

  return message
}
