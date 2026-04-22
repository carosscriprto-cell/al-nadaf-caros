'use client';

import Skeleton from '@/components/ui/skeleton';

export default function CarCardSkeleton() {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <Skeleton className="h-60 rounded-none rounded-t-2xl" />

      <div className="flex flex-1 flex-col px-5 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
          <Skeleton className="h-8 w-12 rounded-full" />
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/8 bg-muted p-2"
            >
              <Skeleton className="mx-auto h-4 w-4 rounded-full" />
              <Skeleton className="mx-auto mt-2 h-2.5 w-10 rounded-full" />
              <Skeleton className="mx-auto mt-2 h-4 w-12 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="mb-3 flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-6 w-20 rounded-full"
            />
          ))}
        </div>

        <div className="mb-4 rounded-3xl border border-white/8 bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-3">
          <Skeleton className="h-2.5 w-24 rounded-full" />
          <Skeleton className="mt-3 h-8 w-32 rounded-xl" />
        </div>

        <div className="mt-auto space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-2xl" />
            <Skeleton className="h-11 rounded-2xl" />
          </div>
          <Skeleton className="h-11 rounded-2xl" />
        </div>
      </div>
    </article>
  );
}
