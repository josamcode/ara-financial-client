import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Plus, Pencil, Trash2, MoreHorizontal, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { AccountTypeBadge } from './AccountTypeBadge'
import { PermissionGate } from '@/shared/components/PermissionGate'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { formatAccountingAmount } from '@/shared/utils/formatters'
import { getAccountDisplayName } from '@/entities/account/lib/accountName'

function AccountTreeNode({ node, depth = 0, onEdit, onDelete, onAddChild, onToggleActive }) {
  const { t, i18n } = useTranslation()
  const [expanded, setExpanded] = useState(depth < 2)
  const [menuOpen, setMenuOpen] = useState(false)
  const hasChildren = node.children && node.children.length > 0
  const accountName = getAccountDisplayName(node, i18n.language)

  return (
    <div>
      {/* Row */}
      <div
        className={cn(
          'group flex items-center gap-2 py-2.5 px-3 rounded-md hover:bg-surface-muted transition-colors cursor-default',
          !node.isActive && 'opacity-55'
        )}
        style={{ paddingInlineStart: `${12 + depth * 20}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'w-4 h-4 flex items-center justify-center text-gray-400 shrink-0 transition-transform',
            hasChildren ? 'hover:text-gray-600' : 'pointer-events-none opacity-0',
            expanded && 'rotate-90'
          )}
          aria-label="Expand"
        >
          <ChevronRight size={13} />
        </button>

        {/* Code */}
        <span className="text-xs font-mono text-gray-400 w-14 shrink-0 select-none">
          {node.code}
        </span>

        {/* Name */}
        <span className="flex-1 text-sm font-medium text-text-primary truncate">
          {accountName}
        </span>

        {/* Type badge */}
        <AccountTypeBadge type={node.type} size="sm" className="hidden sm:inline-flex" />

        {/* Balance */}
        {node.balance !== undefined && node.balance !== null && (
          <span className="text-xs text-text-secondary w-24 text-end hidden md:block tabular-nums">
            {formatAccountingAmount(node.balance)}
          </span>
        )}

        {/* Actions — shown on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
            <button
              onClick={() => onAddChild?.(node)}
              title={t('accounts.addSubAccount')}
              className="p-1 rounded text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
            >
              <Plus size={13} />
            </button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.ACCOUNT_UPDATE}>
            <button
              onClick={() => onEdit?.(node)}
              title={t('common.edit')}
              className="p-1 rounded text-gray-400 hover:text-text-primary hover:bg-gray-100 transition-colors"
            >
              <Pencil size={13} />
            </button>
          </PermissionGate>
          <PermissionGate permission={[PERMISSIONS.ACCOUNT_UPDATE, PERMISSIONS.ACCOUNT_DELETE]}>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 rounded text-gray-400 hover:text-text-primary hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal size={13} />
              </button>
              {menuOpen && (
                <div
                  className="absolute end-0 top-full mt-0.5 w-44 bg-surface rounded-lg border border-border shadow-dropdown z-20 py-1 animate-slide-up"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <PermissionGate permission={PERMISSIONS.ACCOUNT_UPDATE}>
                    <button
                      onClick={() => { onToggleActive?.(node); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
                    >
                      {node.isActive
                        ? <><ToggleLeft size={14} /> {t('accounts.deactivate')}</>
                        : <><ToggleRight size={14} /> {t('accounts.activate')}</>
                      }
                    </button>
                  </PermissionGate>
                  <PermissionGate permission={PERMISSIONS.ACCOUNT_DELETE}>
                    <button
                      onClick={() => { onDelete?.(node); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-soft transition-colors"
                    >
                      <Trash2 size={14} /> {t('accounts.deleteAccount')}
                    </button>
                  </PermissionGate>
                </div>
              )}
            </div>
          </PermissionGate>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <AccountTreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AccountTree({ nodes, onEdit, onDelete, onAddChild, onToggleActive }) {
  const { t } = useTranslation()

  if (!nodes?.length) return null

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      {/* Column headers */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-subtle">
        <div className="w-4 shrink-0" />
        <span className="text-xs font-semibold text-text-muted w-14 shrink-0">{t('accounts.code')}</span>
        <span className="flex-1 text-xs font-semibold text-text-muted">{t('accounts.name')}</span>
        <span className="text-xs font-semibold text-text-muted hidden sm:block w-24">{t('accounts.type')}</span>
        <span className="text-xs font-semibold text-text-muted hidden md:block w-24 text-end">{t('accounts.balance')}</span>
        <div className="w-16 shrink-0" />
      </div>
      <div className="py-1">
        {nodes.map((node) => (
          <AccountTreeNode
            key={node._id}
            node={node}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </div>
  )
}
