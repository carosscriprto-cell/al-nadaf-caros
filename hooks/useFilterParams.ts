'use client';

import { useCallback, useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type ParamUpdater = (draft: URLSearchParams) => void;

export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const paramsString = searchParams.toString();

  const params = useMemo(() => new URLSearchParams(paramsString), [paramsString]);

  const get = useCallback((key: string) => params.get(key) ?? '', [params]);

  const getMulti = useCallback(
    (key: string) => get(key).split(',').filter(Boolean),
    [get]
  );

  // Batch multiple param updates into one router.replace call
  const update = useCallback(
    (updater: ParamUpdater) => {
      const next = new URLSearchParams(paramsString);
      updater(next);
      const nextQuery = next.toString();
      if (nextQuery === paramsString) return;
      startTransition(() => {
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, paramsString]
  );

  const setSingle = useCallback(
    (key: string, value: string) =>
      update((d) => (value ? d.set(key, value) : d.delete(key))),
    [update]
  );

    const toggleMulti = useCallback(
    (key: string, value: string) =>
        update((d) => {
        const current = (d.get(key) ?? '').split(',').filter(Boolean);
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];

        if (next.length) {
            d.set(key, next.join(','));
        } else {
            d.delete(key);
        }
        }),
    [update]
    );

  const clear = useCallback(
    () =>
      startTransition(() => router.replace(pathname, { scroll: false })),
    [pathname, router]
  );

  return { get, getMulti, setSingle, toggleMulti, update, clear, isPending };
}