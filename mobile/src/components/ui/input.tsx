import * as React from 'react'
import { cn } from '@/utils/cn'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1',
        'text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-200',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
