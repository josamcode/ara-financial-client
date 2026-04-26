import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/entities/user/api/userApi'

const KEYS = {
  all: ['users'],
  list: (params) => ['users', 'list', params],
  detail: (id) => ['users', 'detail', id],
}

const BILLING_WRITE_ERROR_KEYS = {
  PLAN_LIMIT_EXCEEDED: 'planLimit.error.planLimitExceeded',
  SUBSCRIPTION_REQUIRED: 'planLimit.error.subscriptionRequired',
  SUBSCRIPTION_INACTIVE: 'planLimit.error.subscriptionInactive',
}

function extractUser(response) {
  return response?.data?.user ?? response?.user ?? null
}

function getMutationErrorMessage(error, t) {
  const billingErrorKey = BILLING_WRITE_ERROR_KEYS[error?.code]
  if (billingErrorKey) return t(billingErrorKey)
  return error?.message || t('common.somethingWentWrong')
}

export function useUsers(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () =>
      userApi.list(params).then((response) => ({
        users: response?.data || [],
        pagination: response?.meta?.pagination ?? null,
      })),
    keepPreviousData: true,
  })
}

export function useChangeUserRole() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, roleName }) => userApi.changeRole(id, roleName).then(extractUser),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(variables.id) })
      }
      toast.success(t('users.roleChanged'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data) => userApi.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id) => userApi.deactivate(id).then(extractUser),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all })
      if (id) {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(id) })
      }
      toast.success(t('users.userDeactivated'))
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, t))
    },
  })
}
