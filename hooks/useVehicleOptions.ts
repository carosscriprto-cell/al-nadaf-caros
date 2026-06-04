'use client';

import { useMemo } from 'react';

import type { Car, PageListingType } from '@/types/vehicles';
import { deriveVehicleOptions } from '@/lib/vehicles/options';

/**
 * Derives all filter/select option lists from a cars array.
 * Single pass — no redundant iteration.
 */
export function useVehicleOptions(cars: Car[], type: PageListingType = 'all') {
  return useMemo(() => deriveVehicleOptions(cars, type), [cars, type]);
}