import { cn } from '@/shared/utils/cn'

export function PageHeader({ title, subtitle, actions, breadcrumbs, className }) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-gray-300">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-text-primary transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? 'text-text-secondary' : ''}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}
