import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export function ExportMenu({ onExport, isExporting, disabled }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const formats = [
    { key: 'csv', label: t('reports.exportCsv') },
    { key: 'excel', label: t('reports.exportExcel') },
    { key: 'pdf', label: t('reports.exportPdf') },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={disabled || isExporting}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 h-button-sm px-3 text-sm font-medium rounded-md border border-border bg-surface text-text-primary transition-colors',
          'hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50'
        )}
      >
        <Download size={14} />
        {isExporting ? t('common.loading') : t('common.export')}
        <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-10 end-0 mt-1 w-44 rounded-md border border-border bg-surface shadow-lg py-1">
          {formats.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setOpen(false)
                onExport(key)
              }}
              className="w-full text-start px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
