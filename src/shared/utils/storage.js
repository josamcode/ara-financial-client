const KEYS = {
  ACCESS_TOKEN: 'ara_access_token',
  REFRESH_TOKEN: 'ara_refresh_token',
  LANGUAGE: 'ara_language',
}

function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage unavailable
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Storage unavailable
  }
}

export const storage = {
  getAccessToken: () => safeGet(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => safeGet(KEYS.REFRESH_TOKEN),

  setTokens(accessToken, refreshToken) {
    safeSet(KEYS.ACCESS_TOKEN, accessToken)
    if (refreshToken) safeSet(KEYS.REFRESH_TOKEN, refreshToken)
  },

  clearTokens() {
    safeRemove(KEYS.ACCESS_TOKEN)
    safeRemove(KEYS.REFRESH_TOKEN)
  },

  getLanguage: () => safeGet(KEYS.LANGUAGE) || 'ar',
  setLanguage: (lang) => safeSet(KEYS.LANGUAGE, lang),
}
