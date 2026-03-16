import * as React from 'react'
import { cn } from '@/utils/cn'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2',
        'text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]',
        'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        'transition-colors duration-200',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export { Textarea }
