import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--gold)] text-[var(--bg)]',
        secondary: 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]',
        jiu: 'bg-[color-mix(in_srgb,var(--blue)_20%,transparent)] text-[var(--blue)] border border-[color-mix(in_srgb,var(--blue)_40%,transparent)]',
        home: 'bg-[color-mix(in_srgb,var(--green)_20%,transparent)] text-[var(--green)] border border-[color-mix(in_srgb,var(--green)_40%,transparent)]',
        namorada: 'bg-[color-mix(in_srgb,var(--rose)_20%,transparent)] text-[var(--rose)] border border-[color-mix(in_srgb,var(--rose)_40%,transparent)]',
        livre: 'bg-[color-mix(in_srgb,var(--green)_20%,transparent)] text-[var(--green)] border border-[color-mix(in_srgb,var(--green)_40%,transparent)]',
        missa: 'bg-[color-mix(in_srgb,var(--gold-light)_20%,transparent)] text-[var(--gold-light)] border border-[color-mix(in_srgb,var(--gold-light)_40%,transparent)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
