'use client';

import * as React from 'react';
import { cn } from './utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-12 w-full rounded-2xl border border-border bg-background/60 px-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-accent-foreground',
        className
      )}
      {...props}
    />
  )
);

Input.displayName = 'Input';
