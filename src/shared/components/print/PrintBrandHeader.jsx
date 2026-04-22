import { cn } from '@/shared/utils/cn'

export function PrintBrandHeader({
  tenant,
  companyName,
  title,
  subtitle,
  isRtl = false,
}) {
  return (
    <div
      className={cn(
        'print-keep-together mb-10 flex items-start justify-between gap-8',
        isRtl && 'flex-row-reverse'
      )}
    >
      <div className="max-w-[58%] flex-1 text-start">
        <div className={cn('flex items-start gap-4', isRtl && 'flex-row-reverse')}>
          {tenant?.logoUrl && (
            <img
              src={tenant.logoUrl}
              alt={companyName}
              className="h-16 w-auto max-w-[112px] flex-shrink-0 object-contain"
            />
          )}

          <div className="min-w-0">
            <p className="break-words text-xl font-bold leading-tight text-gray-900">
              {companyName}
            </p>

            {(tenant?.companyEmail || tenant?.companyPhone || tenant?.companyAddress) && (
              <div className="mt-3 space-y-1.5 text-sm text-gray-500">
                {tenant?.companyEmail && (
                  <p className="break-all">
                    <span dir="ltr">{tenant.companyEmail}</span>
                  </p>
                )}
                {tenant?.companyPhone && (
                  <p>
                    <span dir="ltr">{tenant.companyPhone}</span>
                  </p>
                )}
                {tenant?.companyAddress && (
                  <p className="whitespace-pre-line break-words">{tenant.companyAddress}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[40%] flex-shrink-0 text-end">
        <p className="text-4xl font-extrabold leading-none tracking-widest text-primary-700">
          {title}
        </p>
        {subtitle && (
          <p className="mt-3 break-words text-sm font-semibold tracking-wide text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
