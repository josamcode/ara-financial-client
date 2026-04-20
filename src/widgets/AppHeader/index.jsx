import { useTranslation } from 'react-i18next'
import { Menu, Globe, ChevronDown, LogOut, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/shared/utils/cn'
import { useAuth } from '@/entities/auth/model/useAuth'
import { LANGUAGES } from '@/shared/constants/app'
import toast from 'react-hot-toast'

function UserMenu({ user, onLogout }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors',
          'hover:bg-gray-100 text-text-primary'
        )}
      >
        <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate font-medium">
          {user?.name}
        </span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      {open && (
        <div className="absolute end-0 mt-1 w-48 bg-surface rounded-lg border border-border shadow-dropdown z-50 py-1 animate-slide-up">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
          >
            <User size={14} />
            {t('nav.profile')}
          </button>
          <button
            onClick={() => { setOpen(false); onLogout() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-soft transition-colors"
          >
            <LogOut size={14} />
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  )
}

function LanguageToggle() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  function switchLanguage(lang) {
    i18n.changeLanguage(lang.code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
        aria-label="Change language"
      >
        <Globe size={15} />
        <span className="hidden sm:block">{current.label}</span>
      </button>
      {open && (
        <div className="absolute end-0 mt-1 w-36 bg-surface rounded-lg border border-border shadow-dropdown z-50 py-1 animate-slide-up">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang)}
              className={cn(
                'w-full flex items-center px-3 py-2 text-sm transition-colors',
                lang.code === i18n.language
                  ? 'text-primary font-medium bg-primary-50'
                  : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function AppHeader({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  async function handleLogout() {
    await logout()
    toast.success(t('auth.logoutSuccess'))
  }

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-4 gap-3 shrink-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md text-text-muted hover:bg-gray-100 hover:text-text-primary transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <LanguageToggle />
        <UserMenu user={user} onLogout={handleLogout} />
      </div>
    </header>
  )
}
