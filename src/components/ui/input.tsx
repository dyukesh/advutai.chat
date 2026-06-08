import * as React from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
