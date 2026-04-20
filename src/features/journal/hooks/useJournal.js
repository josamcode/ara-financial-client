import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { journalApi } from '@/entities/journalEntry/api/journalApi'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const KEYS = {
  all: ['journal'],
  list: (params) => ['journal', 'list', params],
  detail: (id) => ['journal', 'detail', id],
}

export function useJournalList(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => journalApi.list(params).then((r) => r.data),
  })
}

export function useJournalById(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => journalApi.getById(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateJournal() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data) => journalApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('journal.entryCreated'))
    },
    onError: (err) => {
      toast.error(err?.message || t('common.somethingWentWrong'))
    },
  })
}

export function useUpdateJournal() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }) => journalApi.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success(t('journal.entryUpdated'))
    },
    onError: (err) => {
      toast.error(err?.message || t('common.somethingWentWrong'))
    },
  })
}

export function usePostJournal() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id) => journalApi.post(id).then((r) => r.data),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success(t('journal.entryPosted'))
    },
    onError: (err) => {
      toast.error(err?.message || t('common.somethingWentWrong'))
    },
  })
}

export function useReverseJournal() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id) => journalApi.reverse(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('journal.entryReversed'))
    },
    onError: (err) => {
      toast.error(err?.message || t('common.somethingWentWrong'))
    },
  })
}

export function useDeleteJournal() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id) => journalApi.remove(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(t('journal.entryDeleted'))
    },
    onError: (err) => {
      toast.error(err?.message || t('common.somethingWentWrong'))
    },
  })
}
