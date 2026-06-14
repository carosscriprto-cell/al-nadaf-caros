import type { Car } from '@/types/vehicles';
import { matchesListingType, type PageListingType } from './listingType';

export type FilterOption<T extends string = string> = {
  value: T;
  label: string;
};

export type VehicleFilterConfig = {
  brandOptions: FilterOption[];
  modelOptions: FilterOption[];
  categoryOptions: FilterOption[];
  classOptions: FilterOption[];
  fuelTypeOptions: FilterOption[];
  conditionOptions: FilterOption[];
  transmissionOptions: FilterOption[];
  seatsOptions: FilterOption[];
  priceMin: number;
  priceMax: number;
};

/**
 * Formats a raw enum/slug value into a human-readable label.
 * Handles hyphen-separated brands ("mercedes-benz" → "Mercedes Benz")
 * and underscore-separated values ("ultra_luxury" → "Ultra Luxury").
 *
 * Single implementation — replaces the duplicated capitalize/split-dash
 * logic in both useHeroSearch and CarsFilters.
 */
export function formatOptionLabel(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Derives all filter option arrays from a cars array in a single pass.
 *
 * Replaces the 7 separate useMemo calls in CarsFilters and the
 * redundant option arrays in useHeroSearch.
 *
 * @param cars  - Raw Car[] from cars.ts
 * @param type  - Page listing context; filters scoped cars accordingly
 */
export function deriveVehicleOptions(
  cars: Car[],
  type: PageListingType = 'all'
): VehicleFilterConfig {
  const scoped = type === 'all'
    ? cars
    : cars.filter((car) => matchesListingType(car, type));

  const brands = new Set<string>();
  const models = new Set<string>();
  const categories = new Set<string>();
  const classes = new Set<string>();
  const fuelTypes = new Set<string>();
  const conditions = new Set<string>();
  const seats = new Set<number>();
  let priceMin = Infinity;
  let priceMax = 0;

  for (const car of scoped) {
    brands.add(car.brand);
    models.add(car.model);
    categories.add(car.category);
    classes.add(car.class);
    fuelTypes.add(car.fuelType);
    conditions.add(car.condition);
    seats.add(car.seats);

    const price =
      type === 'sale'
        ? car.pricing.total
        : type === 'rent'
        ? car.pricing.daily
        : (car.pricing.daily ?? car.pricing.total);

    if (price != null && price > 0) {
      if (price < priceMin) priceMin = price;
      if (price > priceMax) priceMax = price;
    }
  }

  const toOptions = (set: Set<string>): FilterOption[] =>
    [...set].sort().map((v) => ({ value: v, label: formatOptionLabel(v) }));

  return {
    brandOptions: toOptions(brands),
    modelOptions: toOptions(models),
    categoryOptions: toOptions(categories),
    classOptions: toOptions(classes),
    fuelTypeOptions: toOptions(fuelTypes),
    conditionOptions: toOptions(conditions),
    transmissionOptions: [
      { value: 'automatic', label: 'Automatic' },
      { value: 'manual', label: 'Manual' },
    ],
    seatsOptions: [...seats]
      .sort((a, b) => a - b)
      .map((n) => ({ value: String(n), label: `${n}+ Seats` })),
    priceMin: priceMin === Infinity ? 0 : priceMin,
    priceMax: Math.max(priceMax, 500),
  };
}