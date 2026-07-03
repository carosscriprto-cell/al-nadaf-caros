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

// Tenant-currency-aware money formatter. Replaces the old hardcoded-`$`
// formatMoney so every price on a card reflects car.pricing.currency (the
// storefront is multi-tenant; not every dealer prices in USD).
export function formatPrice(
  value: number,
  currency: string = 'USD',
  locale: string = 'en',
): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}