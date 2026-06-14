import type { Car } from '@/types/vehicles';

/**
 * Discriminated union return type for car pricing.
 *
 * Architecture doc § 12.2 — replaces the plain { main, secondary } object
 * in the original getCarPrice.ts. Consumers can narrow on `type` and get
 * fully typed access to the relevant fields with no null-checks needed.
 *
 * Before:
 *   const price = getCarPrice(car, 'rent');
 *   price.main   // number | undefined — caller must null-check
 *
 * After:
 *   const price = getCarPrice(car, 'rent');
 *   if (price.type === 'rent') price.daily  // number — guaranteed
 */
export type CarPriceResult =
  | { type: 'rent'; daily: number; weekly: number | null }
  | { type: 'sale'; total: number; oldPrice: number | null }
  | { type: 'unavailable' };

export function getCarPrice(car: Car, mode: 'rent' | 'sale'): CarPriceResult {
  if (mode === 'rent') {
    if (!car.pricing.daily) return { type: 'unavailable' };
    return {
      type: 'rent',
      daily: car.pricing.daily,
      weekly: car.pricing.weekly ?? null,
    };
  }

  if (!car.pricing.total) return { type: 'unavailable' };
  return {
    type: 'sale',
    total: car.pricing.total,
    oldPrice: car.pricing.oldPrice ?? null,
  };
}

export function formatMoney(value: number): string {
  return `$${value.toLocaleString()}`;
}