import apiClient from '@/shared/api/client'

export const authApi = {
  login: (credentials) =>
    apiClient.post('/auth/login', credentials),

  register: (data) =>
    apiClient.post('/auth/register', data),

  logout: (refreshToken) =>
    apiClient.post('/auth/logout', { refreshToken }),

  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data) =>
    apiClient.post('/auth/reset-password', data),

  acceptInvite: (data) =>
    apiClient.post('/auth/accept-invite', data),

  getMe: () =>
    apiClient.get('/auth/me'),

  refresh: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken }),
}
