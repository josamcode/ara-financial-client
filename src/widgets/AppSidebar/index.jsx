import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BookMarked,
  BarChart2,
  Calendar,
  Users,
  ScrollText,
  Settings,
  X,
  Receipt,
  Contact,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { ROUTES } from '@/shared/constants/routes'
import { PERMISSIONS } from '@/shared/constants/permissions'
import { useAuth } from '@/entities/auth/model/useAuth'
import { hasPermission } from '@/shared/constants/permissions'
import { APP_NAME } from '@/shared/constants/app'

const navGroups = [
  {
    items: [
      {
        key: 'dashboard',
        label: 'nav.dashboard',
        icon: LayoutDashboard,
        to: ROUTES.DASHBOARD,
        permission: null,
      },
    ],
  },
  {
    label: 'nav.accounting',
    items: [
      {
        key: 'accounts',
        label: 'nav.accounts',
        icon: BookOpen,
        to: ROUTES.ACCOUNTS,
        permission: PERMISSIONS.ACCOUNT_READ,
      },
      {
        key: 'journal',
        label: 'nav.journalEntries',
        icon: FileText,
        to: ROUTES.JOURNAL,
        permission: PERMISSIONS.JOURNAL_READ,
      },
      {
        key: 'ledger',
        label: 'nav.ledger',
        icon: BookMarked,
        to: ROUTES.LEDGER,
        permission: PERMISSIONS.REPORT_VIEW,
      },
    ],
  },
  {
    label: 'nav.billing',
    items: [
      {
        key: 'customers',
        label: 'nav.customers',
        icon: Contact,
        to: ROUTES.CUSTOMERS,
        permission: PERMISSIONS.CUSTOMER_READ,
      },
      {
        key: 'suppliers',
        label: 'nav.suppliers',
        icon: Briefcase,
        to: ROUTES.SUPPLIERS,
        permission: PERMISSIONS.SUPPLIER_READ,
      },
      {
        key: 'invoices',
        label: 'nav.invoices',
        icon: Receipt,
        to: ROUTES.INVOICES,
        permission: PERMISSIONS.INVOICE_READ,
      },
      {
        key: 'bills',
        label: 'nav.bills',
        icon: FileText,
        to: ROUTES.BILLS,
        permission: PERMISSIONS.BILL_READ,
      },
    ],
  },
  {
    label: 'nav.finance',
    items: [
      {
        key: 'reports',
        label: 'nav.reports',
        icon: BarChart2,
        to: ROUTES.REPORTS,
        permission: PERMISSIONS.REPORT_VIEW,
      },
      {
        key: 'fiscalPeriods',
        label: 'nav.fiscalPeriods',
        icon: Calendar,
        to: ROUTES.FISCAL_PERIODS,
        permission: PERMISSIONS.FISCAL_READ,
      },
    ],
  },
  {
    label: 'nav.system',
    items: [
      {
        key: 'users',
        label: 'nav.users',
        icon: Users,
        to: ROUTES.USERS,
        permission: PERMISSIONS.USER_READ,
      },
      {
        key: 'auditLogs',
        label: 'nav.auditLogs',
        icon: ScrollText,
        to: ROUTES.AUDIT_LOGS,
        permission: PERMISSIONS.AUDIT_READ,
      },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: Settings,
        to: ROUTES.SETTINGS,
        permission: null,
      },
    ],
  },
]

function NavItem({ item }) {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (item.permission && !hasPermission(user, item.permission)) return null

  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.DASHBOARD}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      <item.icon size={16} className="shrink-0" />
      <span>{t(item.label)}</span>
    </NavLink>
  )
}

export function AppSidebar({ isOpen, onClose }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const mobileHiddenTransform = isRTL ? 'translate-x-full' : '-translate-x-full'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-64 flex-col bg-surface border-e border-border',
          'transition-transform duration-300 ease-smooth',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : mobileHiddenTransform
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <img src='/logo.jpg' className='rounded-sm' />
            </div>
            <span className="text-base font-bold text-text-primary">{APP_NAME}</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-6">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {t(group.label)}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <NavItem item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
