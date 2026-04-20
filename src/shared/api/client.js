import axios from 'axios'
import { storage } from '../utils/storage'
import { API_BASE_URL } from '../constants/app'
import { formatApiErrorMessage } from '../utils/errorMessages'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// --- Request: attach access token ---
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Response: normalize data + handle 401 with token refresh ---
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = storage.getRefreshToken()

      if (!refreshToken) {
        storage.clearTokens()
        window.dispatchEvent(new CustomEvent('ara:auth:logout'))
        return Promise.reject(normalizeError(error))
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        storage.setTokens(accessToken, newRefreshToken)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        storage.clearTokens()
        window.dispatchEvent(new CustomEvent('ara:auth:logout'))
        return Promise.reject(normalizeError(refreshError))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(normalizeError(error))
  }
)

function normalizeError(error) {
  if (error.response?.data?.error) {
    const { code, message, errors } = error.response.data.error
    const err = new Error(formatApiErrorMessage(message, errors, code) || 'An error occurred')
    err.code = code
    err.backendMessage = message
    err.fieldErrors = errors || []
    err.status = error.response.status
    return err
  }
  if (!error.response) {
    const err = new Error('Network error')
    err.code = 'NETWORK_ERROR'
    return err
  }
  return error
}

export default apiClient
