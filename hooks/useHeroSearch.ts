'use client';

import { useMemo, useState, useCallback } from 'react';

import { prepareCarsForSearch } from '@/lib/search/buildIndex';
import { searchVehicles } from '@/lib/search/searchVehicles';

import { deriveVehicleOptions } from '@/lib/vehicles/options';

import {
  matchesListingType,
  type PageListingType,
} from '@/lib/vehicles/listingType';

import useDebouncedValue from '@/hooks/useDebouncedValue';

// Canonical type — fuelType is FuelType | '', not string
import type { Car, CarContentMap, HeroFilterState } from '@/types/vehicles';

import { useSearchIndex } from './useSearchIndex';

const MIN_QUERY_LENGTH = 2;

const EMPTY_CONTENT: CarContentMap = {};

// ─── Hook ─────────────────────────────────────────────────────────────────
// cars + per-locale content are passed from the server (getAllCarsForSearch),
// replacing the old static `@/data/cars` import. The search index is built
// per-render-memoised from those props.

export function useHeroSearch(
  cars: Car[],
  pageType: PageListingType = 'all',
  contentAr: CarContentMap = EMPTY_CONTENT,
  contentEn: CarContentMap = EMPTY_CONTENT,
) {
  const searchableCars = useMemo(
    () => prepareCarsForSearch(cars, contentAr, contentEn),
    [cars, contentAr, contentEn],
  );
  const [filters, setFilters] = useState<HeroFilterState>({
    query: '',
    brand: '',
    model: '',
    fuelType: '',
    listingType: pageType === 'all' ? '' : pageType,
    condition: '',
    category: '',
    financing: false,
  });

  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(filters.query, 250);

  const searchIndex = useSearchIndex(searchableCars);

  const allOptions = useMemo(
    () => deriveVehicleOptions(cars, pageType),
    [cars, pageType],
  );

  const modelOptions = useMemo(() => {
    if (!filters.brand) return allOptions.modelOptions;

    return allOptions.modelOptions.filter((opt) =>
      cars.some((car) => car.brand === filters.brand && car.model === opt.value),
    );
  }, [cars, filters.brand, allOptions.modelOptions]);

  const hasQuery = filters.query.trim().length > 0;

  const hasFilters =
    !!filters.brand ||
    !!filters.model ||
    !!filters.fuelType ||
    !!filters.listingType ||
    !!filters.condition ||
    !!filters.category ||
    filters.financing;

  const shouldShowResults =
    debouncedQuery.trim().length >= MIN_QUERY_LENGTH || hasFilters;

  // Single predicate for the structured filters (brand ∩ model ∩ fuel ∩ type).
  // fuelType is compared case-insensitively so any casing drift in the stored
  // value vs the derived option value can't silently break the match.
  const passesStructuredFilters = useCallback(
    (car: Car) => {
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.model && car.model !== filters.model) return false;
      if (
        filters.fuelType &&
        String(car.fuelType).toLowerCase() !== String(filters.fuelType).toLowerCase()
      ) {
        return false;
      }
      if (
        filters.listingType &&
        !matchesListingType(car, filters.listingType as PageListingType)
      ) {
        return false;
      }
      if (filters.condition && car.condition !== filters.condition) return false;
      if (filters.category && car.category !== filters.category) return false;
      if (filters.financing && !car.isFinanceable) return false;
      return true;
    },
    [filters],
  );

  // The full inventory narrowed by the structured filters (no query, no price).
  // Used both as the search candidate set AND as the dropdown's curated-fallback
  // pool — so a zero-result filter (e.g. a fuel type) can never surface
  // unrelated cars from the unfiltered inventory.
  const filteredAllCars = useMemo(
    () => searchableCars.filter(passesStructuredFilters),
    [searchableCars, passesStructuredFilters],
  );

  const results = useMemo(() => {
    if (!shouldShowResults) return [];

    if (debouncedQuery.trim().length < MIN_QUERY_LENGTH) {
      // No slice here: the panel applies the price filter on top, and the
      // dropdown caps the final list. Slicing first would drop in-range cars
      // ranked beyond the cap (the price/filter over-exclusion bug).
      return filteredAllCars;
    }

    // The Fuse index spans the FULL inventory, so searchVehicles ignores the
    // pre-scoped subset when an index is passed. Re-apply the structured
    // filters to the search output so the text query intersects with
    // brand/model/fuel/type instead of bypassing them (BUG: filters not held).
    return searchVehicles({
      cars: filteredAllCars,
      query: debouncedQuery,
      search: searchIndex,
    }).filter(passesStructuredFilters);
  }, [debouncedQuery, filteredAllCars, passesStructuredFilters, searchIndex, shouldShowResults]);

  const hasResults = results.length > 0;

  const setFilter = useCallback(
    <K extends keyof HeroFilterState>(key: K, value: HeroFilterState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        ...(key === 'brand' ? { model: '' } : {}),
      }));
      setIsOpen(true);
    },
    [],
  );

  const openDropdown = useCallback(() => {
    const hasSearch = filters.query.trim().length >= MIN_QUERY_LENGTH;
    const hasActiveFilters =
      !!filters.brand || !!filters.model || !!filters.fuelType || !!filters.listingType;

    if (!hasSearch && !hasActiveFilters) return;
    setIsOpen(true);
  }, [filters]);

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const clearSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, query: '' }));
    if (!hasFilters) setIsOpen(false);
  }, [hasFilters]);

  const resetFilters = useCallback(() => {
    setFilters({
      query: '',
      brand: '',
      model: '',
      fuelType: '',
      listingType: pageType === 'all' ? '' : pageType,
      condition: '',
      category: '',
      financing: false,
    });
    setIsOpen(false);
  }, [pageType]);

  return {
    filters,
    setFilter,
    results,
    filteredAllCars,
    isOpen,
    setIsOpen,
    hasQuery,
    hasFilters,
    hasResults,
    shouldShowResults,
    openDropdown,
    closeDropdown,
    clearSearch,
    resetFilters,

    brandOptions: allOptions.brandOptions,
    modelOptions,
    fuelTypeOptions: allOptions.fuelTypeOptions,
    conditionOptions: allOptions.conditionOptions,
    // Body-type options come from car_category. We exclude 'electric' because it
    // is a fuel concept that leaked into the category enum and is pending the P3
    // remap (see guardCategory in lib/supabase/mappers.ts) — once the data is
    // remapped to a real fuel/category split this filter can be removed.
    categoryOptions: allOptions.categoryOptions.filter(
      (opt) => opt.value !== 'electric',
    ),
  };
}