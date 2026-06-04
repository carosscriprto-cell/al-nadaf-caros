'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFilterParams } from './useFilterParams';

import type { PriceRange, VehicleFilterState } from '@/types/vehicles';
import useDebouncedValue from '@/hooks/useDebouncedValue';

export function useVehicleFilters(maxPrice: number) {
  const { get, getMulti, setSingle, toggleMulti, update, clear, isPending } =
    useFilterParams();

  const urlSearch = get('search');
  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(search, 350);
  const lastSearchRef = useRef(urlSearch);

  const urlMin = Number(get('minPrice')) || 0;
  const urlMax = Number(get('maxPrice')) || maxPrice;
  const [priceRange, setPriceRange] = useState<PriceRange>([urlMin, urlMax]);

  // Sync search from URL → local state
  useEffect(() => {
    if (urlSearch !== lastSearchRef.current) {
      lastSearchRef.current = urlSearch;
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  // Commit debounced search to URL
  useEffect(() => {
    if (debouncedSearch === lastSearchRef.current) return;
    lastSearchRef.current = debouncedSearch;
    setSingle('search', debouncedSearch);
  }, [debouncedSearch, setSingle]);

  // Sync price range from URL → local state
  useEffect(() => {
    setPriceRange((current) => {
      const clamped: PriceRange = [
        Math.max(0, Math.min(urlMin, maxPrice)),
        Math.max(0, Math.min(urlMax, maxPrice)),
      ];
      return current[0] === clamped[0] && current[1] === clamped[1]
        ? current
        : clamped;
    });
  }, [urlMin, urlMax, maxPrice]);

  const commitPriceRange = useCallback(
    (range: PriceRange) =>
      update((d) => {
        range[0] <= 0 ? d.delete('minPrice') : d.set('minPrice', String(range[0]));
        range[1] >= maxPrice ? d.delete('maxPrice') : d.set('maxPrice', String(range[1]));
      }),
    [update, maxPrice]
  );

  const clearAll = useCallback(() => {
    setSearch('');
    lastSearchRef.current = '';
    setPriceRange([0, maxPrice]);
    clear();
  }, [clear, maxPrice]);

  const filterState: VehicleFilterState = {
    search: get('search'),
    brand: getMulti('brand'),
    category: getMulti('category'),
    transmission: getMulti('transmission'),
    fuelType: get('fuelType'),
    class: get('class'),
    condition: get('condition'),
    seats: get('seats'),
    minPrice: Number(get('minPrice')) || null,
    maxPrice: Number(get('maxPrice')) || null,
    delivery: get('delivery') === 'true',
  };

  return {
    // local UI state
    search,
    setSearch,
    priceRange,
    setPriceRange,
    commitPriceRange,
    // URL-derived state
    filterState,
    // param setters
    setSingle,
    toggleMulti,
    clearAll,
    isPending,
    // active count helper
    activeCount: Object.values(filterState).filter(Boolean).length,
  };
}