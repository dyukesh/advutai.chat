import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const selectVariants = cva(
  'flex h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20',
  {
    variants: {
      variant: {
        default: '',
        subtle: 'bg-slate-950/70',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, children, ...props }, ref) => (
    <select ref={ref} className={cn(selectVariants({ variant }), className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';
