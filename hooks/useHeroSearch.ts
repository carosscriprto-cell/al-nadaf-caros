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

const HERO_RESULT_LIMIT = 6;
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
    !!filters.listingType;

  const shouldShowResults =
    debouncedQuery.trim().length >= MIN_QUERY_LENGTH || hasFilters;

  const results = useMemo(() => {
    if (!shouldShowResults) return [];

    const preScopedCars = searchableCars.filter((car) => {
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.model && car.model !== filters.model) return false;
      if (filters.fuelType && car.fuelType !== filters.fuelType) return false;

      if (filters.listingType) {
        const type = filters.listingType as PageListingType;
        if (!matchesListingType(car, type)) return false;
      }

      return true;
    });

    if (debouncedQuery.trim().length < MIN_QUERY_LENGTH) {
      return preScopedCars.slice(0, HERO_RESULT_LIMIT);
    }

    return searchVehicles({
      cars: preScopedCars,
      query: debouncedQuery,
      search: searchIndex,
    }).slice(0, HERO_RESULT_LIMIT);
  }, [debouncedQuery, filters, searchIndex, shouldShowResults, searchableCars]);

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
    });
    setIsOpen(false);
  }, [pageType]);

  return {
    filters,
    setFilter,
    results,
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
  };
}