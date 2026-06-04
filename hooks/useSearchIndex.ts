'use client';

import { useMemo } from 'react';
import { createSearch } from '@/lib/search/createSearch';
import type { SearchableCar } from '@/lib/search/types';

/**
 * Builds a Fuse.js search index and memoizes it for the lifetime of the
 * component. The index is only rebuilt when the `cars` reference changes.
 *
 * Pass the returned index into searchVehicles() to avoid the O(n) rebuild
 * that happens when the optional `search` argument is omitted.
 *
 * Before (searchVehicles.ts line 206):
 *   const activeSearch = search ?? createSearch(cars);  ← rebuilt every call
 *
 * After:
 *   const index = useSearchIndex(searchableCars);
 *   searchVehicles({ cars, query, search: index });     ← never rebuilt
 */
export function useSearchIndex(cars: SearchableCar[]) {
  return useMemo(() => createSearch(cars), [cars]);
}