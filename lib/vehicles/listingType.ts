import type { Car } from '@/data/cars';

export type PageListingType = 'rent' | 'sale' | 'all';

/**
 * Single source of truth for the listingType 'both' guard.
 * Replaces all ad-hoc checks scattered across useHeroSearch,
 * CarsFilters, CarCard, and getCarPrice.
 */
export function matchesListingType(
  car: Car,
  type: PageListingType
): boolean {
  if (type === 'all') return true;
  return car.listingType === type || car.listingType === 'both';
}

/**
 * Returns typed capability flags for a car.
 * Use this in CarCard instead of computing isRent / isSale / isBoth inline.
 */
export function getListingCapabilities(car: Car) {
  const canRent =
    car.listingType === 'rent' || car.listingType === 'both';
  const canBuy =
    car.listingType === 'sale' || car.listingType === 'both';
  return {
    canRent,
    canBuy,
    isBoth: canRent && canBuy,
  };
}