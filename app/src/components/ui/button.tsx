import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold-light)] shadow-sm',
        destructive: 'bg-[var(--rose)] text-[var(--text)] hover:opacity-90',
        outline: 'border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--surface)] hover:border-[var(--gold)]',
        secondary: 'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--card)]',
        ghost: 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]',
        link: 'text-[var(--gold)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-8 w-8 p-0',
        'icon-sm': 'h-6 w-6 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
