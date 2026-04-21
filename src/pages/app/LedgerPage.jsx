import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { BookMarked, Search, ChevronRight } from 'lucide-react'
import { useAccountList } from '@/features/accounts/hooks/useAccounts'
import { AccountTypeBadge } from '@/features/accounts/components/AccountTypeBadge'
import { PageHeader } from '@/shared/components/PageHeader'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { ROUTES } from '@/shared/constants/routes'

const PAGE_SIZE = 20

export default function LedgerPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const listQuery = useAccountList(
    {
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      isActive: true,
      isParentOnly: false,
    },
    { paginated: true }
  )

  const accounts = listQuery.data?.accounts || []
  const pagination = listQuery.data?.pagination

  const isAr = i18n.language === 'ar'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.ledger')}
        subtitle={t('ledger.selectAccountMessage')}
      />

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search
          size={14}
          className="absolute inset-y-0 start-3 my-auto text-text-muted pointer-events-none"
        />
        <input
          type="search"
          placeholder={t('ledger.searchAccounts')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="h-input w-full rounded-md border border-input bg-surface ps-9 pe-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-focus"
        />
      </div>

      {listQuery.isLoading && <LoadingState message={t('common.loading')} />}

      {listQuery.isError && (
        <ErrorState
          title={t('common.somethingWentWrong')}
          onRetry={() => listQuery.refetch()}
        />
      )}

      {!listQuery.isLoading && !listQuery.isError && accounts.length === 0 && (
        <EmptyState
          icon={BookMarked}
          title={t('ledger.emptyTitle')}
          message={t('ledger.emptyMessage')}
        />
      )}

      {!listQuery.isLoading && !listQuery.isError && accounts.length > 0 && (
        <>
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-[7rem_1fr_8rem_2rem] items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-subtle">
              <span className="text-xs font-semibold text-text-muted">{t('ledger.accountCode')}</span>
              <span className="text-xs font-semibold text-text-muted">{t('ledger.accountName')}</span>
              <span className="text-xs font-semibold text-text-muted">{t('ledger.accountType')}</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {accounts.map((account) => (
                <button
                  key={account._id}
                  type="button"
                  onClick={() => navigate(ROUTES.LEDGER_ACCOUNT(account._id))}
                  className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[7rem_1fr_8rem_2rem] items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors text-start group"
                >
                  <span className="text-xs font-mono text-text-muted">{account.code}</span>

                  <span className="text-sm font-medium text-text-primary truncate">
                    {isAr ? account.nameAr : account.nameEn}
                    <span className="text-xs text-text-muted ms-2 hidden sm:inline">
                      {isAr ? account.nameEn : account.nameAr}
                    </span>
                  </span>

                  <span className="hidden sm:block">
                    <AccountTypeBadge type={account.type} />
                  </span>

                  <ChevronRight
                    size={14}
                    className="text-text-muted group-hover:text-primary transition-colors shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
