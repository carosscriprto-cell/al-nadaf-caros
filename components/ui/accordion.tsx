'use client';

import * as React from 'react';
import { cn } from './utils';

type AccordionProps = React.HTMLAttributes<HTMLDivElement>;

type AccordionItemProps = React.DetailsHTMLAttributes<HTMLDetailsElement>;

type AccordionTriggerProps = React.HTMLAttributes<HTMLElement>;

type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

export function Accordion({ className, children, ...props }: AccordionProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function AccordionItem({ className, children, ...props }: AccordionItemProps) {
  return (
    <details
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-background/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl',
        className
      )}
      {...props}
    >
      {children}
    </details>
  );
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <summary
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      {...props}
    >
      {children}
    </summary>
  );
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <div className={cn('border-t border-border/60 px-4 py-4', className)} {...props}>
      {children}
    </div>
  );
}
