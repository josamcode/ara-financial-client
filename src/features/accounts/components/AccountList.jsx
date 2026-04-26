import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { AccountTypeBadge } from './AccountTypeBadge'
import { Badge } from '@/shared/components/Badge'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { formatAccountingAmount } from '@/shared/utils/formatters'
import { getAccountDisplayName } from '@/entities/account/lib/accountName'

export function AccountList({ accounts, onEdit, onDelete, onToggleActive }) {
  const { t, i18n } = useTranslation()

  if (!accounts?.length) return null

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-subtle">
        <span className="text-xs font-semibold text-text-muted w-16">{t('accounts.code')}</span>
        <span className="text-xs font-semibold text-text-muted">{t('accounts.name')}</span>
        <span className="text-xs font-semibold text-text-muted w-24 hidden sm:block">{t('accounts.type')}</span>
        <span className="text-xs font-semibold text-text-muted w-28 text-end hidden md:block">{t('accounts.balance')}</span>
        <span className="text-xs font-semibold text-text-muted w-16 text-center hidden sm:block">{t('common.status')}</span>
        <span className="w-16" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {accounts.map((account) => (
          <div
            key={account._id}
            className={cn(
              'group grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors',
              !account.isActive && 'opacity-55'
            )}
          >
            <span className="text-xs font-mono text-gray-400 w-16 truncate">
              {account.code}
            </span>

            <span className="text-sm font-medium text-text-primary truncate">
              {getAccountDisplayName(account, i18n.language)}
            </span>

            <span className="hidden sm:block w-24">
              <AccountTypeBadge type={account.type} size="sm" />
            </span>

            <span className="text-xs text-text-secondary w-28 text-end hidden md:block tabular-nums">
              {account.balance !== undefined && account.balance !== null
                ? formatAccountingAmount(account.balance)
                : '—'}
            </span>

            <span className="hidden sm:flex justify-center w-16">
              <Badge variant={account.isActive ? 'success' : 'default'} size="sm">
                {t(account.isActive ? 'common.active' : 'common.inactive')}
              </Badge>
            </span>

            <div className="flex items-center justify-end gap-0.5 w-16 opacity-0 group-hover:opacity-100 transition-opacity">
              <PermissionGate permission={PERMISSIONS.ACCOUNT_UPDATE}>
                <button
                  onClick={() => onEdit?.(account)}
                  title={t('common.edit')}
                  className="p-1.5 rounded text-gray-400 hover:text-text-primary hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onToggleActive?.(account)}
                  title={account.isActive ? t('accounts.deactivate') : t('accounts.activate')}
                  className="p-1.5 rounded text-gray-400 hover:text-text-primary hover:bg-gray-100 transition-colors"
                >
                  {account.isActive ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                </button>
              </PermissionGate>
              <PermissionGate permission={PERMISSIONS.ACCOUNT_DELETE}>
                <button
                  onClick={() => onDelete?.(account)}
                  title={t('accounts.deleteAccount')}
                  className="p-1.5 rounded text-gray-400 hover:text-error hover:bg-error-soft transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </PermissionGate>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
