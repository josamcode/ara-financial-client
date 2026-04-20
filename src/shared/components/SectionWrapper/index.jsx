import { cn } from '@/shared/utils/cn'

export function SectionWrapper({ title, subtitle, actions, children, className }) {
  return (
    <section className={cn('', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
