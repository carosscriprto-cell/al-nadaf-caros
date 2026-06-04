'use client';

import { useMemo, useState } from 'react';
import { cars } from '@/data/cars';
import { prepareCarsForSearch } from '@/lib/search/buildIndex';
import { searchVehicles } from '@/lib/search/searchVehicles';
import { deriveVehicleOptions } from '@/lib/vehicles/options';
import {
  matchesListingType,
  type PageListingType,
} from '@/lib/vehicles/listingType';

import useDebouncedValue from '@/hooks/useDebouncedValue';
import { useSearchIndex } from './useSearchIndex';

const searchableCars = prepareCarsForSearch(cars, {}, {});

const HERO_RESULT_LIMIT = 6;

export type HeroFilterState = {
  query: string;
  brand: string;
  model: string;
  fuelType: string;
  listingType: string;
};

export function useHeroSearch(pageType: PageListingType = 'all') {
  const [filters, setFilters] = useState<HeroFilterState>({
    query: '',
    brand: '',
    model: '',
    fuelType: '',
    listingType: pageType === 'all' ? '' : pageType,
  });

  /**
   * Dropdown visibility is now independent
   * from filter state.
   */
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(filters.query, 250);

  const searchIndex = useSearchIndex(searchableCars);

  const allOptions = useMemo(
    () => deriveVehicleOptions(cars, pageType),
    [pageType]
  );

  const modelOptions = useMemo(() => {
    if (!filters.brand) {
      return allOptions.modelOptions;
    }

    return allOptions.modelOptions.filter((opt) =>
      cars.some(
        (c) =>
          c.brand === filters.brand &&
          c.model === opt.value
      )
    );
  }, [filters.brand, allOptions.modelOptions]);

  const results = useMemo(() => {
    const preScopedCars = searchableCars.filter((car) => {
      if (filters.brand && car.brand !== filters.brand) {
        return false;
      }

      if (filters.model && car.model !== filters.model) {
        return false;
      }

      if (
        filters.fuelType &&
        car.fuelType !== filters.fuelType
      ) {
        return false;
      }

      if (filters.listingType) {
        const type =
          filters.listingType as PageListingType;

        if (!matchesListingType(car, type)) {
          return false;
        }
      }

      return true;
    });

    return searchVehicles({
      cars: preScopedCars,
      query: debouncedQuery,
      search: searchIndex,
    }).slice(0, HERO_RESULT_LIMIT);
  }, [debouncedQuery, filters, searchIndex]);

  const setFilter = <
    K extends keyof HeroFilterState
  >(
    key: K,
    value: HeroFilterState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'brand'
        ? { model: '' }
        : {}),
    }));

    /**
     * Any interaction with filters
     * opens the dropdown.
     */
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const openDropdown = () => {
    setIsOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      brand: '',
      model: '',
      fuelType: '',
      listingType:
        pageType === 'all'
          ? ''
          : pageType,
    });

    setIsOpen(false);
  };

  return {
    filters,
    setFilter,

    results,

    isOpen,
    setIsOpen,

    openDropdown,
    closeDropdown,

    resetFilters,

    brandOptions: allOptions.brandOptions,
    modelOptions,
    fuelTypeOptions:
      allOptions.fuelTypeOptions,
  };
}