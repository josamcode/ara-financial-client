export function isArabicLanguage(language) {
  return String(language || '').startsWith('ar')
}

export function getAccountDisplayName(account, language) {
  if (!account) return ''

  return isArabicLanguage(language)
    ? account.nameAr || account.nameEn || account.name || account.code || ''
    : account.nameEn || account.nameAr || account.name || account.code || ''
}
