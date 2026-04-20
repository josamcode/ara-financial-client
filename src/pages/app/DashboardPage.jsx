import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Scale,
} from 'lucide-react'
import { useAuth } from '@/entities/auth/model/useAuth'
import apiClient from '@/shared/api/client'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card } from '@/shared/components/Card'
import { LoadingCard } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { formatCurrency } from '@/shared/utils/formatters'

function StatCard({ label, value, icon: Icon, trend, isLoading }) {
  if (isLoading) return <LoadingCard />

  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon size={18} className="text-primary" />
        </div>
      </div>
      {trend !== undefined && (
        <p
          className={`mt-3 text-xs font-medium ${
            trend >= 0 ? 'text-success' : 'text-error'
          }`}
        >
          {trend >= 0 ? '+' : ''}
          {trend}%
        </p>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get('/dashboard'),
    retry: 1,
  })

  const summary = data?.data?.summary

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${t('dashboard.welcome')}، ${user?.name?.split(' ')[0] || ''}`}
        subtitle={t('dashboard.subtitle')}
      />

      {isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={refetch}
          className="py-10"
        />
      )}

      {!isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label={t('dashboard.totalAssets')}
            value={
              summary ? formatCurrency(summary.totalAssets, 'EGP') : '—'
            }
            icon={DollarSign}
            isLoading={isLoading}
          />
          <StatCard
            label={t('dashboard.totalLiabilities')}
            value={
              summary ? formatCurrency(summary.totalLiabilities, 'EGP') : '—'
            }
            icon={Scale}
            isLoading={isLoading}
          />
          <StatCard
            label={t('dashboard.totalRevenue')}
            value={
              summary ? formatCurrency(summary.totalRevenue, 'EGP') : '—'
            }
            icon={TrendingUp}
            isLoading={isLoading}
          />
          <StatCard
            label={t('dashboard.totalExpenses')}
            value={
              summary ? formatCurrency(summary.totalExpenses, 'EGP') : '—'
            }
            icon={TrendingDown}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}
