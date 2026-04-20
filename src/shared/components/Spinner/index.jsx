import { cn } from '@/shared/utils/cn'

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
  xl: 'w-14 h-14 border-4',
}

export function Spinner({ size = 'md', className }) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={cn(
        'inline-block rounded-full border-gray-200 border-t-primary animate-spin',
        sizeMap[size],
        className
      )}
    />
  )
}
