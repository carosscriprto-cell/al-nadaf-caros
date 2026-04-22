'use client';

import { cn } from '@/components/ui/utils';

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-muted/80 animate-pulse',
        "before:absolute before:inset-y-0 before:left-[-30%] before:w-[30%] before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] before:content-['']",
        className
      )}
    />
  );
}
