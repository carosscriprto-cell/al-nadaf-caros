'use client';

import * as React from 'react';
import { cn } from './utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'active' | 'outline';
};

const badgeStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-background/80 text-muted-foreground border border-border/60',
  active: 'bg-accent/15 text-accent border border-accent/30',
  outline: 'bg-transparent text-foreground border border-border/60',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
        badgeStyles[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';
