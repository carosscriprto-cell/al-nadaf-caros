'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import Skeleton from '@/components/ui/skeleton';

type UiLoadingContextValue = {
  startRouteLoading: (minDuration?: number) => void;
  startThemeLoading: (duration?: number) => void;
};

type LoadingState =
  | {
      mode: 'route' | 'theme';
      startedAt: number;
      minDuration: number;
      routeKey: string;
    }
  | null;

const UiLoadingContext = createContext<UiLoadingContextValue | null>(
  null
);

function GlobalSkeletonOverlay({ mode }: { mode: 'route' | 'theme' }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] bg-background/72 backdrop-blur-[2px]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/70 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="hidden h-10 w-28 rounded-xl md:block" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 rounded-[2rem] border border-border/50 bg-card/60 p-6 backdrop-blur-xl">
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-4/5 rounded-full" />
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-20 rounded-2xl"
                />
              ))}
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/50 bg-card/60 p-6 backdrop-blur-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-12 rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>

        {mode === 'theme' && (
          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-xl">
            <Skeleton className="h-3 w-48 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function UiLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const timeoutRef = useRef<number | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    null
  );

  const clearScheduledHide = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideWithMinimum = useCallback(
    (startedAt: number, minDuration: number) => {
      clearScheduledHide();

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minDuration - elapsed);

      timeoutRef.current = window.setTimeout(() => {
        setLoadingState((current) =>
          current?.startedAt === startedAt ? null : current
        );
        timeoutRef.current = null;
      }, remaining);
    },
    [clearScheduledHide]
  );

  const startRouteLoading = useCallback(
    (minDuration = 400) => {
      clearScheduledHide();
      const startedAt = Date.now();
      setLoadingState({
        mode: 'route',
        startedAt,
        minDuration,
        routeKey,
      });

      timeoutRef.current = window.setTimeout(() => {
        setLoadingState((current) =>
          current?.startedAt === startedAt ? null : current
        );
        timeoutRef.current = null;
      }, 2500);
    },
    [clearScheduledHide, routeKey]
  );

  const startThemeLoading = useCallback(
    (duration = 180) => {
      clearScheduledHide();
      const startedAt = Date.now();
      setLoadingState({
        mode: 'theme',
        startedAt,
        minDuration: duration,
        routeKey,
      });
      hideWithMinimum(startedAt, duration);
    },
    [clearScheduledHide, hideWithMinimum, routeKey]
  );

  useEffect(() => {
    if (
      loadingState?.mode === 'route' &&
      loadingState.routeKey !== routeKey
    ) {
      hideWithMinimum(
        loadingState.startedAt,
        loadingState.minDuration
      );
    }
  }, [hideWithMinimum, loadingState, routeKey]);

  useEffect(() => {
    return () => clearScheduledHide();
  }, [clearScheduledHide]);

  const value = useMemo(
    () => ({
      startRouteLoading,
      startThemeLoading,
    }),
    [startRouteLoading, startThemeLoading]
  );

  return (
    <UiLoadingContext.Provider value={value}>
      {children}
      {loadingState && (
        <GlobalSkeletonOverlay mode={loadingState.mode} />
      )}
    </UiLoadingContext.Provider>
  );
}

export function useUiLoading() {
  const context = useContext(UiLoadingContext);

  if (!context) {
    throw new Error(
      'useUiLoading must be used within UiLoadingProvider'
    );
  }

  return context;
}
