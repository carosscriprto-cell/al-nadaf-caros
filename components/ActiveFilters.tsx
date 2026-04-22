'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Skeleton from '@/components/ui/skeleton';

type Props = {
  isLoading?: boolean;
};

export default function ActiveFilters({ isLoading = false }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const entries = Array.from(searchParams.entries()).filter(
    ([key, value]) =>
      value &&
      !['page', 'sort'].includes(key)
  );

  if (isLoading) {
    return (
      <div className="mb-4 flex min-h-8 flex-wrap items-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-8 w-24 rounded-full"
          />
        ))}
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
    );
  }

  if (entries.length === 0) return null;

  const remove = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      const current = params.get(key)?.split(',') || [];
      const updated = current.filter((v) => v !== value);

      if (!updated.length) params.delete(key);
      else params.set(key, updated.join(','));
    }

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const clearAll = () => {
    router.replace(pathname);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {entries.flatMap(([key, value]) =>
        value.split(',').map((v) => (
          <button
            key={`${key}-${v}`}
            onClick={() => remove(key, v)}
            className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-muted transition"
          >
            {v}
            <X size={12} />
          </button>
        ))
      )}

      <button
        onClick={clearAll}
        className="text-xs underline text-muted-foreground"
      >
        Clear all
      </button>
    </div>
  );
}
