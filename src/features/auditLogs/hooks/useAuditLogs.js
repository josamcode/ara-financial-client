import { useQuery } from '@tanstack/react-query'
import { auditApi } from '@/entities/audit/api/auditApi'

const KEYS = {
  list: (params) => ['auditLogs', 'list', params],
}

export function useAuditLogs(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () =>
      auditApi.list(params).then((response) => ({
        logs: response?.data || [],
        pagination: response?.meta?.pagination ?? null,
      })),
    keepPreviousData: true,
  })
}
