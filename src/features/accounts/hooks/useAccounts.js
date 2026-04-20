import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountApi } from '@/entities/account/api/accountApi'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const KEYS = {
  all: ['accounts'],
  list: (params) => ['accounts', 'list', params],
  tree: () => ['accounts', 'tree'],
  detail: (id) => ['accounts', 'detail', id],
}

function normalizeAccount(account) {
  if (!account) return account

  return {
    ...account,
    name: account.name ?? account.nameEn ?? account.nameAr ?? '',
  }
}

function normalizeAccountTree(nodes = []) {
  return nodes.map((node) => ({
    ...normalizeAccount(node),
    children: normalizeAccountTree(node.children || []),
  }))
}

export function useAccountTree() {
  return useQuery({
    queryKey: KEYS.tree(),
    queryFn: () => accountApi.tree().then((r) => normalizeAccountTree(r.data || [])),
  })
}

export function useAccountList(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => accountApi.list(params).then((r) => (r.data || []).map(normalizeAccount)),
  })
}

export function useAccountById(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => accountApi.getById(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data) => accountApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('accounts.accountCreated'))
    },
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }) => accountApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('accounts.accountUpdated'))
    },
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id) => accountApi.remove(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('accounts.accountDeleted'))
    },
  })
}

export function useApplyTemplate() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: () => accountApi.applyTemplate(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('accounts.templateApplied'))
    },
  })
}

export function useToggleAccountActive() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, isActive }) => accountApi.update(id, { isActive }).then((r) => r.data),
    onSuccess: (data) => {
      const account = data?.account ?? data
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(
        account?.isActive ? t('accounts.accountActivated') : t('accounts.accountDeactivated')
      )
    },
  })
}
