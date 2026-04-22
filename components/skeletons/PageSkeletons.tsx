'use client';

import CarCardSkeleton from '@/components/skeletons/CarCardSkeleton';
import Skeleton from '@/components/ui/skeleton';

export function FeaturedCarsSectionSkeleton({
  cards = 3,
}: {
  cards?: number;
}) {
  return (
    <section className="relative overflow-hidden bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <Skeleton className="mx-auto h-12 w-72 rounded-2xl" />
          <Skeleton className="mx-auto mt-4 h-5 w-96 max-w-full rounded-full" />
          <Skeleton className="mx-auto mt-5 h-1 w-28 rounded-full" />
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-12 w-32 rounded-full"
            />
          ))}
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.45))] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-4 w-48 rounded-full" />
            </div>

            <div className="hidden gap-3 md:flex">
              <Skeleton className="h-11 w-11 rounded-full" />
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {Array.from({ length: cards }).map((_, index) => (
              <CarCardSkeleton key={index} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={`h-2.5 rounded-full ${
                    index === 0 ? 'w-8' : 'w-2.5'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3 md:hidden">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePageSkeleton() {
  return (
    <div>
      <section className="relative overflow-hidden rounded-4xl bg-muted/30 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-14 w-3/4 rounded-2xl" />
              <Skeleton className="h-5 w-11/12 rounded-full" />
              <Skeleton className="h-5 w-8/12 rounded-full" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="mt-3 h-4 w-20 rounded-full" />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-14 w-52 rounded-xl" />
              <Skeleton className="h-14 w-52 rounded-xl" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-border/60 bg-card/80 p-6 backdrop-blur-xl">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-xl" />
              ))}
            </div>
            <Skeleton className="mt-6 h-12 w-full rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto h-10 w-64 rounded-2xl" />
          <Skeleton className="mx-auto mt-4 h-5 w-72 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-xl"
            >
              <Skeleton className="mx-auto h-14 w-14 rounded-2xl" />
              <Skeleton className="mx-auto mt-4 h-4 w-16 rounded-full" />
              <Skeleton className="mx-auto mt-2 h-3 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <FeaturedCarsSectionSkeleton />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-xl"
            >
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <Skeleton className="mt-5 h-6 w-32 rounded-xl" />
              <Skeleton className="mt-4 h-4 w-full rounded-full" />
              <Skeleton className="mt-2 h-4 w-10/12 rounded-full" />
              <Skeleton className="mt-2 h-4 w-8/12 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FiltersPanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-11 w-full rounded-2xl" />

      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border-b border-border/40 pb-4"
        >
          <div className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: index === 0 ? 4 : 5 }).map((_, chipIndex) => (
              <Skeleton
                key={chipIndex}
                className="h-8 w-20 rounded-xl"
              />
            ))}
          </div>
        </div>
      ))}

      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full rounded-2xl" />
    </div>
  );
}

export function ListingPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="sticky top-24 hidden h-fit w-72 shrink-0 lg:block">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
              <FiltersPanelSkeleton />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 w-24 rounded-full"
                />
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between gap-4">
              <Skeleton className="h-8 w-52 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <CarCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border/60 bg-card/70 px-8 py-14 backdrop-blur-xl">
        <Skeleton className="h-12 w-72 rounded-2xl" />
        <Skeleton className="mt-5 h-5 w-full max-w-2xl rounded-full" />
        <Skeleton className="mt-3 h-5 w-10/12 max-w-xl rounded-full" />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl"
          >
            <Skeleton className="h-7 w-40 rounded-xl" />
            <Skeleton className="mt-5 h-4 w-full rounded-full" />
            <Skeleton className="mt-3 h-4 w-11/12 rounded-full" />
            <Skeleton className="mt-3 h-4 w-9/12 rounded-full" />
            <Skeleton className="mt-6 h-12 w-full rounded-2xl" />
          </div>
        ))}
      </section>
    </div>
  );
}
