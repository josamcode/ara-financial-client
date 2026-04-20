import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/utils/cn'
import { Spinner } from '@/shared/components/Spinner'

const SEARCH_THRESHOLD = 10

/**
 * Custom Select component.
 * Replaces native <select> with a styled, keyboard-navigable dropdown.
 * Automatically shows a search box when options.length > SEARCH_THRESHOLD.
 * Uses a React portal so the dropdown is never clipped by overflow:hidden containers.
 *
 * Props:
 *   value        – current selected value (string | number | null | undefined)
 *   onChange     – called with the new value (not a DOM event)
 *   options      – [{ value, label }]
 *   placeholder  – shown when nothing is selected
 *   label        – field label above the trigger
 *   error        – error message (shows red border + message below)
 *   hint         – helper text below (hidden when error is present)
 *   required     – adds asterisk to label
 *   disabled     – disables the control
 *   isLoading    – shows a spinner instead of the chevron
 *   className    – extra classes forwarded to the trigger button
 *   wrapperClassName – extra classes on the outer wrapper div
 */
export function Select({
  value,
  onChange,
  options = [],
  placeholder,
  label,
  error,
  hint,
  required = false,
  disabled = false,
  isLoading = false,
  className,
  wrapperClassName,
}) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [dropRect, setDropRect] = useState(null)
  const [dropAbove, setDropAbove] = useState(false)

  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)
  const listRef = useRef(null)

  const showSearch = options.length > SEARCH_THRESHOLD

  const filteredOptions = useMemo(() => {
    if (!showSearch || !search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((opt) => String(opt.label).toLowerCase().includes(q))
  }, [options, search, showSearch])

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value ?? '')),
    [options, value]
  )

  function measureAndOpen() {
    if (disabled || isLoading) return
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const spaceBelow = window.innerHeight - r.bottom
    setDropAbove(spaceBelow < 260 && r.top > spaceBelow)
    setDropRect(r)
    setSearch('')
    const idx = filteredOptions.findIndex((o) => String(o.value) === String(value ?? ''))
    setFocusedIndex(idx >= 0 ? idx : 0)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    setSearch('')
    setFocusedIndex(-1)
  }

  function selectOption(optValue) {
    onChange?.(optValue)
    close()
    triggerRef.current?.focus()
  }

  // Close on outside click (checks both trigger and portal dropdown)
  useEffect(() => {
    if (!isOpen) return

    function handleOutside(e) {
      const clickedTrigger = triggerRef.current?.contains(e.target)
      const clickedDropdown = dropdownRef.current?.contains(e.target)
      if (!clickedTrigger && !clickedDropdown) close()
    }

    // Close when the page scrolls (dropdown position would be stale)
    function handleScroll() {
      close()
    }

    document.addEventListener('mousedown', handleOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  // Auto-focus the search input on open
  useEffect(() => {
    if (isOpen && showSearch) {
      const id = setTimeout(() => searchRef.current?.focus(), 30)
      return () => clearTimeout(id)
    }
  }, [isOpen, showSearch])

  // Scroll the focused option into view
  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('[data-opt]')
    items[focusedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  function handleTriggerKeyDown(e) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        isOpen ? close() : measureAndOpen()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          measureAndOpen()
        } else {
          setFocusedIndex((i) => Math.min(i + 1, filteredOptions.length - 1))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) setFocusedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        close()
        break
      default:
        break
    }
  }

  function handleSearchKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((i) => Math.min(i + 1, filteredOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          selectOption(filteredOptions[focusedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        triggerRef.current?.focus()
        break
      case 'Tab':
        close()
        break
      default:
        break
    }
  }

  const dropdownStyle = dropRect
    ? {
        position: 'fixed',
        left: dropRect.left,
        width: dropRect.width,
        zIndex: 9999,
        ...(dropAbove
          ? { bottom: window.innerHeight - dropRect.top + 4 }
          : { top: dropRect.bottom + 4 }),
      }
    : {}

  const noResultsText = isAr ? 'لا توجد نتائج' : 'No results'
  const searchPlaceholderText = isAr ? 'بحث...' : 'Search...'

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ms-1">*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (isOpen ? close() : measureAndOpen())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'h-input w-full rounded-md border border-input bg-surface px-3',
          'flex items-center justify-between gap-2',
          'text-sm transition-colors duration-200',
          'focus:outline-none focus:border-primary focus:shadow-focus',
          'disabled:cursor-not-allowed disabled:opacity-60',
          isOpen && !error && 'border-primary shadow-focus',
          error && 'border-error',
          className
        )}
      >
        <span className={cn('truncate text-start flex-1', !selectedOption && 'text-text-muted')}>
          {selectedOption ? selectedOption.label : (placeholder ?? '')}
        </span>
        <span className="shrink-0 flex items-center">
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <ChevronDown
              size={15}
              className={cn(
                'text-text-muted transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          )}
        </span>
      </button>

      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}

      {isOpen &&
        dropRect &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-surface border border-border rounded-md shadow-lg overflow-hidden"
            // Prevent mousedown from stealing focus from the trigger
            onMouseDown={(e) => e.preventDefault()}
          >
            {showSearch && (
              <div className="p-1.5 border-b border-border">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute inset-y-0 start-2.5 my-auto text-text-muted pointer-events-none"
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setFocusedIndex(0)
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={searchPlaceholderText}
                    className="h-8 w-full rounded border border-input bg-surface-subtle ps-8 pe-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            <div ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-3 text-sm text-text-muted text-center">{noResultsText}</p>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value ?? '')
                  const isFocused = idx === focusedIndex
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-opt
                      onClick={() => selectOption(opt.value)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={cn(
                        'w-full text-start px-3 py-2 text-sm',
                        'flex items-center justify-between gap-2',
                        'transition-colors duration-100 cursor-default',
                        isSelected
                          ? 'bg-primary-50 text-primary font-medium'
                          : isFocused
                          ? 'bg-surface-muted text-text-primary'
                          : 'text-text-primary hover:bg-surface-muted'
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check size={13} className="shrink-0 text-primary" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
