'use client';

import * as React from 'react';
import { cn } from './utils';

type SelectOption = string | { value: string; label: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  allLabel?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, allLabel = 'All', children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-12 w-full rounded-2xl border border-border bg-background/60 px-4 text-sm text-foreground outline-none transition-all duration-200 focus:ring-2 focus:ring-accent-foreground',
        className
      )}
      {...props}
    >
      {allLabel && <option value="all">{allLabel}</option>}
      {options.map((option) =>
        typeof option === 'string' ? (
          <option key={option} value={option}>
            {option}
          </option>
        ) : (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )
      )}
      {children}
    </select>
  )
);

Select.displayName = 'Select';
